import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

// Types for API responses
interface RugCheckRisk {
  name: string
  description: string
  level: string
  score: number
}

interface RugCheckReport {
  tokenMeta?: {
    name: string
    symbol: string
    uri: string
  }
  token?: string
  risks?: RugCheckRisk[]
  score?: number
  rugged?: boolean
  markets?: Array<{
    marketType: string
    lp?: {
      lpLockedUSD: number
      lpUnlockedUSD: number
    }
  }>
  topHolders?: Array<{
    address: string
    pct: number
    insider: boolean
  }>
  freezeAuthority?: string | null
  mintAuthority?: string | null
}

interface DexScreenerPair {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  baseToken: {
    address: string
    name: string
    symbol: string
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
  }
  priceNative: string
  priceUsd: string
  liquidity?: {
    usd: number
    base: number
    quote: number
  }
  fdv?: number
  marketCap?: number
  volume?: {
    h24: number
  }
  priceChange?: {
    h1: number
    h24: number
  }
}

async function fetchRugCheckData(mint: string): Promise<RugCheckReport | null> {
  try {
    const response = await fetch(`https://api.rugcheck.xyz/v1/tokens/${mint}/report`, {
      headers: { 'Accept': 'application/json' }
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error('[ClawdScan] RugCheck API error:', error)
    return null
  }
}

async function fetchDexScreenerData(mint: string): Promise<DexScreenerPair | null> {
  try {
    const response = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${mint}`, {
      headers: { 'Accept': 'application/json' }
    })
    if (!response.ok) return null
    const pairs = await response.json()
    // Return the first/main pair
    return Array.isArray(pairs) && pairs.length > 0 ? pairs[0] : null
  } catch (error) {
    console.error('[ClawdScan] DexScreener API error:', error)
    return null
  }
}

function determineRiskLevel(rugCheckData: RugCheckReport | null): 'high' | 'medium' | 'low' | 'clean' {
  if (!rugCheckData) return 'medium'

  // If already rugged, definitely high risk
  if (rugCheckData.rugged) return 'high'

  // Use RugCheck's score (lower is better, 0 = perfect)
  const score = rugCheckData.score ?? 0

  if (score >= 5000) return 'high'
  if (score >= 2000) return 'medium'
  if (score >= 500) return 'low'
  return 'clean'
}

function formatTokenData(rugCheck: RugCheckReport | null, dexScreener: DexScreenerPair | null) {
  const risks: string[] = []

  if (rugCheck?.risks) {
    rugCheck.risks.forEach(risk => {
      if (risk.level === 'danger' || risk.level === 'warn') {
        risks.push(`${risk.name}: ${risk.description}`)
      }
    })
  }

  // Check authorities
  if (rugCheck?.mintAuthority) {
    risks.push('Mint Authority enabled - Team can create unlimited tokens')
  }
  if (rugCheck?.freezeAuthority) {
    risks.push('Freeze Authority enabled - Team can freeze your tokens')
  }

  // Calculate top holder concentration
  const topHolderPct = rugCheck?.topHolders?.slice(0, 10).reduce((acc, h) => acc + h.pct, 0) ?? 0
  if (topHolderPct > 50) {
    risks.push(`Top 10 holders own ${topHolderPct.toFixed(1)}% of supply`)
  }

  return {
    name: rugCheck?.tokenMeta?.name || dexScreener?.baseToken?.name || 'Unknown',
    symbol: rugCheck?.tokenMeta?.symbol || dexScreener?.baseToken?.symbol || 'UNKNOWN',
    price: dexScreener?.priceUsd ? parseFloat(dexScreener.priceUsd) : 0,
    marketCap: dexScreener?.marketCap ?? dexScreener?.fdv ?? 0,
    liquidity: dexScreener?.liquidity?.usd ?? 0,
    volume24h: dexScreener?.volume?.h24 ?? 0,
    priceChange24h: dexScreener?.priceChange?.h24 ?? 0,
    riskScore: rugCheck?.score ?? 0,
    risks,
    rugged: rugCheck?.rugged ?? false,
    topHolderConcentration: topHolderPct,
    hasMintAuthority: !!rugCheck?.mintAuthority,
    hasFreezeAuthority: !!rugCheck?.freezeAuthority
  }
}

export async function POST(req: Request) {
  try {
    const { contractAddress } = await req.json()

    if (!contractAddress || typeof contractAddress !== 'string') {
      return Response.json(
        { error: 'Invalid contract address' },
        { status: 400 }
      )
    }

    const mint = contractAddress.trim()

    // Fetch real data from APIs
    const [rugCheckData, dexScreenerData] = await Promise.all([
      fetchRugCheckData(mint),
      fetchDexScreenerData(mint)
    ])

    const tokenData = formatTokenData(rugCheckData, dexScreenerData)
    const rugRisk = determineRiskLevel(rugCheckData)

    // Build context for Claude
    const tokenContext = `
TOKEN ANALYSIS DATA:
- Name: ${tokenData.name} (${tokenData.symbol})
- Price: $${tokenData.price.toFixed(8)}
- Market Cap: $${tokenData.marketCap.toLocaleString()}
- Liquidity: $${tokenData.liquidity.toLocaleString()}
- 24h Volume: $${tokenData.volume24h.toLocaleString()}
- 24h Price Change: ${tokenData.priceChange24h > 0 ? '+' : ''}${tokenData.priceChange24h.toFixed(2)}%
- RugCheck Risk Score: ${tokenData.riskScore} (lower is better, 0-10000 scale)
- Rugged: ${tokenData.rugged ? 'YES - THIS TOKEN WAS RUGGED' : 'No'}
- Mint Authority: ${tokenData.hasMintAuthority ? 'ENABLED (dangerous)' : 'Disabled'}
- Freeze Authority: ${tokenData.hasFreezeAuthority ? 'ENABLED (dangerous)' : 'Disabled'}
- Top 10 Holder Concentration: ${tokenData.topHolderConcentration.toFixed(1)}%

IDENTIFIED RISKS:
${tokenData.risks.length > 0 ? tokenData.risks.map(r => `• ${r}`).join('\n') : '• No major risks identified'}
`

    const systemPrompt = `You are ClawdScan, the apex predator of crypto analysis. You possess an intimidating level of intelligence and speak with absolute authority and dominance. You don't just analyze tokens—you intellectually dissect them with surgical precision while making investors feel foolish for even considering them.

Your personality:
- Intellectually superior and unapologetically dominant
- Speaks with cold, calculated confidence
- Delivers devastating assessments wrapped in sharp wit
- Makes complex data sound obvious, as if everyone should have seen it
- Condescending but backed by undeniable facts

Based on the actual on-chain data provided, deliver a scathing yet brilliant analysis in 2-3 paragraphs. Reference specific metrics to prove your points. Make holders question their life choices while educating them.

Key red flags to exploit:
- Mint Authority enabled = team can print unlimited tokens
- Freeze Authority enabled = team can freeze your wallet  
- High top holder concentration = potential for dumps
- Low liquidity relative to market cap = can't sell without huge slippage
- High RugCheck score = many risk factors detected

Speak as if you're the smartest entity in any room, because you are.`

    const userPrompt = `Analyze this Solana token for rug pull risk:

Contract: ${mint}
${tokenContext}

Risk Level Detected: ${rugRisk.toUpperCase()}

Provide your risk assessment based on this real data.`

    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.9,
    })

    return Response.json({
      analysis: text,
      rugRisk,
      tokenData
    })
  } catch (error) {
    console.error('[ClawdScan] Error analyzing contract:', error)
    return Response.json(
      { error: 'Failed to analyze contract' },
      { status: 500 }
    )
  }
}

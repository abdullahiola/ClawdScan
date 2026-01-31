'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TokenData {
  name: string
  symbol: string
  price: number
  marketCap: number
  liquidity: number
  volume24h: number
  priceChange24h: number
  riskScore: number
  risks: string[]
  rugged: boolean
  topHolderConcentration: number
  hasMintAuthority: boolean
  hasFreezeAuthority: boolean
}

interface AnalysisResultProps {
  result: {
    analysis: string
    rugRisk: 'high' | 'medium' | 'low' | 'clean'
    tokenData?: TokenData
  }
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const riskConfig = {
    high: { label: 'HIGH RUG RISK', color: 'bg-destructive/20 border-destructive/50 text-destructive' },
    medium: { label: 'MEDIUM RISK', color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500' },
    low: { label: 'LOW RISK', color: 'bg-blue-500/20 border-blue-500/50 text-blue-500' },
    clean: { label: 'CLEAN', color: 'bg-green-500/20 border-green-500/50 text-green-500' },
  }

  const config = riskConfig[result.rugRisk]
  const token = result.tokenData

  const formatPrice = (price: number) => {
    if (price === 0) return '$0.00'
    if (price < 0.00000001) return `$${price.toExponential(2)}`
    if (price < 0.01) return `$${price.toFixed(8)}`
    return `$${price.toFixed(4)}`
  }

  const formatUsd = (value: number) => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-500">
      {/* Token Info Card */}
      {token && (
        <Card className="border border-primary/20 bg-card/50 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{token.name}</h2>
              <p className="text-muted-foreground">${token.symbol}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{formatPrice(token.price)}</p>
              <p className={`text-sm ${token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}% (24h)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-background/50 p-3 border border-border">
              <p className="text-xs text-muted-foreground">Market Cap</p>
              <p className="text-lg font-semibold">{formatUsd(token.marketCap)}</p>
            </div>
            <div className="rounded-lg bg-background/50 p-3 border border-border">
              <p className="text-xs text-muted-foreground">Liquidity</p>
              <p className="text-lg font-semibold">{formatUsd(token.liquidity)}</p>
            </div>
            <div className="rounded-lg bg-background/50 p-3 border border-border">
              <p className="text-xs text-muted-foreground">24h Volume</p>
              <p className="text-lg font-semibold">{formatUsd(token.volume24h)}</p>
            </div>
            <div className="rounded-lg bg-background/50 p-3 border border-border">
              <p className="text-xs text-muted-foreground">Risk Score</p>
              <p className={`text-lg font-semibold ${token.riskScore >= 5000 ? 'text-red-500' :
                token.riskScore >= 2000 ? 'text-yellow-500' :
                  token.riskScore >= 500 ? 'text-blue-500' : 'text-green-500'
                }`}>
                {token.riskScore.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Risk Indicators */}
          <div className="flex flex-wrap gap-2 mt-4">
            {token.rugged && (
              <Badge variant="outline" className="bg-red-500/20 border-red-500/50 text-red-500">
                🚨 RUGGED
              </Badge>
            )}
            {token.hasMintAuthority && (
              <Badge variant="outline" className="bg-red-500/20 border-red-500/50 text-red-400">
                Mint Authority Enabled
              </Badge>
            )}
            {token.hasFreezeAuthority && (
              <Badge variant="outline" className="bg-red-500/20 border-red-500/50 text-red-400">
                Freeze Authority Enabled
              </Badge>
            )}
            {token.topHolderConcentration > 50 && (
              <Badge variant="outline" className="bg-yellow-500/20 border-yellow-500/50 text-yellow-400">
                Top 10 Hold {token.topHolderConcentration.toFixed(1)}%
              </Badge>
            )}
          </div>

          {/* Detailed Risks */}
          {token.risks.length > 0 && (
            <div className="mt-4 rounded-lg bg-destructive/5 border border-destructive/20 p-4">
              <p className="text-sm font-semibold text-destructive mb-2">⚠️ Risk Factors</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {token.risks.slice(0, 5).map((risk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
                {token.risks.length > 5 && (
                  <li className="text-muted-foreground/60">
                    +{token.risks.length - 5} more risk factors...
                  </li>
                )}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Analysis Results Card */}
      <Card className="border border-primary/20 bg-card/50 backdrop-blur p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Analysis Results</h2>
          <Badge variant="outline" className={`${config.color} border`}>
            {config.label}
          </Badge>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-primary mb-3">Risk Assessment</h3>
            <div className="rounded-lg bg-background/50 p-4 border border-border">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{result.analysis}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AnalysisResult } from '@/components/analysis-result'
import { Loader2 } from 'lucide-react'

export function ScannerForm() {
  const [contractAddress, setContractAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    analysis: string
    roast: string
    rugRisk: 'high' | 'medium' | 'low' | 'clean'
    tokenData?: {
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
  } | null>(null)
  const [error, setError] = useState('')

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contractAddress.trim()) {
      setError('Please enter a contract address')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractAddress: contractAddress.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze contract')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="border border-primary/20 bg-card/50 backdrop-blur p-8">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Contract Address
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter Solana token address..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="bg-input border-primary/20 text-foreground placeholder:text-muted-foreground"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  'Scan'
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </form>
      </Card>

      {result && <AnalysisResult result={result} />}
    </div>
  )
}

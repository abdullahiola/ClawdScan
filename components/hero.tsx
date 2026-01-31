'use client'

import Image from 'next/image'

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-background to-card py-24">
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <div className="mb-6 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
          <p className="text-sm font-medium text-primary">
            Powered by Claude AI
          </p>
        </div>
        <div className="mb-6 flex justify-center">
          <Image
            src="/crabb.png"
            alt="ClawdScan Logo"
            width={300}
            height={300}
            priority
            className="object-contain mix-blend-normal"
            style={{ filter: "drop-shadow(0 0 0 transparent)" }}
          />
        </div>
        <p className="text-xl text-muted-foreground mb-8 text-balance">
          Stop getting rekt by tokens with more red flags than a
          communist parade. Clawdscan analyzes contracts and tells you
          exactly how bad your taste in coins really is.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="rounded-lg border border-primary/20 bg-card/50 p-4">
            <p className="text-sm font-semibold text-primary">
              AI Larp Verification
            </p>
            <p className="text-xs text-muted-foreground">
              Identify artificially manufactured narratives
            </p>
            <p className="text-xs text-muted-foreground"></p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-card/50 p-4">
            <p className="text-sm font-semibold text-primary">
              Risk analysis{" "}
            </p>
            <p className="text-xs text-muted-foreground">
              Quantified risk assessment framework
            </p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-card/50 p-4">
            <p className="text-sm font-semibold text-primary">
              Rekt Probability
            </p>
            <p className="text-xs text-muted-foreground">
              How cooked are you
            </p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-card/50 p-4">
            <p className="text-sm font-semibold text-primary">
              Instant Results
            </p>
            <p className="text-xs text-muted-foreground">
              Know in seconds
            </p>
            <p className="text-xs text-muted-foreground"></p>
          </div>
        </div>
      </div>
    </div>
  );
}

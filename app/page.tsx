import { ScannerForm } from '@/components/scanner-form'
import { Hero } from '@/components/hero'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <div className="container mx-auto px-4 py-12">
        <ScannerForm />
      </div>
    </main>
  )
}

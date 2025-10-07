"use client"

import { HeroSection } from "@/components/hero-section"
import { SupportedBy } from "@/components/supported-by"
import { HowItWorks } from "@/components/how-it-works"
import { WhyAhjoor } from "@/components/why-ahjoor"

export default function Home() {
  return (
    <main>
      <HeroSection />
      <SupportedBy />
      <HowItWorks />
      <WhyAhjoor />
    </main>
  )
}

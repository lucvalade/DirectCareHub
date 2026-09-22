"use client";

import NavigationHeader from "@/components/NavigationHeader";
import PricingSection from "@/components/PricingSection";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <NavigationHeader />
      <main className="py-8">
        <PricingSection />
      </main>
    </div>
  );
}

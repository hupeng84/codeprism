"use client";

import { Hero, Stats, HowItWorks, Categories, Featured, Footer } from "@/components/home";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <HowItWorks />
      <Categories />
      <Featured />
      <Footer />
    </>
  );
}

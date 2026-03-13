import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DetectionMatters from "@/components/DetectionMatters";
import TriageLevels from "@/components/TriageLevels";
import FeatureHighlight from "@/components/FeatureHighlight";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <DetectionMatters />
      <TriageLevels />
      <FeatureHighlight />
      <CTA />
      <Footer />
    </main>
  );
}

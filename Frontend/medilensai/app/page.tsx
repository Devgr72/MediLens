import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import DetectionMatters from "@/components/DetectionMatters";
import TriageLevels from "@/components/TriageLevels";
import FeatureHighlight from "@/components/FeatureHighlight";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <DetectionMatters />
      <TriageLevels />
      <FeatureHighlight />
      <Footer />
    </main>
  );
}

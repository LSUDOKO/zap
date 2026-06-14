import Hero from "./Hero";
import Work from "./Work";
import PartnerMarquee from "./PartnerMarquee";
import CTA from "./CTA";
import Footer from "@/components/Footer";

export default function LandingIndex() {
  return (
    <main>
      <Hero />
      <Work />
      <PartnerMarquee />
      <CTA />
      <Footer />
    </main>
  );
}

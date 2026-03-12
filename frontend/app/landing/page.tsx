import { Navbar } from '@/components/shared/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { EvolutionShowcase } from '@/components/landing/EvolutionShowcase';
import { GetStartedGuide } from '@/components/landing/GetStartedGuide';
import { Footer } from '@/components/shared/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <GetStartedGuide />
      <EvolutionShowcase />
      <Footer />
    </div>
  );
}

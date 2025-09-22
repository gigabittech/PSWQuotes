import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { CmsPage } from "@shared/schema";
import heroBackground from "@/assets/hero-background.png";

export default function DynamicHero() {
  // Fetch homepage data for hero content
  const { data: homepage } = useQuery<CmsPage>({
    queryKey: ['/api/cms/pages', 'home'],
    queryFn: async () => {
      const response = await fetch('/api/cms/pages/home', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch homepage');
      return response.json();
    },
  });

  // Fallback to default hero if CMS data not available
  const heroContent = homepage?.blocks?.find((block: any) => block.type === 'hero')?.content || {
    title: "Perth's #1 Solar Specialists",
    subtitle: "Get a free solar quote in 2 minutes",
    description: "Join 1,500+ happy customers who saved thousands with our premium solar solutions. Licensed, insured, and backed by Australia's best warranties.",
    cta: {
      text: "Get My Free Quote",
      href: "#quote"
    },
    backgroundImage: heroBackground
  };

  const scrollToQuote = () => {
    const quoteSection = document.getElementById('quote');
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="relative bg-cover bg-center bg-no-repeat py-24 lg:py-32"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${heroContent.backgroundImage || heroBackground})` 
      }}
      data-testid="dynamic-hero"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-2xl" data-testid="hero-title">
            {heroContent.title}
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-white drop-shadow-xl" data-testid="hero-subtitle">
            {heroContent.subtitle}
          </p>
          <p className="text-lg mb-8 text-white drop-shadow-lg max-w-3xl mx-auto" data-testid="hero-description">
            {heroContent.description}
          </p>
          <Button
            size="lg"
            onClick={scrollToQuote}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
            data-testid="hero-cta-button"
          >
            {heroContent.cta?.text || "Get My Free Quote"}
            <span className="ml-2">→</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
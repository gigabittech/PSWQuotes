import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { CmsPage } from "@shared/schema";
import heroBackground from "@/assets/hero-background.png";
import heroTagIcon from "@/assets/hero-tag-icon.png";
import heroCtaArrow from "@/assets/hero-cta-arrow.png";

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

  // Force Manrope font to load and apply
  useEffect(() => {
    // Inject font link
    if (!document.querySelector('link[href*="Manrope"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@600&display=swap';
      document.head.insertBefore(link, document.head.firstChild);
    }

    // Force apply font after a delay
    const applyFont = () => {
      const element = document.querySelector('[data-testid="hero-title"]') as HTMLElement;
      if (element) {
        // Remove all font-related classes that might interfere
        element.className = element.className.replace(/font-\w+/g, '');
        // Directly set style
        element.style.setProperty('font-family', 'Manrope', 'important');
        element.style.setProperty('font-weight', '600', 'important');
        element.style.setProperty('font-style', 'normal', 'important');
      }
    };

    // Try multiple times to ensure it applies
    applyFont();
    setTimeout(applyFont, 100);
    setTimeout(applyFont, 500);
    setTimeout(applyFont, 1000);
  }, []);

  // Fallback to default hero if CMS data not available
  const heroContent = (Array.isArray(homepage?.blocks) ? homepage.blocks : []).find((block: any) => block.type === 'hero')?.content || {
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
    <>
      <style>{`
        [data-testid="hero-title"] {
          font-family: Manrope !important;
          font-weight: 600 !important;
          font-style: normal !important;
        }
      `}</style>
      <section
        className="relative bg-cover bg-center bg-no-repeat py-24 lg:py-32"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${heroContent.backgroundImage || heroBackground})`,
          backgroundPosition: "center 65%",
          backgroundSize: "cover"
        }}
        data-testid="dynamic-hero"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-24">
          <div className="text-center text-white">
            <h1
              id="hero-title-manrope"
              className="font-manrope mb-6 text-white drop-shadow-2xl text-center text-4xl sm:text-5xl md:text-[60px]"

              data-testid="hero-title"
            >
              {heroContent.title}
            </h1>
            {/* Primary CTA Button */}
            <div className="mb-6 flex justify-center">
              <Button
                onClick={scrollToQuote}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white bg-transparent px-8 py-3 font-inter text-lg sm:text-xl md:text-2xl font-normal text-white transition-all duration-300 hover:bg-white/10 hover:scale-105 w-full max-w-[90%] sm:max-w-md h-auto min-h-[44px]"
                data-testid="hero-primary-cta"
              >
                <span className="mr-2 flex-shrink-0">
                  <img
                    src={heroTagIcon}
                    alt="Tag icon"
                    className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
                  />
                </span>
                <span className="text-white font-normal whitespace-normal text-center leading-tight">{heroContent.subtitle || "Get a free solar quote in 2 minutes"}</span>
              </Button>
            </div>

            <div
              className="mb-8 text-white drop-shadow-lg mx-auto w-full max-w-3xl px-4 flex flex-col justify-center gap-2"
              data-testid="hero-description"
            >
              <p className="font-inter font-normal text-base sm:text-lg leading-relaxed text-center text-white m-0">
                Join{" "}
                <span className="text-[#E1AE20] font-medium">
                  1,500+
                </span>{" "}
                happy customers who saved thousands with our premium solar solutions.
              </p>
              <p className="font-inter font-normal text-base sm:text-lg leading-relaxed text-center text-white m-0">
                Licensed, insured, and backed by Australia's best warranties.
              </p>
            </div>

            {/* Secondary CTA Button */}
            <div className="flex justify-center">
              <Button
                onClick={scrollToQuote}
                className="font-manrope font-semibold text-white shadow-lg bg-[#E1AE20] hover:bg-[#E1AE20]/90 border border-white/25 rounded-full h-auto min-h-[54px] w-auto min-w-[200px] px-6 py-3 flex items-center justify-between gap-3 text-lg transition-all duration-300 hover:scale-105"
                data-testid="hero-cta-button"
              >
                <span>{heroContent.cta?.text || "Get My Free Quote"}</span>
                <span className="flex-shrink-0">
                  <img
                    src={heroCtaArrow}
                    alt="Arrow"
                    className="h-8 w-8 sm:h-9 sm:w-9 object-contain select-none"
                    draggable={false}
                  />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

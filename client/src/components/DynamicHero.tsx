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
        className="relative bg-cover bg-center bg-no-repeat py-16 sm:py-20 md:py-24 lg:py-32 min-h-[500px] sm:min-h-[600px] md:min-h-[700px] flex items-center"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${heroContent.backgroundImage || heroBackground})`,
          backgroundPosition: "center 65%",
        backgroundSize: "cover"
      }}
        data-testid="dynamic-hero"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16 sm:pt-20 md:pt-24">
          <div className="text-center text-white">
            <h1
              id="hero-title-manrope"
              className="font-manrope mb-6 text-white drop-shadow-2xl text-center text-4xl sm:text-5xl md:text-[60px]"
             
              data-testid="hero-title"
            >
              {heroContent.title} 
            </h1>
          {/* Primary CTA Button */}
          <div className="mb-4 sm:mb-6 flex justify-center">
            <Button
              onClick={scrollToQuote}
              className="text-white border border-white rounded-full font-normal inline-flex items-center justify-center w-full sm:w-auto min-w-[280px] sm:min-w-[350px] md:min-w-[432px] max-w-[432px] h-11 sm:h-12 px-4 sm:px-5 md:px-6 text-base sm:text-lg md:text-xl"
              style={{
                borderRadius: '38px',
                borderWidth: '1px',
                borderColor: '#FFFFFF',
                borderStyle: 'solid',
                backgroundColor: 'transparent',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                lineHeight: '32px',
                letterSpacing: '0',
                textAlign: 'center'
              }}
              data-testid="hero-primary-cta"
            >
              <span style={{ display: 'inline-flex', marginLeft: '5px', marginRight: '6px', flexShrink: 0 }}>
                <img 
                  src={heroTagIcon} 
                  alt="Tag icon" 
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                />
              </span>
              <span className="text-white font-normal whitespace-nowrap">{heroContent.subtitle || "Get a free solar quote in 2 minutes"}</span>
            </Button>
          </div>
          
          <div
            className="mb-6 sm:mb-8 text-white drop-shadow-lg mx-auto max-w-4xl px-4"
            data-testid="hero-description"
          >
            <p
              className="text-sm sm:text-base md:text-lg leading-relaxed mb-2"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontStyle: "normal",
                textAlign: "center",
                color: "#FFFFFF"
              }}
            >
              Join{" "}
              <span
                style={{
                  color: "#E1AE20A1",
                  fontWeight: 500
                }}
              >
                1,500+
              </span>{" "}
              happy customers who saved thousands with our premium solar solutions.
            </p>
            <p
              className="text-sm sm:text-base md:text-lg leading-relaxed"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontStyle: "normal",
                textAlign: "center",
                color: "#FFFFFF"
              }}
            >
              Licensed, insured, and backed by Australia's best warranties.
            </p>
          </div>
          
          {/* Secondary CTA Button */}
          <div className="flex justify-center">
            <Button
              onClick={scrollToQuote}
              className="font-semibold text-white shadow-lg w-full sm:w-auto min-w-[200px] sm:min-w-[248px] max-w-[248px] h-12 sm:h-14 px-4 sm:px-6 md:px-7 text-base sm:text-lg"
              style={{
                borderRadius: "100px",
                background: "#E1AE20A1",
                border: "1px solid rgba(255,255,255,0.25)",
                fontFamily: "Manrope, sans-serif",
                fontWeight: 600,
                lineHeight: "100%",
                letterSpacing: "0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
              data-testid="hero-cta-button"
            >
              <span className="whitespace-nowrap">{heroContent.cta?.text || "Get My Free Quote"}</span>
              <span className="ml-2 sm:ml-3 flex-shrink-0">
                <img
                  src={heroCtaArrow}
                  alt="Arrow"
                  className="h-7 w-7 sm:h-9 sm:w-9 object-contain select-none"
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

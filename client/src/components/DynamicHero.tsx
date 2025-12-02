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
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${heroContent.backgroundImage || heroBackground})` 
        }}
        data-testid="dynamic-hero"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1
              id="hero-title-manrope"
              className="mb-6 text-white drop-shadow-2xl text-center text-4xl sm:text-5xl md:text-[60px]"
              style={{ 
                fontFamily: 'Manrope',
                fontWeight: 600,
                fontStyle: 'normal',
                lineHeight: '60px',
                letterSpacing: '-1.5px',
                textAlign: 'center',
                verticalAlign: 'middle'
              }}
              data-testid="hero-title"
            >
              {heroContent.title}
            </h1>
          {/* Primary CTA Button */}
          <div className="mb-6">
            <Button
              onClick={scrollToQuote}
              className="text-white border border-white rounded-full font-normal inline-flex items-center justify-center"
              style={{
                width: '432px',
                height: '44px',
                paddingTop: '6px',
                paddingRight: '20px',
                paddingBottom: '6px',
                paddingLeft: '20px',
                gap: '10px',
                borderRadius: '38px',
                borderWidth: '1px',
                borderColor: '#FFFFFF',
                borderStyle: 'solid',
                backgroundColor: 'transparent',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '22px',
                lineHeight: '32px',
                letterSpacing: '0',
                textAlign: 'center'
              }}
              data-testid="hero-primary-cta"
            >
              <span style={{ display: 'inline-flex', marginRight: '10px' }}>
                <img src={heroTagIcon} alt="Tag icon" className="h-5 w-5 object-contain" />
              </span>
              <span className="text-white font-normal">{heroContent.subtitle || "Get a free solar quote in 2 minutes"}</span>
            </Button>
          </div>
          
          <div
            className="mb-8 text-white drop-shadow-lg mx-auto space-y-1"
            style={{
              maxWidth: "729px",
              textAlign: "center"
            }}
            data-testid="hero-description"
          >
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "18px",
                lineHeight: "28px",
                letterSpacing: "0",
                color: "#FFFFFF"
              }}
            >
              Join{" "}
              <span
                style={{
                  color: "#E1AE20A1",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "18px",
                  lineHeight: "28px",
                  letterSpacing: "0",
                  verticalAlign: "middle"
                }}
              >
                1,500+
              </span>{" "}
              happy customers who saved thousands with our premium solar solutions.
            </p>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: "18px",
                lineHeight: "28px",
                letterSpacing: "0",
                color: "#FFFFFF"
              }}
            >
              Licensed, insured, and backed by Australia's best warranties.
            </p>
          </div>
          
          {/* Secondary CTA Button */}
          <Button
            onClick={scrollToQuote}
            className="font-semibold text-white shadow-lg"
            style={{
              width: "248px",
              height: "54px",
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingLeft: "26px",
              paddingRight: "6px",
              borderRadius: "100px",
              background: "#E1AE20A1",
              border: "1px solid rgba(255,255,255,0.25)",
              fontFamily: "Manrope, sans-serif",
              fontWeight: 600,
              fontSize: "18px",
              lineHeight: "100%",
              letterSpacing: "0"
            }}
            data-testid="hero-cta-button"
          >
            <span>{heroContent.cta?.text || "Get My Free Quote"}</span>
            <span style={{ marginLeft: "12px", display: "inline-flex" }}>
              <img
                src={heroCtaArrow}
                alt="Arrow"
                className="h-9 w-9 object-contain select-none"
                draggable={false}
              />
            </span>
          </Button>
          </div>
        </div>
      </section>
    </>
  );
}

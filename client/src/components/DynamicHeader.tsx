import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { CmsPage } from "@shared/schema";
import pswLogo from "@/assets/psw-logo.png";
import heroPhoneIcon from "@/assets/hero-phone-icon.png";
import heroMailIcon from "@/assets/hero-mail-icon.png";

export default function DynamicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch homepage data for header content
  const { data: homepage } = useQuery<CmsPage>({
    queryKey: ['/api/cms/pages', 'home'],
    queryFn: async () => {
      const response = await fetch('/api/cms/pages/home', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch homepage');
      return response.json();
    },
  });

  // Fallback to default header if CMS data not available
  const headerContent = (Array.isArray(homepage?.blocks) ? homepage.blocks : []).find((block: any) => block.type === 'header')?.content || {
    logo: 'Perth Solar Warehouse',
    navigation: [
      { text: 'Get Quote', href: '#quote' },
      { text: 'About', href: '#about' },
      { text: 'Contact', href: '#contact' }
    ],
    contact: {
      phone: '(08) 6171 4111',
      email: 'info@perthsolarwarehouse.com.au'
    }
  };

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    // Smooth scroll to section
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="absolute top-2 sm:top-4 left-1/2 z-40 w-full px-2 sm:px-4 -translate-x-1/2" data-testid="dynamic-header">
      <div className="mx-auto max-w-[1100px] rounded-2xl sm:rounded-3xl md:rounded-[45px] border border-white/15" style={{ backgroundColor: "#FFFFFF24" }}>
        <div className="flex h-12 sm:h-14 md:h-16 items-center justify-between px-3 sm:px-5 md:px-8 text-white">
          <div className="flex flex-shrink-0 items-center">
            <img
              src={pswLogo}
              alt={headerContent.logo || "Perth Solar Warehouse"}
              className="h-8 w-auto sm:h-10 object-contain"
              data-testid="header-logo-image"
            />
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-base text-white/90" data-testid="header-navigation">
            {headerContent.navigation?.map((item: any, index: number) => (
              <a
                key={index}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className="transition-colors hover:text-white"
                data-testid={`nav-link-${item.text.toLowerCase().replace(' ', '-')}`}
              >
                {item.text}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4" data-testid="header-contact">
            <a
              href={`tel:${headerContent.contact?.phone}`}
              className="flex items-center gap-2 text-white/90"
              data-testid="header-phone"
            >
              <img
                src={heroPhoneIcon}
                alt="Phone"
                className="h-6 w-6 object-contain select-none"
                draggable={false}
              />
              <span className="hidden xl:inline">{headerContent.contact?.phone}</span>
            </a>
            <a
              href={`mailto:${headerContent.contact?.email}`}
              className="flex items-center gap-2 text-white/90"
              data-testid="header-email"
            >
              <img
                src={heroMailIcon}
                alt="Mail"
                className="h-6 w-6 object-contain select-none"
                draggable={false}
              />
              <span className="hidden xl:inline">{headerContent.contact?.email}</span>
            </a>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={`tel:${headerContent.contact?.phone}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white"
              data-testid="header-phone-mobile"
              aria-label="Call us"
            >
              <Phone className="h-5 w-5" />
            </a>

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 p-0 text-white"
                  data-testid="mobile-menu-button"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="text-left font-bold text-foreground">
                    <img
                      src={pswLogo}
                      alt={headerContent.logo || "Perth Solar Warehouse"}
                      className="h-8 w-auto object-contain"
                    />
                  </SheetTitle>
                </SheetHeader>

                <nav className="mt-8 flex flex-col space-y-4" data-testid="mobile-navigation">
                  {headerContent.navigation?.map((item: any, index: number) => (
                    <a
                      key={index}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item.href);
                      }}
                      className="flex items-center rounded-lg px-4 py-3 text-lg font-medium text-foreground hover:bg-muted hover:text-primary"
                      data-testid={`mobile-nav-link-${item.text.toLowerCase().replace(' ', '-')}`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>

                <div className="mt-8 space-y-4 border-t border-border pt-8" data-testid="mobile-contact">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contact Us</h3>
                  <a
                    href={`tel:${headerContent.contact?.phone}`}
                    className="flex items-center rounded-lg px-4 py-3 text-foreground hover:bg-muted hover:text-primary"
                    data-testid="mobile-phone"
                  >
                    <Phone className="mr-3 h-5 w-5" />
                    <div>
                      <div className="font-medium">{headerContent.contact?.phone}</div>
                      <div className="text-sm text-muted-foreground">Call now for quote</div>
                    </div>
                  </a>
                  <a
                    href={`mailto:${headerContent.contact?.email}`}
                    className="flex items-center rounded-lg px-4 py-3 text-foreground hover:bg-muted hover:text-primary"
                    data-testid="mobile-email"
                  >
                    <Mail className="mr-3 h-5 w-5" />
                    <div>
                      <div className="break-all font-medium">{headerContent.contact?.email}</div>
                      <div className="text-sm text-muted-foreground">Send us an email</div>
                    </div>
                  </a>
                </div>

                <div className="mt-8 border-t border-border pt-8">
                  <Button className="w-full" onClick={() => handleNavClick('#quote')} data-testid="mobile-cta-button">
                    Get Free Quote
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
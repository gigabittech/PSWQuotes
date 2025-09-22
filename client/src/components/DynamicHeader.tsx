import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { CmsPage } from "@shared/schema";

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
  const headerContent = (homepage?.blocks || []).find((block: any) => block.type === 'header')?.content || {
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
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm" data-testid="dynamic-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold text-primary truncate" data-testid="header-logo">
              {headerContent.logo}
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8" data-testid="header-navigation">
            {headerContent.navigation?.map((item: any, index: number) => (
              <a
                key={index}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className="text-foreground hover:text-primary transition-colors font-medium text-sm xl:text-base px-3 py-2 rounded-lg hover:bg-muted"
                data-testid={`nav-link-${item.text.toLowerCase().replace(' ', '-')}`}
              >
                {item.text}
              </a>
            ))}
          </nav>

          {/* Desktop Contact Info */}
          <div className="hidden xl:flex items-center space-x-4" data-testid="header-contact">
            <a
              href={`tel:${headerContent.contact?.phone}`}
              className="flex items-center text-foreground hover:text-primary transition-colors text-sm px-3 py-2 rounded-lg hover:bg-muted"
              data-testid="header-phone"
            >
              <Phone className="h-4 w-4 mr-2" />
              <span className="hidden 2xl:inline">{headerContent.contact?.phone}</span>
            </a>
            <a
              href={`mailto:${headerContent.contact?.email}`}
              className="flex items-center text-foreground hover:text-primary transition-colors text-sm px-3 py-2 rounded-lg hover:bg-muted"
              data-testid="header-email"
            >
              <Mail className="h-4 w-4 mr-2" />
              <span className="hidden 2xl:inline">{headerContent.contact?.email}</span>
            </a>
          </div>

          {/* Mobile Contact (Phone Only) */}
          <div className="flex items-center space-x-2 lg:hidden">
            <a
              href={`tel:${headerContent.contact?.phone}`}
              className="flex items-center justify-center w-10 h-10 text-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted"
              data-testid="header-phone-mobile"
              aria-label="Call us"
            >
              <Phone className="h-5 w-5" />
            </a>

            {/* Mobile Menu Button */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 p-0 lg:hidden"
                  data-testid="mobile-menu-button"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="text-left text-primary font-bold">
                    {headerContent.logo}
                  </SheetTitle>
                </SheetHeader>
                
                {/* Mobile Navigation */}
                <nav className="flex flex-col space-y-4 mt-8" data-testid="mobile-navigation">
                  {headerContent.navigation?.map((item: any, index: number) => (
                    <a
                      key={index}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item.href);
                      }}
                      className="flex items-center text-foreground hover:text-primary transition-colors font-medium text-lg px-4 py-3 rounded-lg hover:bg-muted"
                      data-testid={`mobile-nav-link-${item.text.toLowerCase().replace(' ', '-')}`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>

                {/* Mobile Contact Info */}
                <div className="mt-8 pt-8 border-t border-border space-y-4" data-testid="mobile-contact">
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Contact Us</h3>
                  <a
                    href={`tel:${headerContent.contact?.phone}`}
                    className="flex items-center text-foreground hover:text-primary transition-colors px-4 py-3 rounded-lg hover:bg-muted"
                    data-testid="mobile-phone"
                  >
                    <Phone className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">{headerContent.contact?.phone}</div>
                      <div className="text-sm text-muted-foreground">Call now for quote</div>
                    </div>
                  </a>
                  <a
                    href={`mailto:${headerContent.contact?.email}`}
                    className="flex items-center text-foreground hover:text-primary transition-colors px-4 py-3 rounded-lg hover:bg-muted"
                    data-testid="mobile-email"
                  >
                    <Mail className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium break-all">{headerContent.contact?.email}</div>
                      <div className="text-sm text-muted-foreground">Send us an email</div>
                    </div>
                  </a>
                </div>

                {/* Call to Action */}
                <div className="mt-8 pt-8 border-t border-border">
                  <Button 
                    className="w-full" 
                    onClick={() => handleNavClick('#quote')}
                    data-testid="mobile-cta-button"
                  >
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
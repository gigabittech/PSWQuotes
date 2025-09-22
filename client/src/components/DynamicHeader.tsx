import { useQuery } from "@tanstack/react-query";
import type { CmsPage } from "@shared/schema";

export default function DynamicHeader() {
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
  const headerContent = homepage?.blocks?.find((block: any) => block.type === 'header')?.content || {
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

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50" data-testid="dynamic-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary" data-testid="header-logo">
              {headerContent.logo}
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8" data-testid="header-navigation">
            {headerContent.navigation?.map((item: any, index: number) => (
              <a
                key={index}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
                data-testid={`nav-link-${item.text.toLowerCase().replace(' ', '-')}`}
              >
                {item.text}
              </a>
            ))}
          </nav>

          {/* Contact Info */}
          <div className="flex items-center space-x-6" data-testid="header-contact">
            <a
              href={`tel:${headerContent.contact?.phone}`}
              className="hidden lg:flex items-center text-foreground hover:text-primary transition-colors"
              data-testid="header-phone"
            >
              <span className="text-lg mr-2">📞</span>
              {headerContent.contact?.phone}
            </a>
            <a
              href={`mailto:${headerContent.contact?.email}`}
              className="hidden xl:flex items-center text-foreground hover:text-primary transition-colors"
              data-testid="header-email"
            >
              <span className="text-lg mr-2">✉️</span>
              {headerContent.contact?.email}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
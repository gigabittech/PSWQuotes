import { useQuery } from "@tanstack/react-query";
import type { CmsPage } from "@shared/schema";

export default function DynamicFooter() {
  // Fetch homepage data for footer content
  const { data: homepage } = useQuery<CmsPage>({
    queryKey: ['/api/cms/pages', 'home'],
    queryFn: async () => {
      const response = await fetch('/api/cms/pages/home', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch homepage');
      return response.json();
    },
  });

  // Fallback to default footer if CMS data not available
  const footerContent = (homepage?.blocks && Array.isArray(homepage.blocks)) 
    ? homepage.blocks.find((block: any) => block.type === 'footer')?.content 
    : null || {
    company: {
      name: "Perth Solar Warehouse",
      description: "Perth's trusted solar specialists since 2015. Licensed, insured, and committed to helping Western Australian families save on energy costs.",
      license: "Licensed Electrical Contractor EC010771"
    },
    contact: {
      phone: "(08) 6171 4111",
      email: "info@perthsolarwarehouse.com.au",
      address: {
        street: "123 Solar Street",
        suburb: "Perth",
        state: "WA",
        postcode: "6000"
      }
    },
    services: [
      "Solar Panel Installation",
      "Battery Storage Solutions", 
      "EV Charging Stations",
      "System Maintenance",
      "Energy Monitoring"
    ],
    serviceAreas: [
      "Perth Metro",
      "Fremantle",
      "Joondalup", 
      "Rockingham",
      "Mandurah",
      "Swan Valley"
    ],
    social: {
      facebook: "https://facebook.com/perthsolarwarehouse",
      instagram: "https://instagram.com/perthsolarwarehouse",
      linkedin: "https://linkedin.com/company/perthsolarwarehouse"
    }
  };

  return (
    <footer className="bg-background border-t border-border" data-testid="dynamic-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2" data-testid="footer-company">
            <h3 className="text-xl font-bold text-foreground mb-4" data-testid="footer-company-name">
              {footerContent.company?.name}
            </h3>
            <p className="text-muted-foreground mb-4 leading-relaxed" data-testid="footer-company-description">
              {footerContent.company?.description}
            </p>
            <p className="text-sm text-muted-foreground font-medium" data-testid="footer-license">
              {footerContent.company?.license}
            </p>
            
            {/* Contact Info */}
            <div className="mt-6 space-y-2" data-testid="footer-contact">
              <div className="flex items-center text-muted-foreground">
                <span className="text-lg mr-3">📞</span>
                <a href={`tel:${footerContent.contact?.phone}`} className="hover:text-primary transition-colors touch-manipulation py-2" data-testid="footer-phone">
                  {footerContent.contact?.phone}
                </a>
              </div>
              <div className="flex items-center text-muted-foreground">
                <span className="text-lg mr-3">✉️</span>
                <a href={`mailto:${footerContent.contact?.email}`} className="hover:text-primary transition-colors touch-manipulation py-2" data-testid="footer-email">
                  {footerContent.contact?.email}
                </a>
              </div>
              {footerContent.contact?.address && (
                <div className="flex items-start text-muted-foreground">
                  <span className="text-lg mr-3">📍</span>
                  <div data-testid="footer-address">
                    <div>{footerContent.contact.address.street}</div>
                    <div>{footerContent.contact.address.suburb}, {footerContent.contact.address.state} {footerContent.contact.address.postcode}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          <div data-testid="footer-services">
            <h3 className="text-lg font-semibold text-foreground mb-4">Our Services</h3>
            <ul className="space-y-2">
              {footerContent.services?.map((service: string, index: number) => (
                <li key={index}>
                  <span className="text-muted-foreground hover:text-primary transition-colors" data-testid={`footer-service-${index}`}>
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div data-testid="footer-service-areas">
            <h3 className="text-lg font-semibold text-foreground mb-4">Service Areas</h3>
            <ul className="space-y-2">
              {footerContent.serviceAreas?.map((area: string, index: number) => (
                <li key={index}>
                  <span className="text-muted-foreground hover:text-primary transition-colors" data-testid={`footer-area-${index}`}>
                    {area}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0" data-testid="footer-copyright">
            © {new Date().getFullYear()} {footerContent.company?.name}. All rights reserved.
          </div>
          
          {/* Social Links */}
          {footerContent.social && (
            <div className="flex flex-wrap gap-4" data-testid="footer-social">
              {footerContent.social.facebook && (
                <a href={footerContent.social.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors touch-manipulation py-2 px-2" data-testid="footer-facebook">
                  Facebook
                </a>
              )}
              {footerContent.social.instagram && (
                <a href={footerContent.social.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors touch-manipulation py-2 px-2" data-testid="footer-instagram">
                  Instagram
                </a>
              )}
              {footerContent.social.linkedin && (
                <a href={footerContent.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors touch-manipulation py-2 px-2" data-testid="footer-linkedin">
                  LinkedIn
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
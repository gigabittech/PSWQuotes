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
  const defaultContent = {
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
  
  const footerBlock = Array.isArray(homepage?.blocks) 
    ? homepage.blocks.find((block: any) => block.type === 'footer') 
    : undefined;
  const footerContent = footerBlock?.content ?? defaultContent;

  return (
    <footer className="bg-black border-t border-gray-800" data-testid="dynamic-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0" data-testid="footer-copyright">
            © {new Date().getFullYear()} {footerContent.company?.name}. All rights reserved. {footerContent.company?.license}
          </div>
          
          {/* Social Links */}
          {footerContent.social && (
            <div className="flex flex-wrap gap-4" data-testid="footer-social">
              {footerContent.social.facebook && (
                <a href={footerContent.social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition-colors touch-manipulation py-2 px-2" data-testid="footer-facebook">
                  Facebook
                </a>
              )}
              {footerContent.social.instagram && (
                <a href={footerContent.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition-colors touch-manipulation py-2 px-2" data-testid="footer-instagram">
                  Instagram
                </a>
              )}
              {footerContent.social.linkedin && (
                <a href={footerContent.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition-colors touch-manipulation py-2 px-2" data-testid="footer-linkedin">
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
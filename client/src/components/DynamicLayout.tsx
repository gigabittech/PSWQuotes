import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { CmsTheme, CmsPage } from "@shared/schema";

interface DynamicLayoutProps {
  children: React.ReactNode;
}

export default function DynamicLayout({ children }: DynamicLayoutProps) {
  // Fetch theme settings
  const { data: theme } = useQuery<CmsTheme>({
    queryKey: ['/api/cms/theme'],
  });

  // Apply theme styles to document
  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;
    
    // Apply colors if available
    if (theme.colors) {
      const colors = theme.colors as any;
      if (colors.primary) root.style.setProperty('--primary', colors.primary);
      if (colors.secondary) root.style.setProperty('--secondary', colors.secondary);
      if (colors.accent) root.style.setProperty('--accent', colors.accent);
      if (colors.background) root.style.setProperty('--background', colors.background);
      if (colors.foreground) root.style.setProperty('--foreground', colors.foreground);
    }

    // Apply typography if available
    if (theme.typography) {
      const typography = theme.typography as any;
      if (typography.fontFamily) root.style.setProperty('--font-family', typography.fontFamily);
      if (typography.fontSize) root.style.setProperty('--font-size', typography.fontSize);
      if (typography.lineHeight) root.style.setProperty('--line-height', typography.lineHeight);
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
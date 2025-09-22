import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import DynamicLayout from "@/components/DynamicLayout";
import DynamicHeader from "@/components/DynamicHeader";
import DynamicFooter from "@/components/DynamicFooter";
import type { CmsPage } from "@shared/schema";

export default function CmsPageRenderer() {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading, error } = useQuery<CmsPage>({
    queryKey: ['/api/cms/pages', slug],
  });

  if (isLoading) {
    return (
      <DynamicLayout>
        <DynamicHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <DynamicFooter />
      </DynamicLayout>
    );
  }

  if (error || !page) {
    return (
      <DynamicLayout>
        <DynamicHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Page Not Found</h1>
            <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
            <a href="/" className="mt-4 inline-block text-primary hover:underline">
              Return to Home
            </a>
          </div>
        </div>
        <DynamicFooter />
      </DynamicLayout>
    );
  }

  // Parse blocks content
  const blocks = Array.isArray(page.blocks) ? page.blocks : [];
  const contentBlocks = blocks.filter((block: any) => block.type === 'content');

  return (
    <DynamicLayout>
      <DynamicHeader />
      
      {/* Page Content */}
      <main className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-border p-8">
            <h1 className="text-4xl font-bold text-foreground mb-6" data-testid="page-title">
              {page.title}
            </h1>
            
            {contentBlocks.map((block: any, index: number) => (
              <div key={index} className="prose max-w-none" data-testid={`content-block-${index}`}>
                {block.content && (
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {block.content}
                  </div>
                )}
              </div>
            ))}
            
            {contentBlocks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">This page doesn't have any content yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <DynamicFooter />
    </DynamicLayout>
  );
}
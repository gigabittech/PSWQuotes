import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EmbedCodeGenerator() {
  const [copied, setCopied] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");
  const { toast } = useToast();
  
  // Set embedUrl in useEffect to avoid SSR/build errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEmbedUrl(`${window.location.origin}/embed`);
    }
  }, []);
  
  const iframeCode = `<!-- Perth Solar Warehouse Quote Form -->
<iframe 
  src="${embedUrl}"
  width="100%"
  height="900"
  frameborder="0"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
  title="Solar Quote Form"
  allow="geolocation"
></iframe>`;

  const scriptCode = `<!-- Perth Solar Warehouse Quote Form (Responsive) -->
<div id="psw-quote-form"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${embedUrl}';
    iframe.style.width = '100%';
    iframe.style.height = '900px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    iframe.setAttribute('title', 'Solar Quote Form');
    iframe.setAttribute('allow', 'geolocation');
    document.getElementById('psw-quote-form').appendChild(iframe);
  })();
</script>`;

  const handleCopy = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: "Copied!",
      description: `${type} code copied to clipboard`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Embed Quote Form</CardTitle>
          <CardDescription>
            Add the solar quote form to your website using one of the methods below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Iframe Method */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base font-semibold">IFrame Embed Code</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(iframeCode, "IFrame")}
                className="glass-btn"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={iframeCode}
              readOnly
              className="font-mono text-xs glass-input"
              rows={8}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Simple iframe embed. Paste this code directly into your HTML where you want the form to appear.
            </p>
          </div>

          {/* Script Method */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base font-semibold">JavaScript Embed Code</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(scriptCode, "JavaScript")}
                className="glass-btn"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={scriptCode}
              readOnly
              className="font-mono text-xs glass-input"
              rows={12}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Dynamic JavaScript embed with a container div. Better for content management systems.
            </p>
          </div>

          {/* Preview */}
          <div>
            <Label className="text-base font-semibold mb-2 block">Live Preview</Label>
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Open form in new window →
              </a>
            </div>
          </div>

          {/* Configuration Notes */}
          <div className="glass-light rounded-lg p-4">
            <h4 className="font-semibold mb-2">Configuration Options</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <strong>Width:</strong> Set to 100% for responsive design or specific pixel value</li>
              <li>• <strong>Height:</strong> Recommended minimum 900px for full form visibility</li>
              <li>• <strong>Border Radius:</strong> Customize the 12px border-radius to match your site</li>
              <li>• <strong>Shadow:</strong> Adjust box-shadow for your design preferences</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

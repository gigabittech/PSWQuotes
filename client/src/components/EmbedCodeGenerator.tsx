import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EmbedCodeGenerator() {
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
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
    if (type === "IFrame") {
      setCopiedIframe(true);
      setTimeout(() => setCopiedIframe(false), 2000);
    } else {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
    toast({
      title: "Copied!",
      description: `${type} code copied to clipboard`,
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 items-center justify-center w-full py-4" style={{ overflow: 'visible' }}>
      {/* Gradient Border Wrapper */}
      <div 
        className="rounded-[10px] w-full"
        style={{
          background: 'linear-gradient(147.33deg, rgba(214, 214, 214, 0.35) 1.11%, rgba(241, 241, 241, 0.161) 50.87%, rgba(101, 101, 101, 0.0315) 106.32%)',
          maxWidth: '830px',
          padding: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'visible',
          minHeight: 'fit-content',
          borderRadius: '10px',
          position: 'relative'
        }}
      >
        <Card 
          className="flex flex-col shadow-none rounded-[10px] w-full"
          style={{ 
            boxShadow: 'none',
            background: '#FFFFFF',
            width: '100%',
            minHeight: '1058px',
            gap: '32px',
            padding: '32px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: 'auto',
            margin: 0,
            flex: '1 1 auto'
          }}
        >
          <CardHeader className="flex-shrink-0" style={{ padding: 0 }}>
            <CardTitle style={{ marginBottom: 0 }}>Embed Quote Form</CardTitle>
            <CardDescription style={{ marginTop: '8px', marginBottom: 0 }}>
              Add the solar quote form to your website using one of the methods below
            </CardDescription>
          </CardHeader>
        <CardContent className="flex-1 min-h-0" style={{ padding: 0, gap: '32px', display: 'flex', flexDirection: 'column', marginTop: '32px', overflow: 'visible' }}>
          {/* Iframe Method */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base font-semibold">IFrame Embed Code</Label>
              <button
                onClick={() => handleCopy(iframeCode, "IFrame")}
                style={{
                  width: '157px',
                  height: '40px',
                  minHeight: '40px',
                  gap: '8px',
                  borderRadius: '40px',
                  border: '1px solid #FFFFFF4D',
                  paddingTop: '8.5px',
                  paddingRight: '24px',
                  paddingBottom: '9.5px',
                  paddingLeft: '24px',
                  color: '#FFFFFF',
                  backgroundColor: '#171716E8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  boxSizing: 'border-box'
                }}
              >
                {copiedIframe ? (
                  <>
                    <Check className="w-4 h-4" style={{ marginRight: '8px', color: '#FFFFFF' }} />
                    <span style={{
                      width: '75px',
                      height: '20px',
                      fontFamily: 'Inter',
                      fontWeight: 600,
                      fontStyle: 'normal',
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '0%',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: '#FFFFFF',
                      leadingTrim: 'none'
                    } as React.CSSProperties & { leadingTrim?: string }}>
                      Copied
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" style={{ marginRight: '8px', color: '#FFFFFF' }} />
                    <span style={{
                      width: '75px',
                      height: '20px',
                      fontFamily: 'Inter',
                      fontWeight: 600,
                      fontStyle: 'normal',
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '0%',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: '#FFFFFF',
                      leadingTrim: 'none'
                    } as React.CSSProperties & { leadingTrim?: string }}>
                      Copy Code
                    </span>
                  </>
                )}
              </button>
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
              <button
                onClick={() => handleCopy(scriptCode, "JavaScript")}
                style={{
                  width: '157px',
                  height: '40px',
                  minHeight: '40px',
                  gap: '8px',
                  borderRadius: '40px',
                  border: '1px solid #FFFFFF4D',
                  paddingTop: '8.5px',
                  paddingRight: '24px',
                  paddingBottom: '9.5px',
                  paddingLeft: '24px',
                  color: '#FFFFFF',
                  backgroundColor: '#171716E8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  boxSizing: 'border-box'
                }}
              >
                {copiedScript ? (
                  <>
                    <Check className="w-4 h-4" style={{ marginRight: '8px', color: '#FFFFFF' }} />
                    <span style={{
                      width: '75px',
                      height: '20px',
                      fontFamily: 'Inter',
                      fontWeight: 600,
                      fontStyle: 'normal',
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '0%',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: '#FFFFFF',
                      leadingTrim: 'none'
                    } as React.CSSProperties & { leadingTrim?: string }}>
                      Copied
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" style={{ marginRight: '8px', color: '#FFFFFF' }} />
                    <span style={{
                      width: '75px',
                      height: '20px',
                      fontFamily: 'Inter',
                      fontWeight: 600,
                      fontStyle: 'normal',
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '0%',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: '#FFFFFF',
                      leadingTrim: 'none'
                    } as React.CSSProperties & { leadingTrim?: string }}>
                      Copy Code
                    </span>
                  </>
                )}
              </button>
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
    </div>
  );
}

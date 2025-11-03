import QuoteForm from "@/components/QuoteForm";
import { useEffect } from "react";

export default function EmbedPage() {
  useEffect(() => {
    document.title = "Get Your Solar Quote - Perth Solar Warehouse";
  }, []);

  return (
    <div className="min-h-screen">
      <QuoteForm />
    </div>
  );
}

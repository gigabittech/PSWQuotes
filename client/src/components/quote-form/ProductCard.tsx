import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: any;
  isSelected: boolean;
  onSelect: () => void;
  badge?: string;
  badgeColor?: string;
}

export default function ProductCard({ product, isSelected, onSelect, badge, badgeColor }: ProductCardProps) {
  const finalPrice = product.rebateEligible && product.rebateAmount 
    ? parseFloat(product.price) - parseFloat(product.rebateAmount)
    : parseFloat(product.price);

  return (
    <div
      className={cn(
        "pricing-card border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg relative",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary"
      )}
      onClick={onSelect}
      data-testid={`product-card-${product.id}`}
    >
      {badge && (
        <div className="absolute top-3 right-3">
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", badgeColor || "bg-secondary text-secondary-foreground")}>
            {badge}
          </span>
        </div>
      )}
      
      <div className="mb-4">
        <h4 className="text-xl font-semibold text-foreground mb-2">{product.name}</h4>
        <p className="text-muted-foreground text-sm mb-4">
          {product.specifications?.description || `${product.capacity} capacity system`}
        </p>
        
        <div className="space-y-2">
          {product.specifications?.panels && (
            <div className="flex justify-between text-sm">
              <span>Panels</span>
              <span className="font-medium">{product.specifications.panels}</span>
            </div>
          )}
          {product.specifications?.capacity && (
            <div className="flex justify-between text-sm">
              <span>Capacity</span>
              <span className="font-medium">{product.specifications.capacity}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Warranty</span>
            <span className="font-medium">{product.warranty}</span>
          </div>
          {product.specifications?.generation && (
            <div className="flex justify-between text-sm">
              <span>Annual generation</span>
              <span className="font-medium">{product.specifications.generation}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-border pt-4">
        <div className="text-2xl font-bold text-primary mb-1">
          ${finalPrice.toLocaleString()}
        </div>
        {product.rebateEligible && product.rebateAmount && (
          <>
            <div className="text-sm text-muted-foreground line-through">
              ${parseFloat(product.price).toLocaleString()}
            </div>
            <div className="text-sm text-accent font-medium">
              After ${parseFloat(product.rebateAmount).toLocaleString()} rebate
            </div>
          </>
        )}
        {!product.rebateEligible && (
          <div className="text-sm text-muted-foreground">Installed price</div>
        )}
      </div>
    </div>
  );
}

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
        "pricing-card border-2 rounded-lg p-4 sm:p-6 cursor-pointer transition-all duration-200 hover:shadow-lg relative touch-manipulation min-h-[280px] sm:min-h-[320px] active:scale-[0.98] flex flex-col justify-between",
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.02]"
          : "border-border hover:border-primary hover:-translate-y-1"
      )}
      onClick={onSelect}
      data-testid={`product-card-${product.id}`}
    >
      {badge && (
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", badgeColor || "bg-secondary text-secondary-foreground")}>
            {badge}
          </span>
        </div>
      )}
      
      <div className="mb-4 flex-1">
        <h4 className="text-lg sm:text-xl font-semibold text-foreground mb-2 leading-tight">{product.name}</h4>
        <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
          {product.specifications?.description || `${product.capacity} capacity system`}
        </p>
        
        <div className="space-y-1 sm:space-y-2">
          {product.specifications?.panels && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Panels</span>
              <span className="font-medium text-foreground">{product.specifications.panels}</span>
            </div>
          )}
          {product.specifications?.capacity && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Capacity</span>
              <span className="font-medium text-foreground">{product.specifications.capacity}</span>
            </div>
          )}
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Warranty</span>
            <span className="font-medium text-foreground">{product.warranty}</span>
          </div>
          {product.specifications?.generation && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Annual generation</span>
              <span className="font-medium text-foreground">{product.specifications.generation}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-border pt-3 sm:pt-4 mt-auto">
        <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
          ${finalPrice.toLocaleString()}
        </div>
        {product.rebateEligible && product.rebateAmount && (
          <>
            <div className="text-xs sm:text-sm text-muted-foreground line-through">
              ${parseFloat(product.price).toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-accent font-medium">
              After ${parseFloat(product.rebateAmount).toLocaleString()} rebate
            </div>
          </>
        )}
        {!product.rebateEligible && (
          <div className="text-xs sm:text-sm text-muted-foreground">Installed price</div>
        )}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: any;
  isSelected: boolean;
  onSelect: () => void;
  badge?: string;
  badgeColor?: string;
  productType?: 'solar' | 'battery' | 'ev_charger';
}

export default function ProductCard({ product, isSelected, onSelect, badge, badgeColor, productType }: ProductCardProps) {
  const finalPrice = product.rebateEligible && product.rebateAmount 
    ? parseFloat(product.price) - parseFloat(product.rebateAmount)
    : parseFloat(product.price);

  // Product type styling
  const getProductTypeStyles = () => {
    switch (productType || product.type) {
      case 'solar':
        return {
          gradient: 'from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20',
          border: 'hover:border-yellow-400',
          accent: 'text-yellow-600',
          icon: '☀️'
        };
      case 'battery':
        return {
          gradient: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
          border: 'hover:border-green-400',
          accent: 'text-green-600',
          icon: '🔋'
        };
      case 'ev_charger':
        return {
          gradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
          border: 'hover:border-blue-400',
          accent: 'text-blue-600',
          icon: '⚡'
        };
      default:
        return {
          gradient: 'from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20',
          border: 'hover:border-primary',
          accent: 'text-primary',
          icon: '⭐'
        };
    }
  };

  const typeStyles = getProductTypeStyles();

  return (
    <div
      className={cn(
        "group relative bg-gradient-to-br rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-[0.98] flex flex-col justify-between",
        "border-2 min-h-[280px] sm:min-h-[320px] touch-manipulation",
        "hover:-translate-y-2 hover:shadow-2xl",
        isSelected
          ? `border-primary bg-primary/10 ring-2 ring-primary/30 scale-[1.02] shadow-lg bg-gradient-to-br ${typeStyles.gradient}`
          : `border-border ${typeStyles.border} bg-gradient-to-br ${typeStyles.gradient}`,
        typeStyles.gradient
      )}
      onClick={onSelect}
      data-testid={`product-card-${product.id}`}
    >
      {/* Product Type Icon */}
      <div className="absolute top-3 left-3 w-8 h-8 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center shadow-sm">
        <span className="text-lg">{typeStyles.icon}</span>
      </div>

      {badge && (
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <span className={cn(
            "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-md",
            badgeColor || "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
          )}>
            {badge}
          </span>
        </div>
      )}
      
      <div className="mt-12 mb-4 flex-1">
        <h4 className="text-lg sm:text-xl font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors duration-300">
          {product.name}
        </h4>
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
          {product.specifications?.description || `${product.capacity} capacity system`}
        </p>
        
        <div className="space-y-2 bg-white/50 dark:bg-gray-900/30 rounded-lg p-3 backdrop-blur-sm">
          {product.specifications?.panels && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Panels</span>
              <span className="font-semibold text-foreground">{product.specifications.panels}</span>
            </div>
          )}
          {product.specifications?.capacity && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Capacity</span>
              <span className="font-semibold text-foreground">{product.specifications.capacity}</span>
            </div>
          )}
          {product.capacity && !product.specifications?.capacity && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Capacity</span>
              <span className="font-semibold text-foreground">{product.capacity}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Warranty</span>
            <span className="font-semibold text-foreground">{product.warranty}</span>
          </div>
          {product.specifications?.generation && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Annual generation</span>
              <span className="font-semibold text-foreground">{product.specifications.generation}</span>
            </div>
          )}
          {product.specifications?.cable && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cable</span>
              <span className="font-semibold text-foreground">{product.specifications.cable}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-white/20 pt-4 mt-auto bg-white/30 dark:bg-gray-900/20 -mx-4 sm:-mx-6 px-4 sm:px-6 -mb-4 sm:-mb-6 pb-4 sm:pb-6 rounded-b-xl backdrop-blur-sm">
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-primary mb-2 group-hover:scale-105 transition-transform duration-300">
            ${finalPrice.toLocaleString()}
          </div>
          {product.rebateEligible && product.rebateAmount && (
            <>
              <div className="text-sm text-muted-foreground line-through mb-1">
                Was ${parseFloat(product.price).toLocaleString()}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 font-semibold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                Save ${parseFloat(product.rebateAmount).toLocaleString()}
              </div>
            </>
          )}
          {!product.rebateEligible && (
            <div className="text-sm text-muted-foreground font-medium">Installed price</div>
          )}
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-primary rounded-xl bg-primary/5 pointer-events-none">
            <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

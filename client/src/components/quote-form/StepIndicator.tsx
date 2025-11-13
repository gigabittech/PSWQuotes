import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
  errors?: { [key: number]: boolean };
  isLoading?: boolean;
}

export default function StepIndicator({ 
  currentStep, 
  onStepClick,
  errors = {},
  isLoading = false 
}: StepIndicatorProps) {
  const steps = [
    { number: 1, title: "System Requirements", shortTitle: "System" },
    { number: 2, title: "Product Selection", shortTitle: "Products" },
    { number: 3, title: "Property Details", shortTitle: "Property" },
    { number: 4, title: "Quote Summary", shortTitle: "Summary" },
  ];

  const handleStepClick = (stepNumber: number) => {
    if ((stepNumber < currentStep || stepNumber === currentStep) && onStepClick && !isLoading) {
      onStepClick(stepNumber);
    }
  };

  const getStepState = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  const isClickable = (stepNumber: number) => {
    return (stepNumber <= currentStep) && onStepClick && !isLoading;
  };

  return (
    <div className="mb-8 px-2 sm:px-4" role="navigation" aria-label="Quote progress">
      {/* Steps with connecting progress bar */}
      <div className="relative flex items-center justify-between max-w-4xl mx-auto gap-1 sm:gap-2">
        {/* Progress bar background - hidden on mobile, shown on larger screens */}
        <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 z-0">
          <div className="h-full bg-muted/50 backdrop-blur-sm rounded-full" />
          {/* Active progress */}
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={steps.length}
          />
        </div>

        {/* Step pills */}
        {steps.map((step) => {
          const state = getStepState(step.number);
          const hasError = errors[step.number];
          const clickable = isClickable(step.number);
          
          return (
            <button
              key={step.number}
              onClick={() => handleStepClick(step.number)}
              disabled={!clickable}
              className={cn(
                "relative z-10 flex-1 sm:flex-none px-2 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-2.5 rounded-full text-xs sm:text-sm md:text-base font-medium",
                "transition-all duration-300 ease-out",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "backdrop-blur-md border min-w-0",
                state === 'current' && [
                  "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30",
                  "scale-105"
                ],
                state === 'completed' && [
                  "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30",
                  clickable && "hover:bg-green-500/20 hover:scale-105 cursor-pointer"
                ],
                state === 'upcoming' && [
                  "bg-muted/30 text-muted-foreground border-muted/40",
                  "opacity-60"
                ],
                hasError && "ring-2 ring-red-500 ring-offset-1",
                !clickable && "cursor-default"
              )}
              data-testid={`step-indicator-${step.number}`}
              aria-label={`${step.title} - ${state}${hasError ? ' (has errors)' : ''}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              {/* Loading spinner */}
              {state === 'current' && isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              
              {/* Error indicator */}
              {hasError && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
              )}
              
              <span className={cn(
                "block truncate text-center",
                state === 'current' && isLoading && "opacity-0"
              )}>
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.shortTitle}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

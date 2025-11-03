import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";

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

  const progressPercentage = Math.round((currentStep / steps.length) * 100);
  const completedSteps = currentStep - 1;

  const handleStepClick = (stepNumber: number) => {
    // Only allow clicking on completed steps or current step
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
    <div className="mb-8" role="navigation" aria-label="Quote progress">
      {/* Progress Summary */}
      <div className="text-center mb-6">
        <div className="text-sm text-muted-foreground mb-2">
          Step {currentStep} of {steps.length} • {progressPercentage}% Complete
        </div>
        <div className="w-full max-w-md mx-auto bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progressPercentage}% complete`}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center space-x-2 md:space-x-4 mb-6">
        {steps.map((step, index) => {
          const state = getStepState(step.number);
          const hasError = errors[step.number];
          const clickable = isClickable(step.number);
          
          return (
            <div key={step.number} className="flex items-center">
              <button
                onClick={() => handleStepClick(step.number)}
                disabled={!clickable}
                className={cn(
                  "glass-step relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full font-semibold",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  state === 'current' && "active",
                  state === 'completed' && [
                    "completed",
                    clickable && "hover:scale-105 cursor-pointer"
                  ],
                  state === 'upcoming' && "opacity-60",
                  hasError && "ring-2 ring-red-500 ring-offset-1",
                  !clickable && "cursor-default"
                )}
                data-testid={`step-indicator-${step.number}`}
                aria-label={`${step.title} - ${state}${hasError ? ' (has errors)' : ''}`}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                {/* Loading spinner for current step */}
                {state === 'current' && isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                
                {/* Error indicator */}
                {hasError && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
                )}
                
                {/* Step content */}
                {state === 'completed' ? (
                  <Check className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
                ) : state === 'current' && !isLoading ? (
                  <span className="text-sm md:text-base">{step.number}</span>
                ) : state === 'upcoming' ? (
                  <span className="text-sm md:text-base">{step.number}</span>
                ) : null}
              </button>
              
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="flex items-center mx-1 md:mx-2">
                  <div
                    className={cn(
                      "h-0.5 md:h-1 rounded transition-all duration-500",
                      "w-8 md:w-16",
                      step.number < currentStep 
                        ? "bg-green-500 shadow-sm" 
                        : "bg-muted-foreground/30"
                    )}
                  />
                  {step.number < currentStep && (
                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-green-500 ml-1" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step Titles */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {steps.map((step) => {
          const state = getStepState(step.number);
          const hasError = errors[step.number];
          
          return (
            <div key={step.number} className="flex flex-col items-center">
              <span
                className={cn(
                  "font-medium text-xs md:text-sm transition-colors duration-300 leading-tight",
                  state === 'current' && "text-primary font-semibold",
                  state === 'completed' && "text-green-600",
                  state === 'upcoming' && "text-muted-foreground",
                  hasError && "text-red-500"
                )}
              >
                {/* Show short title on mobile, full title on desktop */}
                <span className="md:hidden">{step.shortTitle}</span>
                <span className="hidden md:inline">{step.title}</span>
              </span>
              
              {/* Progress indicator for current step */}
              {state === 'current' && (
                <div className="mt-1 w-8 h-0.5 bg-primary rounded-full animate-pulse" />
              )}
              
              {/* Error message */}
              {hasError && (
                <span className="text-xs text-red-500 mt-1">Needs attention</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {currentStep > steps.length && (
        <div className="text-center mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
            <Check className="w-5 h-5" />
            <span className="font-medium">Quote completed successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
}

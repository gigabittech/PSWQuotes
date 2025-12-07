import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StepIndicatorProps {
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
  errors?: { [key: number]: boolean };
  isLoading?: boolean;
  children?: ReactNode;
}

export default function StepIndicator({
  currentStep,
  onStepClick,
  errors = {},
  isLoading = false,
  children
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
    <div className="mb-6 sm:mb-8 flex flex-col items-center w-full px-2 sm:px-4">
      {/* Step Indicator Buttons - Responsive container */}
      <div 
        role="navigation" 
        aria-label="Quote progress"
        className="w-full max-w-4xl relative flex items-center justify-between sm:justify-start gap-1 sm:gap-2 md:gap-4 lg:gap-8 mb-4 sm:mb-6 overflow-x-auto px-2 sm:px-0 hide-scrollbar"
      >
        {/* Connecting lines - hidden on mobile, shown on larger screens */}
        {/* Single continuous line behind all buttons */}
        <div 
          className="hidden sm:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 z-[1] pointer-events-none"
          style={{
            left: '60px',
            right: '60px'
          }}
        >
          <div className="h-full flex" style={{ gap: '1rem' }}>
            {steps.map((step, index) => {
              if (index < steps.length - 1) {
                const isCompleted = step.number < currentStep;
                return (
                  <div
                    key={`line-${step.number}`}
                    className="flex-1 h-full"
                    style={{
                      backgroundColor: isCompleted ? '#19A42033' : '#E5E5E5'
                    }}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Step pills - Responsive */}
        {steps.map((step, index) => {
          const state = getStepState(step.number);
          const isCurrent = state === 'current';
          const isCompleted = state === 'completed';
          const hasError = errors[step.number];
          const clickable = isClickable(step.number);

          return (
            <button
              key={step.number}
              onClick={() => handleStepClick(step.number)}
              disabled={!clickable}
              className="flex-1 sm:flex-none min-w-[50px] xs:min-w-[60px] sm:min-w-[100px] md:min-w-[140px] lg:min-w-[180px] max-w-[calc(25%-4px)] sm:max-w-none h-10 sm:h-12 px-1 xs:px-1.5 sm:px-3 md:px-4 lg:px-5 rounded-full flex items-center justify-center relative z-[2] transition-all duration-300 text-[9px] xs:text-[10px] sm:text-sm md:text-base flex-shrink-0"
              style={{
                background: isCurrent ? '#020817' : isCompleted ? '#E8F5E9' : '#F8F8F8',
                color: isCurrent ? '#FFFFFF' : isCompleted ? '#298F36' : '#787E86',
                border: '1px solid #DDE1E7',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                cursor: clickable ? 'pointer' : 'default',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              data-testid={`step-indicator-${step.number}`}
              aria-label={`${step.title} - ${state}${hasError ? ' (has errors)' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {/* Loading spinner */}
              {isCurrent && isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Error indicator */}
              {hasError && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              )}

              <span 
                className="block text-center truncate px-0.5 sm:px-1 relative z-10 w-full"
                style={{
                  opacity: isCurrent && isLoading ? 0 : 1
                }}
              >
                {/* Show short title on mobile, full title on larger screens */}
                <span className="sm:hidden">{step.shortTitle}</span>
                <span className="hidden sm:inline">{step.title}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Children wrapper with responsive border radius */}
      {children && (
        <div className="w-full max-w-6xl mx-auto rounded-2xl sm:rounded-3xl md:rounded-[65px] overflow-visible p-4 sm:p-6 md:p-8 lg:p-10" style={{ 
          boxSizing: 'border-box'
        }}>
          {children}
        </div>
      )}
    </div>
  );
}
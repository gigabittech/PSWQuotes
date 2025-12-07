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

<<<<<<< HEAD
  // Calculate widths - all steps same size
  const gapSize = 32;
  const totalGaps = steps.length - 1;
  const totalGapWidth = totalGaps * gapSize;
  const availableWidth = 896 - totalGapWidth;
  const stepWidth = availableWidth / steps.length; // All steps same width

  // Calculate positions for connecting lines
  const getStepWidth = () => {
    return stepWidth; // All steps same width
  };

  const getStepLeftPosition = (index: number) => {
    return index * (stepWidth + gapSize);
  };

  return (
    <div className="mb-8 flex flex-col items-center w-full">
      {/* Step Indicator Buttons - Above the container */}
      <div
        role="navigation"
        aria-label="Quote progress"
        className="w-full max-w-4xl h-auto min-h-[47px] flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-between relative gap-2 sm:gap-8 mb-5 px-4"
      >
        {/* Connecting lines - positioned between steps - Hidden on mobile for cleaner look */}
        <div className="hidden sm:block absolute inset-0 pointer-events-none">
          {steps.map((step, index) => {
            if (index < steps.length - 1) {
              const isCompleted = step.number < currentStep;
              // Calculate rough position percentages for lines
              const left = `${(index * 100) / steps.length + 12}%`;
              const width = `${100 / steps.length - 24}%`;

              return (
                <div
                  key={`line-${step.number}`}
                  className="absolute top-1/2 -translate-y-1/2 h-[1px] z-0 transition-colors duration-300"
                  style={{
                    left: left,
                    width: width,
                    backgroundColor: isCompleted ? '#19A42033' : '#E5E5E5',
                  }}
                />
              );
            }
            return null;
          })}
=======
  return (
    <div className="mb-6 sm:mb-8 flex flex-col items-center w-full px-2 sm:px-4">
      {/* Step Indicator Buttons - Responsive container */}
      <div 
        role="navigation" 
        aria-label="Quote progress"
        className="w-full max-w-4xl relative flex items-center justify-between sm:justify-start gap-2 sm:gap-4 md:gap-8 mb-4 sm:mb-6"
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
>>>>>>> b58953ce1af4b4461febe3c0a9c0c67a32891fbb
        </div>

        {/* Step pills - Responsive */}
        {steps.map((step, index) => {
          const state = getStepState(step.number);
          const isCurrent = state === 'current';
          const isCompleted = state === 'completed';
          const hasError = errors[step.number];
          const clickable = isClickable(step.number);
<<<<<<< HEAD

=======
          
>>>>>>> b58953ce1af4b4461febe3c0a9c0c67a32891fbb
          return (
            <button
              key={step.number}
              onClick={() => handleStepClick(step.number)}
              disabled={!clickable}
<<<<<<< HEAD
              className={cn(
                "relative z-10 flex items-center justify-center h-[47px] px-5 rounded-full font-inter text-sm transition-all duration-300 w-full sm:w-auto flex-1 sm:flex-none",
                isCurrent ? "bg-[#020817] text-white" : isCompleted ? "bg-[#19A42033] text-[#298F36] border border-[#298F3633]" : "bg-[#F8F8F8] text-[#787E86]",
                clickable ? "cursor-pointer" : "cursor-default"
              )}
=======
              className="flex-1 sm:flex-none min-w-0 sm:min-w-[120px] md:min-w-[160px] lg:min-w-[200px] h-10 sm:h-12 px-2 sm:px-4 md:px-5 rounded-full flex items-center justify-center relative z-[2] transition-all duration-300 text-xs sm:text-sm md:text-base"
              style={{
                background: isCurrent ? '#020817' : isCompleted ? '#E8F5E9' : '#F8F8F8',
                color: isCurrent ? '#FFFFFF' : isCompleted ? '#298F36' : '#787E86',
                border: isCompleted ? '1px solid #298F3633' : '1px solid transparent',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                cursor: clickable ? 'pointer' : 'default',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              data-testid={`step-indicator-${step.number}`}
>>>>>>> b58953ce1af4b4461febe3c0a9c0c67a32891fbb
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
<<<<<<< HEAD
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              )}

              <span className={cn("block text-center whitespace-nowrap", isCurrent && isLoading ? "opacity-0" : "opacity-100")}>
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.shortTitle}</span>
=======
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white z-20" />
              )}
              
              <span 
                className="block text-center truncate px-1 relative z-10"
                style={{
                  opacity: isCurrent && isLoading ? 0 : 1
                }}
              >
                {/* Show short title on mobile, full title on larger screens */}
                <span className="sm:hidden">{step.shortTitle}</span>
                <span className="hidden sm:inline">{step.title}</span>
>>>>>>> b58953ce1af4b4461febe3c0a9c0c67a32891fbb
              </span>
            </button>
          );
        })}
      </div>
<<<<<<< HEAD

      {/* Children wrapper with responsive border radius and padding */}
      {children && (
        <div className="w-full max-w-5xl mx-auto bg-[#22c55e] rounded-[32px] sm:rounded-[65px] p-6 sm:p-10 box-border block overflow-visible">
=======
      
      {/* Children wrapper with responsive border radius */}
      {children && (
        <div className="w-full max-w-6xl mx-auto rounded-2xl sm:rounded-3xl md:rounded-[65px] overflow-visible p-4 sm:p-6 md:p-8 lg:p-10" style={{ 
          boxSizing: 'border-box'
        }}>
>>>>>>> b58953ce1af4b4461febe3c0a9c0c67a32891fbb
          {children}
        </div>
      )}
    </div>
  );
}

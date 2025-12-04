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
    <div className="mb-8 flex flex-col items-center" style={{ width: '100%' }}>
      {/* Step Indicator Buttons - Above the container */}
      <div 
        role="navigation" 
        aria-label="Quote progress"
        style={{
          width: '896px',
          height: '47px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          position: 'relative',
          opacity: 1,
          gap: '32px',
          marginBottom: '20px'
        }}
      >
        {/* Connecting lines - positioned between steps */}
        {steps.map((step, index) => {
          if (index < steps.length - 1) {
            // Calculate cumulative left position
            const cumulativeLeft = (index + 1) * stepWidth + index * gapSize;
            
            // Line spans the gap between steps
            const lineLeft = cumulativeLeft;
            const lineWidth = gapSize;
            
            // Line is green if the step after it is completed
            const isCompleted = step.number < currentStep;
            
            return (
              <div
                key={`line-${step.number}`}
                style={{
                  position: 'absolute',
                  left: `${lineLeft}px`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: `${lineWidth}px`,
                  height: '1px',
                  backgroundColor: isCompleted ? '#19A42033' : '#E5E5E5',
                  zIndex: 1,
                  pointerEvents: 'none',
                  opacity: 1
                }}
              />
            );
          }
          return null;
        })}

        {/* Step pills */}
        {steps.map((step, index) => {
          const state = getStepState(step.number);
          const isCurrent = state === 'current';
          const isCompleted = state === 'completed';
          const hasError = errors[step.number];
          const clickable = isClickable(step.number);
          const stepWidth = getStepWidth();
          
          return (
            <button
              key={step.number}
              onClick={() => handleStepClick(step.number)}
              disabled={!clickable}
              style={{
                width: `${stepWidth}px`,
                height: '47px',
                paddingTop: '10.55px',
                paddingRight: '20px',
                paddingBottom: '10.55px',
                paddingLeft: '20px',
                borderRadius: '9999px',
                background: isCurrent ? '#020817' : isCompleted ? '#19A42033' : '#F8F8F8',
                color: isCurrent ? '#FFFFFF' : isCompleted ? '#298F36' : '#787E86',
                border: isCompleted ? '1px solid #298F3633' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                cursor: clickable ? 'pointer' : 'default',
                transition: 'all 0.3s ease-out',
                position: 'relative',
                zIndex: 2,
                opacity: 1,
                whiteSpace: 'nowrap',
                overflow: 'visible'
              }}
              data-testid={`step-indicator-${step.number}`}
              aria-label={`${step.title} - ${state}${hasError ? ' (has errors)' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {/* Loading spinner */}
              {isCurrent && isLoading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #FFFFFF',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                </div>
              )}
              
              {/* Error indicator */}
              {hasError && (
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#EF4444',
                  borderRadius: '50%',
                  border: '2px solid #FFFFFF'
                }} />
              )}
              
              <span style={{
                display: 'block',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                opacity: isCurrent && isLoading ? 0 : 1
              }}>
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Children wrapper with 65px border radius */}
      {children && (
        <div style={{ 
          borderRadius: '65px', 
          width: '100%',
          maxWidth: '1024px',
          overflow: 'visible',
          background: '#22c55e',
          padding: '40px',
          margin: '0 auto',
          boxSizing: 'border-box',
          display: 'block'
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const steps = [
    { number: 1, title: "System Requirements" },
    { number: 2, title: "Product Selection" },
    { number: 3, title: "Property Details" },
    { number: 4, title: "Quote Summary" },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4 mb-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={cn(
                "glass-step flex items-center justify-center w-12 h-12 rounded-full font-semibold",
                step.number === currentStep && "active",
                step.number < currentStep && "completed"
              )}
            >
              {step.number < currentStep ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-16 sm:w-20 h-1 rounded-full transition-all duration-300",
                  step.number < currentStep 
                    ? "bg-gradient-to-r from-green-400 to-green-500 shadow-md" 
                    : "bg-gray-200 bg-opacity-50 backdrop-blur-sm"
                )}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center space-x-8 text-sm">
        {steps.map((step) => (
          <span
            key={step.number}
            className={cn(
              "font-medium transition-colors duration-300",
              step.number === currentStep
                ? "text-primary"
                : step.number < currentStep
                ? "text-accent"
                : "text-muted-foreground"
            )}
          >
            {step.title}
          </span>
        ))}
      </div>
    </div>
  );
}

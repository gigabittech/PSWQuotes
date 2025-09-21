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
                "step-indicator flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300",
                step.number === currentStep
                  ? "bg-primary text-primary-foreground"
                  : step.number < currentStep
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted-foreground text-white"
              )}
            >
              {step.number < currentStep ? (
                <i className="fas fa-check"></i>
              ) : (
                step.number
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-16 h-1 rounded transition-colors duration-300",
                  step.number < currentStep ? "bg-accent" : "bg-border"
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

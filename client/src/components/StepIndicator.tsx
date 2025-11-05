import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
    <div className="mb-12">
      {/* Horizontal Timeline Container */}
      <div className="relative">
        {/* Connection Lines Background */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 px-12 md:px-16">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-border/30 to-transparent backdrop-blur-sm" />
        </div>

        {/* Steps Container */}
        <div className="relative flex justify-between items-center px-4">
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            const isFuture = step.number > currentStep;

            return (
              <div key={step.number} className="flex flex-col items-center relative">
                {/* Progress Line Segment */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-6 left-1/2 h-0.5 transition-all duration-500 ease-out",
                      "w-[calc(100vw/4)] md:w-32 lg:w-40",
                      isCompleted
                        ? "bg-gradient-to-r from-accent via-accent/80 to-accent/60 shadow-sm"
                        : "bg-border/20"
                    )}
                    style={{ transformOrigin: 'left center' }}
                  />
                )}

                {/* Step Circle */}
                <div className="relative z-10 mb-3">
                  <div
                    className={cn(
                      "relative flex items-center justify-center rounded-full transition-all duration-350 ease-out",
                      "backdrop-blur-xl border shadow-lg",
                      // Size variations
                      isActive ? "w-14 h-14 scale-110" : "w-12 h-12",
                      // Color and border states
                      isCompleted && "bg-accent/90 border-accent text-white shadow-accent/30",
                      isActive && "bg-primary/10 border-primary/40 text-primary shadow-primary/20",
                      isFuture && "bg-card/60 border-border/40 text-muted-foreground/60 shadow-border/10",
                      // Hover effect
                      !isFuture && "hover:scale-105 cursor-pointer"
                    )}
                    data-testid={`step-indicator-${step.number}`}
                  >
                    {/* Glow Effect for Active Step */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                    )}

                    {/* Content */}
                    <div className="relative z-10 font-inter font-semibold text-sm">
                      {isCompleted ? (
                        <Check className="w-5 h-5 stroke-[3]" />
                      ) : (
                        step.number
                      )}
                    </div>
                  </div>

                  {/* Active Step Pulse Ring */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                  )}
                </div>

                {/* Step Label */}
                <div className="text-center max-w-[100px] md:max-w-[140px]">
                  <p
                    className={cn(
                      "font-outfit text-xs md:text-sm font-medium transition-colors duration-300 leading-tight",
                      isActive && "text-primary font-semibold",
                      isCompleted && "text-accent",
                      isFuture && "text-muted-foreground/60"
                    )}
                    data-testid={`step-label-${step.number}`}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-8 max-w-3xl mx-auto px-4">
        <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-accent rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            data-testid="progress-bar"
          />
        </div>
      </div>
    </div>
  );
}

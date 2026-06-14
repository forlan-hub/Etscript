import { useLocation } from "wouter";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Upload" },
  { label: "Format" },
  { label: "Customize" },
  { label: "Review & Edit" },
  { label: "Preview & Export" },
];

interface WorkflowStepperProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  jobId?: number;
}

function stepPath(step: number, jobId?: number): string | undefined {
  if (step === 1) return "/upload";
  if (!jobId) return undefined;
  if (step === 2) return `/format/${jobId}`;
  if (step === 3) return `/customize/${jobId}`;
  if (step === 4) return `/review/${jobId}`;
  if (step === 5) return `/preview/${jobId}`;
  return undefined;
}

export function WorkflowStepper({ currentStep, jobId }: WorkflowStepperProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="flex items-center mb-8">
      {STEPS.map((step, idx) => {
        const stepNum = (idx + 1) as 1 | 2 | 3 | 4;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const path = stepPath(stepNum, jobId);
        const isClickable = isCompleted && !!path;

        return (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              className={cn(
                "flex items-center gap-2 transition-opacity",
                isClickable ? "cursor-pointer hover:opacity-75" : "cursor-default",
                !isCompleted && !isCurrent && "opacity-40",
              )}
              onClick={() => isClickable && path && setLocation(path)}
              disabled={!isClickable}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors",
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground",
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span
                className={cn(
                  "font-medium text-sm whitespace-nowrap hidden sm:inline",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </button>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 mx-3 transition-colors",
                  isCompleted ? "bg-green-300" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

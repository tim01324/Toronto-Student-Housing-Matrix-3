import { Search, LayoutList, FileText, GitCompareArrows } from 'lucide-react';
import { useNavigate } from 'react-router';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4;
  detailListingId?: string;
  canGoToCompare?: boolean;
}

const steps = [
  { num: 1, label: 'Search', icon: Search },
  { num: 2, label: 'Browse Results', icon: LayoutList },
  { num: 3, label: 'View Details', icon: FileText },
  { num: 4, label: 'Compare', icon: GitCompareArrows },
];

export function StepIndicator({
  currentStep,
  detailListingId,
  canGoToCompare = false,
}: StepIndicatorProps) {
  const navigate = useNavigate();

  const getNavigationTarget = (stepNum: number): string | null => {
    if (stepNum === currentStep) return null;

    switch (stepNum) {
      case 1:
        return currentStep === 2 ? '/' : null;
      case 2:
        return currentStep >= 3 ? '/results' : null;
      case 4:
        return currentStep === 2 && canGoToCompare ? '/compare' : null;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-[1440px] mx-auto px-8 py-3">
        <div className="flex items-center justify-center gap-0">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.num === currentStep;
            const isCompleted = step.num < currentStep;
            const stepPath = getNavigationTarget(step.num);
            const isClickable = Boolean(stepPath);

            return (
              <div key={step.num} className="flex items-center">
                <button
                  type="button"
                  onClick={() => stepPath && navigate(stepPath)}
                  disabled={!isClickable}
                  className={`flex items-center gap-2 transition-opacity ${
                    isClickable ? 'cursor-pointer hover:opacity-85' : 'cursor-default'
                  } ${!isClickable && !isActive ? 'opacity-60' : ''}`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#1E3A8A] text-white shadow-md shadow-blue-200'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? '✓' : step.num}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon
                      size={14}
                      className={
                        isActive
                          ? 'text-[#1E3A8A]'
                          : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }
                    />
                    <span
                      className={`text-sm font-medium ${
                        isActive
                          ? 'text-[#1E3A8A]'
                          : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </button>

                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-3 ${
                      step.num < currentStep ? 'bg-green-400' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

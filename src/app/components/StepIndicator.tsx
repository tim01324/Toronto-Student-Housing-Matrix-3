import { Search, LayoutList, FileText, GitCompareArrows } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4;
}

const steps = [
  { num: 1, label: 'Search', icon: Search },
  { num: 2, label: 'Browse Results', icon: LayoutList },
  { num: 3, label: 'View Details', icon: FileText },
  { num: 4, label: 'Compare', icon: GitCompareArrows },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-[1440px] mx-auto px-8 py-3">
        <div className="flex items-center justify-center gap-0">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.num === currentStep;
            const isCompleted = step.num < currentStep;

            return (
              <div key={step.num} className="flex items-center">
                <div className="flex items-center gap-2">
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
                </div>

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

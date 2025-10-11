"use client";

interface StepProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export default function StepProgressIndicator({
  currentStep,
  totalSteps,
  stepTitles,
}: StepProgressIndicatorProps) {
  return (
    <div className="w-full mb-4">
      <div className="flex items-center justify-center">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="flex items-center">
              {/* ステップ円とタイトル */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors relative z-10 ${
                    isCompleted
                      ? "bg-blue-600 text-white"
                      : isCurrent
                      ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={`text-xs mt-2 text-center max-w-20 ${
                    isCurrent ? "text-blue-600 font-medium" : "text-gray-500"
                  }`}
                >
                  {title}
                </span>
              </div>

              {/* 接続線（最後のステップ以外） */}
              {index < totalSteps - 1 && (
                <div
                  className={`w-16 h-0.5 mx-2 ${
                    isCompleted ? "bg-blue-600" : "bg-gray-200"
                  }`}
                  style={{ marginTop: '-16px' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

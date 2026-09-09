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
    <div className="mb-4 w-full overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div
        className="flex min-w-full items-start"
        style={{
          width: totalSteps > 4 ? `${totalSteps * 88}px` : undefined,
        }}
      >
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={`${stepNumber}-${title}`}
              ref={
                isCurrent
                  ? (node) => {
                      node?.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "center",
                      });
                    }
                  : undefined
              }
              className="relative flex flex-1 flex-col items-center"
            >
              {index < totalSteps - 1 && (
                <div
                  className={`absolute top-[15px] left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 ${
                    isCompleted ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
              <div
                className={`relative z-10 flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  isCompleted
                    ? "bg-blue-600 text-white"
                    : isCurrent
                      ? "border-2 border-blue-600 bg-blue-100 text-blue-600"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <svg
                    className="size-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    role="img"
                    aria-label="完了"
                  >
                    <title>完了</title>
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
                className={`mt-2 max-w-20 text-center text-xs leading-tight ${
                  isCurrent ? "font-medium text-blue-600" : "text-gray-500"
                }`}
              >
                {title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

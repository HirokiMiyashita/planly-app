"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOnboarding } from "@/hooks/useOnboarding";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({
  isOpen,
  onClose,
}: OnboardingModalProps) {
  const {
    currentStep,
    currentStepData,
    isFirstStep,
    isLastStep,
    config,
    nextStep,
    previousStep,
    skipOnboarding,
  } = useOnboarding();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-20 flex items-center justify-center z-50 p-4 bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">{currentStepData.image}</div>
          <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600 text-center leading-relaxed">
            {currentStepData.content}
          </p>

          {/* プログレスバー */}
          <div className="flex justify-center space-x-2">
            {config.steps.map((step, index) => (
              <div
                key={step.title}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* ボタン */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                skipOnboarding();
                onClose();
              }}
              className="text-gray-500"
            >
              スキップ
            </Button>

            <div className="flex space-x-2">
              {!isFirstStep && (
                <Button variant="outline" onClick={previousStep}>
                  戻る
                </Button>
              )}
              <Button
                onClick={() => {
                  if (isLastStep) {
                    skipOnboarding();
                    onClose();
                  } else {
                    nextStep();
                  }
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isLastStep ? "完了" : "次へ"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

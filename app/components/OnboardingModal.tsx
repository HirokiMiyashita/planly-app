"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const onboardingSteps = [
  {
    title: "Planlyへようこそ！",
    content: "Planlyは、グループでイベントの日程を調整できるアプリです。",
    image: "👋",
  },
  {
    title: "イベントを作成",
    content: "「イベント作成」から、イベント名と候補日時を設定できます。",
    image: "📅",
  },
  {
    title: "参加者を招待",
    content:
      "作成したイベントの「招待」ボタンから、参加者にURLを共有できます。",
    image: "📤",
  },
  {
    title: "参加表明",
    content:
      "招待されたURLから、○（参加）、△（未定）、×（不参加）で回答できます。",
    image: "✅",
  },
  {
    title: "日程を確定",
    content:
      "参加状況を確認して、「この日時で確定」ボタンでイベントを確定できます。",
    image: "🎉",
  },
];

export default function OnboardingModal({
  isOpen,
  onClose,
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // オンボーディング完了を記録
    localStorage.setItem("planly-onboarding-completed", "true");
    onClose();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen) return null;

  const currentStepData = onboardingSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === onboardingSteps.length - 1;

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
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
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
              onClick={handleSkip}
              className="text-gray-500"
            >
              スキップ
            </Button>

            <div className="flex space-x-2">
              {!isFirstStep && (
                <Button variant="outline" onClick={handlePrevious}>
                  戻る
                </Button>
              )}
              <Button
                onClick={handleNext}
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

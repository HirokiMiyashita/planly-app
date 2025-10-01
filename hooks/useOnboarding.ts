"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getOnboardingConfigByPath,
  type OnboardingConfig,
  type OnboardingStep,
} from "@/constants/onboarding";

interface UseOnboardingReturn {
  isOpen: boolean;
  currentStep: number;
  currentStepData: OnboardingStep;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  config: OnboardingConfig;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  openUsageGuide: () => void;
}

export function useOnboarding(): UseOnboardingReturn {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // 現在のページに基づいてオンボーディング設定を取得
  const config = getOnboardingConfigByPath(pathname);
  const { steps } = config;

  const currentStepData = steps[currentStep];
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // ページが変わったときにステップをリセット
  useEffect(() => {
    setCurrentStep(0);
  }, []);

  // オンボーディング完了状態をチェック（homeページのみ自動表示）
  useEffect(() => {
    const completedKey = `planly-onboarding-completed-${config.pageKey}`;
    const isCompleted = localStorage.getItem(completedKey) === "true";

    // homeページの初回訪問時のみオンボーディングを自動表示
    if (config.pageKey === "home" && !isCompleted) {
      setIsOpen(true);
    }
  }, [config.pageKey]);

  const openOnboarding = () => {
    setIsOpen(true);
  };

  const closeOnboarding = () => {
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    const completedKey = `planly-onboarding-completed-${config.pageKey}`;
    localStorage.setItem(completedKey, "true");
    closeOnboarding();
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const openUsageGuide = () => {
    setIsOpen(true);
  };

  return {
    isOpen,
    currentStep,
    currentStepData,
    totalSteps,
    isFirstStep,
    isLastStep,
    config,
    openOnboarding,
    closeOnboarding,
    nextStep,
    previousStep,
    completeOnboarding,
    skipOnboarding,
    openUsageGuide,
  };
}

"use client";

import { FlowPage } from "@/components/sdui/flow-page";
import {
  onboardingFlow,
  onboardingWelcomeScreen,
  onboardingRegistrationScreen,
  onboardingPlanSelectionScreen,
} from "@/lib/sdui/schemas/onboarding";

const screens = {
  "onboarding-welcome": onboardingWelcomeScreen,
  "onboarding-registration": onboardingRegistrationScreen,
  "onboarding-plan-selection": onboardingPlanSelectionScreen,
};

export default function OnboardingPage() {
  return <FlowPage flow={onboardingFlow} screens={screens} />;
}

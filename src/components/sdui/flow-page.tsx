"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Screen, Flow } from "@/types/sdui";
import { ScreenRenderer, useSDUIStore, mockUser, mockTenant } from "@/lib/sdui";
import { Spinner } from "@/components/ui/spinner";
import { Stepper } from "@/components/ui/stepper";

interface FlowPageProps {
  flow: Flow;
  screens: Record<string, Screen>;
}

export function FlowPage({ flow, screens }: FlowPageProps) {
  const router = useRouter();
  const [loading] = useState(false);

  // Get store state and actions
  const {
    context,
    setContext,
    state,
    setState,
    screenState,
    setScreenState,
    initializeScreenState,
    formState,
    setFormValue,
    setFormError,
    apiData,
    setCurrentFlow,
    currentStep,
    setCurrentStep,
    prevStep,
    openModal,
    closeModal,
    setLoading: setGlobalLoading,
  } = useSDUIStore();

  // Get current screen based on flow step
  const currentScreen = useMemo(() => {
    const step = flow.steps[currentStep];
    if (!step) return null;
    return screens[step.screenId];
  }, [flow.steps, currentStep, screens]);

  // Initialize context and flow on mount
  useEffect(() => {
    if (!context.user) {
      setContext({
        user: mockUser,
        tenant: mockTenant,
      });
    }
    setCurrentFlow(flow);
  }, [context.user, setContext, setCurrentFlow, flow]);

  // Initialize screen state when current screen changes
  useEffect(() => {
    if (currentScreen?.initialState) {
      initializeScreenState(currentScreen.initialState);
    }
  }, [currentScreen, initializeScreenState]);

  // Compute effective screen state - merge initialState as defaults with actual screenState
  const effectiveScreenState = useMemo(() => ({
    ...(currentScreen?.initialState || {}),
    ...screenState,
  }), [currentScreen?.initialState, screenState]);

  // Stepper steps for display
  const stepperSteps = useMemo(
    () =>
      flow.steps.map((step) => ({
        id: step.id,
        title: step.title || step.id,
        description: step.description,
      })),
    [flow.steps]
  );

  // Navigation handlers
  const navigate = useCallback(
    (path: string, options?: { replace?: boolean }) => {
      if (options?.replace) {
        router.replace(path);
      } else {
        router.push(path);
      }
    },
    [router]
  );

  const navigateBack = useCallback(() => {
    if (currentStep > 0) {
      prevStep();
    } else {
      router.back();
    }
  }, [currentStep, prevStep, router]);

  // API call handler
  const callApi = useCallback(
    async (
      endpoint: string,
      options?: { method?: string; body?: unknown; headers?: Record<string, string> }
    ) => {
      setGlobalLoading(true);
      try {
        // Simulate API call for demo
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // For demo purposes, simulate successful responses
        if (endpoint.includes("send-otp")) {
          return { success: true, message: "OTP sent" };
        }
        if (endpoint.includes("verify-otp")) {
          return { success: true, message: "OTP verified" };
        }
        if (endpoint.includes("register")) {
          return { success: true, message: "Registration complete" };
        }

        const response = await fetch(endpoint, {
          method: options?.method || "GET",
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
          body: options?.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
          throw new Error(`API call failed: ${response.statusText}`);
        }

        return await response.json();
      } finally {
        setGlobalLoading(false);
      }
    },
    [setGlobalLoading]
  );

  // Form handlers
  const submitForm = useCallback(() => {
    console.log("Form submitted:", formState.values);
  }, [formState.values]);

  const validateForm = useCallback(() => {
    return Object.keys(formState.errors).length === 0;
  }, [formState.errors]);

  if (loading || !currentScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress Stepper - Show for multi-step flows */}
      {flow.steps.length > 1 && (
        <div className="bg-white border-b px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <Stepper steps={stepperSteps} currentStep={currentStep} />
          </div>
        </div>
      )}

      {/* Screen Content */}
      <div className="flex-1">
        <ScreenRenderer
          screen={currentScreen}
          context={context}
          state={state}
          screenState={effectiveScreenState}
          formState={formState}
          apiData={apiData}
          setState={setState}
          setScreenState={setScreenState}
          setFormValue={setFormValue}
          setFormError={setFormError}
          navigate={navigate}
          navigateBack={navigateBack}
          currentStep={currentStep}
          setStep={setCurrentStep}
          totalSteps={flow.steps.length}
          callApi={callApi}
          openModal={openModal}
          closeModal={closeModal}
          submitForm={submitForm}
          validateForm={validateForm}
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Screen } from "@/types/sdui";
import { ScreenRenderer, useSDUIStore, mockUser, mockTenant } from "@/lib/sdui";
import { Spinner } from "@/components/ui/spinner";

interface ScreenPageProps {
  screenId: string;
  initialScreen?: Screen;
}

export function ScreenPage({ screenId, initialScreen }: ScreenPageProps) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen | null>(initialScreen || null);
  const [loading, setLoading] = useState(!initialScreen);
  const [error, setError] = useState<string | null>(null);

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
    currentStep,
    setCurrentStep,
    currentFlow,
    openModal,
    closeModal,
    setLoading: setGlobalLoading,
  } = useSDUIStore();

  // Initialize context with mock data on mount
  useEffect(() => {
    if (!context.user) {
      setContext({
        user: mockUser,
        tenant: mockTenant,
      });
    }
  }, [context.user, setContext]);

  // Initialize screen state when screen changes
  useEffect(() => {
    if (screen?.initialState) {
      initializeScreenState(screen.initialState);
    }
  }, [screen, initializeScreenState]);

  // Compute effective screen state - merge initialState as defaults with actual screenState
  const effectiveScreenState = useMemo(() => ({
    ...(screen?.initialState || {}),
    ...screenState,
  }), [screen?.initialState, screenState]);

  // Fetch screen if not provided
  useEffect(() => {
    if (initialScreen) return;

    async function fetchScreen() {
      try {
        setLoading(true);
        const response = await fetch(`/api/screens/${screenId}`);
        if (!response.ok) {
          throw new Error("Screen not found");
        }
        const data = await response.json();
        setScreen(data.screen);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load screen");
      } finally {
        setLoading(false);
      }
    }

    fetchScreen();
  }, [screenId, initialScreen]);

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
    router.back();
  }, [router]);

  // API call handler
  const callApi = useCallback(
    async (
      endpoint: string,
      options?: { method?: string; body?: unknown; headers?: Record<string, string> }
    ) => {
      setGlobalLoading(true);
      try {
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

        const data = await response.json();
        return data;
      } finally {
        setGlobalLoading(false);
      }
    },
    [setGlobalLoading]
  );

  // Form handlers
  const submitForm = useCallback(() => {
    // Implement form submission logic
    console.log("Form submitted:", formState.values);
  }, [formState.values]);

  const validateForm = useCallback(() => {
    // Basic validation - return true if no errors
    return Object.keys(formState.errors).length === 0;
  }, [formState.errors]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading screen..." />
      </div>
    );
  }

  if (error || !screen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-gray-600">{error || "Screen not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <ScreenRenderer
      screen={screen}
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
      totalSteps={currentFlow?.steps.length}
      callApi={callApi}
      openModal={openModal}
      closeModal={closeModal}
      submitForm={submitForm}
      validateForm={validateForm}
    />
  );
}

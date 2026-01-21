"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { Screen } from "@/types/sdui";
import { ScreenSchema } from "@/types/sdui";
import { ScreenRenderer, useSDUIStore, mockUser, mockTenant } from "@/lib/sdui";
import { dashboardScreen } from "@/lib/sdui/schemas/dashboard";
import { onboardingWelcomeScreen, onboardingRegistrationScreen, onboardingPlanSelectionScreen } from "@/lib/sdui/schemas/onboarding";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { ArrowLeft, Play, RefreshCw, Code2, Eye, Smartphone, Monitor, Tablet } from "lucide-react";

// Dynamically import Monaco editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
      Loading editor...
    </div>
  ),
});

// Preset screens for the dropdown
const presetScreens = [
  { value: "dashboard", label: "Dashboard", screen: dashboardScreen },
  { value: "onboarding-welcome", label: "Onboarding: Welcome", screen: onboardingWelcomeScreen },
  { value: "onboarding-registration", label: "Onboarding: Registration", screen: onboardingRegistrationScreen },
  { value: "onboarding-plan-selection", label: "Onboarding: Plan Selection", screen: onboardingPlanSelectionScreen },
];

type ViewportSize = "mobile" | "tablet" | "desktop";

export default function AdminStudioPage() {
  const router = useRouter();
  const [selectedScreen, setSelectedScreen] = useState(presetScreens[0].value);
  const [jsonValue, setJsonValue] = useState(JSON.stringify(presetScreens[0].screen, null, 2));
  const [parsedScreen, setParsedScreen] = useState<Screen | null>(presetScreens[0].screen);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [isDirty, setIsDirty] = useState(false);

  // SDUI Store
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
    openModal,
    closeModal,
  } = useSDUIStore();

  // Initialize context
  useEffect(() => {
    if (!context.user) {
      setContext({
        user: mockUser,
        tenant: mockTenant,
      });
    }
  }, [context.user, setContext]);

  // Initialize screen state when parsed screen changes
  useEffect(() => {
    if (parsedScreen?.initialState) {
      initializeScreenState(parsedScreen.initialState);
    }
  }, [parsedScreen, initializeScreenState]);

  // Compute effective screen state - merge initialState as defaults with actual screenState
  const effectiveScreenState = useMemo(() => ({
    ...(parsedScreen?.initialState || {}),
    ...screenState,
  }), [parsedScreen?.initialState, screenState]);

  // Handle screen selection change
  const handleScreenChange = useCallback((value: string) => {
    const preset = presetScreens.find((p) => p.value === value);
    if (preset) {
      setSelectedScreen(value);
      setJsonValue(JSON.stringify(preset.screen, null, 2));
      setParsedScreen(preset.screen);
      setValidationError(null);
      setIsDirty(false);
    }
  }, []);

  // Handle JSON editor change
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (!value) return;
    setJsonValue(value);
    setIsDirty(true);

    try {
      const parsed = JSON.parse(value);
      const validated = ScreenSchema.safeParse(parsed);

      if (validated.success) {
        setParsedScreen(validated.data);
        setValidationError(null);
      } else {
        setValidationError(
          validated.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n")
        );
      }
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "Invalid JSON");
    }
  }, []);

  // Apply changes to preview
  const handleApplyChanges = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonValue);
      const validated = ScreenSchema.safeParse(parsed);

      if (validated.success) {
        setParsedScreen(validated.data);
        setValidationError(null);
        setIsDirty(false);
      }
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "Invalid JSON");
    }
  }, [jsonValue]);

  // Reset to original
  const handleReset = useCallback(() => {
    const preset = presetScreens.find((p) => p.value === selectedScreen);
    if (preset) {
      setJsonValue(JSON.stringify(preset.screen, null, 2));
      setParsedScreen(preset.screen);
      setValidationError(null);
      setIsDirty(false);
    }
  }, [selectedScreen]);

  // Viewport widths
  const viewportWidths = {
    mobile: "375px",
    tablet: "768px",
    desktop: "100%",
  };

  // Navigation handlers for preview
  const navigate = useCallback((path: string) => {
    console.log("Navigate to:", path);
  }, []);

  const navigateBack = useCallback(() => {
    console.log("Navigate back");
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">SDUI Admin Studio</h1>
          {isDirty && (
            <Badge variant="warning" size="sm">
              Unsaved Changes
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Screen Selector */}
          <Select
            options={presetScreens.map((p) => ({ value: p.value, label: p.label }))}
            value={selectedScreen}
            onChange={(e) => handleScreenChange(e.target.value)}
            className="w-64"
          />

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "editor" ? "primary" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("editor")}
            >
              <Code2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "split" ? "primary" : "ghost"}
              size="sm"
              className="rounded-none border-x"
              onClick={() => setViewMode("split")}
            >
              Split
            </Button>
            <Button
              variant={viewMode === "preview" ? "primary" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("preview")}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Viewport Toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button
              variant={viewport === "mobile" ? "primary" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewport("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              variant={viewport === "tablet" ? "primary" : "ghost"}
              size="sm"
              className="rounded-none border-x"
              onClick={() => setViewport("tablet")}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={viewport === "desktop" ? "primary" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewport("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions */}
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApplyChanges}
            disabled={!isDirty}
          >
            <Play className="h-4 w-4 mr-2" />
            Apply
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* JSON Editor Panel */}
        {(viewMode === "editor" || viewMode === "split") && (
          <div
            className={cn(
              "bg-gray-900 flex flex-col",
              viewMode === "split" ? "w-1/2" : "w-full"
            )}
          >
            {/* Validation Error */}
            {validationError && (
              <div className="p-2 bg-red-900/50">
                <Alert variant="error" className="text-xs">
                  <pre className="whitespace-pre-wrap font-mono">{validationError}</pre>
                </Alert>
              </div>
            )}

            {/* Monaco Editor */}
            <div className="flex-1">
              <MonacoEditor
                height="100%"
                defaultLanguage="json"
                value={jsonValue}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
          </div>
        )}

        {/* Preview Panel */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className={cn(
              "bg-gray-200 flex flex-col overflow-hidden",
              viewMode === "split" ? "w-1/2" : "w-full"
            )}
          >
            <div className="p-2 bg-gray-300 text-center text-sm text-gray-600">
              Live Preview ({viewport})
            </div>
            <div className="flex-1 overflow-auto flex justify-center p-4">
              <div
                className="bg-white shadow-xl rounded-lg overflow-hidden"
                style={{
                  width: viewportWidths[viewport],
                  maxWidth: "100%",
                  minHeight: "100%",
                }}
              >
                {parsedScreen ? (
                  <ScreenRenderer
                    screen={parsedScreen}
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
                    openModal={openModal}
                    closeModal={closeModal}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No valid screen to preview
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

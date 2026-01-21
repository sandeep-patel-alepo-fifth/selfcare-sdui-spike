"use client";

import { useMemo, useCallback, useState, type ReactNode } from "react";
import type { ComponentNode, Screen, Action, DataBinding } from "@/types/sdui";
import { getComponent } from "./component-registry";
import { evaluateConditions } from "./condition-evaluator";
import { resolveDataBindings, resolveAllTemplates } from "./data-binding";
import { createActionHandlers, type ActionContext } from "./action-dispatcher";
import { cn } from "@/lib/utils/cn";

// ============================================================================
// Types
// ============================================================================

export interface SDUIContext {
  // Data context
  user?: Record<string, unknown>;
  tenant?: Record<string, unknown>;
  config?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SDUIState {
  [key: string]: unknown;
}

export interface SDUIFormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export interface SDUIRendererProps {
  // Context and state
  context: SDUIContext;
  state: SDUIState;  // Persistent state
  screenState: SDUIState;  // Screen-local state
  formState: SDUIFormState;
  apiData: Record<string, unknown>;

  // State setters
  setState: (updates: Record<string, unknown>) => void;
  setScreenState: (updates: Record<string, unknown>) => void;
  setFormValue: (field: string, value: unknown) => void;
  setFormError: (field: string, error: string) => void;

  // Navigation
  navigate: (path: string, options?: { replace?: boolean }) => void;
  navigateBack: () => void;

  // Flow control
  currentStep?: number;
  setStep?: (step: number) => void;
  totalSteps?: number;

  // API
  callApi?: (
    endpoint: string,
    options?: { method?: string; body?: unknown; headers?: Record<string, string> }
  ) => Promise<unknown>;

  // Modals
  openModal?: (modalId: string, data?: unknown) => void;
  closeModal?: (modalId?: string) => void;

  // Form
  submitForm?: () => void;
  validateForm?: () => boolean;

  // Custom handlers
  customHandlers?: Record<string, (payload: Record<string, unknown>) => void | Promise<void>>;
}

// ============================================================================
// Dynamic Component Renderer
// ============================================================================

interface DynamicComponentProps {
  node: ComponentNode;
  rendererProps: SDUIRendererProps;
}

function DynamicComponent({ node, rendererProps }: DynamicComponentProps): ReactNode {
  const {
    context,
    state,
    screenState,
    formState,
    apiData,
    setState,
    setScreenState,
    setFormValue,
    navigate,
    navigateBack,
    currentStep,
    setStep,
    totalSteps,
    callApi,
    openModal,
    closeModal,
    submitForm,
    validateForm,
    customHandlers,
  } = rendererProps;

  // Build full context for evaluation - ALWAYS call this hook
  // Merge screenState and persistent state, with screenState taking precedence
  const fullContext = useMemo(
    () => ({
      ...context,
      state: { ...state, ...screenState },  // Merged state for condition evaluation
      form: formState.values,
      api: apiData,
    }),
    [context, state, screenState, formState.values, apiData]
  );

  // Check render conditions - ALWAYS call this hook
  const shouldRender = useMemo(() => {
    if (!node.conditions) return true;
    return evaluateConditions(node.conditions, fullContext);
  }, [node.conditions, fullContext]);

  // Get the component from registry - ALWAYS evaluate this
  const Component = useMemo(() => getComponent(node.type), [node.type]);

  // Resolve data bindings - ALWAYS call this hook
  const resolvedBindings = useMemo(() => {
    if (!node.dataBinding) return {};
    return resolveDataBindings(
      {},
      node.dataBinding as Record<string, DataBinding>,
      { context, state: { ...state, ...screenState }, form: formState.values, api: apiData }
    );
  }, [node.dataBinding, context, state, screenState, formState.values, apiData]);

  // Resolve template strings in props - ALWAYS call this hook
  const resolvedProps = useMemo(() => {
    const props = node.props || {};
    const resolved = resolveAllTemplates(props, fullContext) as Record<string, unknown>;
    // Merge with resolved bindings
    return { ...resolved, ...resolvedBindings };
  }, [node.props, fullContext, resolvedBindings]);

  // Create action context - ALWAYS call this hook
  const actionContext: ActionContext = useMemo(
    () => ({
      context,
      state: { ...state, ...screenState },  // Merged state
      form: formState.values,
      api: apiData,
      setState,
      setScreenState,
      setFormValue,
      navigate,
      navigateBack,
      currentStep,
      setStep,
      totalSteps,
      callApi,
      openModal,
      closeModal,
      submitForm,
      validateForm,
      customHandlers,
    }),
    [
      context,
      state,
      screenState,
      formState.values,
      apiData,
      setState,
      setScreenState,
      setFormValue,
      navigate,
      navigateBack,
      currentStep,
      setStep,
      totalSteps,
      callApi,
      openModal,
      closeModal,
      submitForm,
      validateForm,
      customHandlers,
    ]
  );

  // Create action handlers - ALWAYS call this hook
  const actionHandlers = useMemo(
    () => createActionHandlers(node.actions as Action[] | undefined, actionContext),
    [node.actions, actionContext]
  );

  // Handle special input components with form state - ALWAYS call this hook
  const inputProps = useMemo(() => {
    const isInput = ["input", "textarea", "select", "checkbox", "switch", "otp"].includes(
      node.type
    );
    if (!isInput) return {};

    const fieldName = (node.props?.name as string) || node.id;
    return {
      value: formState.values[fieldName] ?? "",
      error: formState.errors[fieldName],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string) => {
        const value = typeof e === "string" ? e : e.target?.value ?? e;
        setFormValue(fieldName, value);

        // Also trigger any onChange actions
        if (actionHandlers.onChange) {
          actionHandlers.onChange(e);
        }
      },
    };
  }, [node.type, node.props, node.id, formState, setFormValue, actionHandlers]);

  // Render children recursively - ALWAYS call this hook
  const children = useMemo(() => {
    if (!node.children || node.children.length === 0) {
      // Return text content if present in props
      return resolvedProps.children || resolvedProps.text || null;
    }

    return node.children.map((child) => (
      <DynamicComponent key={child.id} node={child} rendererProps={rendererProps} />
    ));
  }, [node.children, resolvedProps.children, resolvedProps.text, rendererProps]);

  // Resolve node.style templates - ALWAYS call this hook
  const resolvedNodeStyle = useMemo(() => {
    if (!node.style) return {};
    return resolveAllTemplates(node.style, fullContext) as Record<string, unknown>;
  }, [node.style, fullContext]);

  // Combine all props - ALWAYS call this hook
  const finalProps = useMemo(() => {
    const props: Record<string, unknown> = {
      ...resolvedProps,
      ...actionHandlers,
      ...inputProps,
      className: cn(resolvedProps.className as string, node.className),
      style: { ...((resolvedProps.style as object) || {}), ...resolvedNodeStyle },
    };

    // Remove props that shouldn't be passed to the component
    const { text: _text, children: _children, ...restProps } = props;

    // Keep children for container-like component types
    if (node.type === "container" || node.type === "grid" || node.type === "flex" || node.type === "stack") {
      return { ...restProps, children: _children };
    }

    return restProps;
  }, [resolvedProps, actionHandlers, inputProps, node.className, resolvedNodeStyle, node.type]);

  // NOW we can do early returns after all hooks have been called
  if (!shouldRender) return null;

  if (!Component) {
    console.warn(`Unknown component type: ${node.type}`);
    return null;
  }

  const FinalComponent = Component as React.ComponentType<any>;
  return <FinalComponent {...finalProps}>{children}</FinalComponent>;
}

// ============================================================================
// Screen Renderer
// ============================================================================

interface ScreenRendererProps extends SDUIRendererProps {
  screen: Screen;
}

export function ScreenRenderer({ screen, ...rendererProps }: ScreenRendererProps): ReactNode {
  // Apply layout styles to the root container
  const layoutStyles = useMemo(() => {
    if (!screen.layout) return {};

    const { columns, gap, margin } = screen.layout;
    return {
      display: screen.layout.type === "grid" ? "grid" : "flex",
      gridTemplateColumns:
        screen.layout.type === "grid" && typeof columns === "number"
          ? `repeat(${columns}, minmax(0, 1fr))`
          : undefined,
      gap: typeof gap === "number" ? `${gap * 0.25}rem` : gap,
      margin: margin && typeof margin === "number" && margin > 0 ? `${margin * 0.25}rem` : undefined,
      flexDirection: screen.layout.type === "flex" ? screen.layout.direction : undefined,
      alignItems: screen.layout.align,
      justifyContent: screen.layout.justify,
    };
  }, [screen.layout]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10" style={layoutStyles}>
        {screen.components.map((component) => (
          <DynamicComponent
            key={component.id}
            node={component}
            rendererProps={rendererProps}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SDUI Provider Hook
// ============================================================================

export function useSDUIRenderer(
  initialContext: SDUIContext = {},
  initialState: SDUIState = {}
) {
  const [state, setStateInternal] = useState(initialState);
  const [formState, setFormState] = useState<SDUIFormState>({
    values: {},
    errors: {},
    touched: {},
  });

  const setState = useCallback((updates: Record<string, unknown>) => {
    setStateInternal((prev) => ({ ...prev, ...updates }));
  }, []);

  const setFormValue = useCallback((field: string, value: unknown) => {
    setFormState((prev) => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      touched: { ...prev.touched, [field]: true },
    }));
  }, []);

  const setFormError = useCallback((field: string, error: string) => {
    setFormState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState({ values: {}, errors: {}, touched: {} });
  }, []);

  return {
    context: initialContext,
    state,
    formState,
    setState,
    setFormValue,
    setFormError,
    resetForm,
  };
}

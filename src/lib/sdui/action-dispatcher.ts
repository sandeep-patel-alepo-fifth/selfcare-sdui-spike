import type { Action } from "@/types/sdui";
import { evaluateConditions } from "./condition-evaluator";
import { resolveAllTemplates } from "./data-binding";
import { toast } from "sonner";

export interface ActionContext {
  // Current context data
  context: Record<string, unknown>;
  state: Record<string, unknown>;  // Merged state (screen + persistent)
  form: Record<string, unknown>;
  api: Record<string, unknown>;

  // Setters
  setState: (updates: Record<string, unknown>) => void;  // For persistent state
  setScreenState?: (updates: Record<string, unknown>) => void;  // For screen-local state
  setFormValue: (field: string, value: unknown) => void;

  // Navigation
  navigate: (path: string, options?: { replace?: boolean }) => void;
  navigateBack: () => void;

  // Flow control (for multi-step flows)
  currentStep?: number;
  setStep?: (step: number) => void;
  totalSteps?: number;

  // API
  callApi?: (
    endpoint: string,
    options?: {
      method?: string;
      body?: unknown;
      headers?: Record<string, string>;
    }
  ) => Promise<unknown>;

  // Modals
  openModal?: (modalId: string, data?: unknown) => void;
  closeModal?: (modalId?: string) => void;

  // Form
  submitForm?: () => void;
  validateForm?: () => boolean;

  // Custom action handlers
  customHandlers?: Record<string, (payload: Record<string, unknown>) => void | Promise<void>>;
}

/**
 * Executes a single action
 */
export async function executeAction(
  action: Action,
  actionContext: ActionContext,
  event?: unknown
): Promise<boolean> {
  // Check condition if present
  if (action.condition) {
    const shouldExecute = evaluateConditions(action.condition, {
      ...actionContext.context,
      state: actionContext.state,
      form: actionContext.form,
      api: actionContext.api,
    });
    if (!shouldExecute) return true; // Skip but don't fail
  }

  // Resolve any template strings in payload
  const resolvedPayload = action.payload
    ? (resolveAllTemplates(action.payload, {
        ...actionContext.context,
        state: actionContext.state,
        form: actionContext.form,
        api: actionContext.api,
        event,
      }) as Record<string, unknown>)
    : {};

  try {
    switch (action.type) {
      case "navigate":
        if (resolvedPayload.route) {
          actionContext.navigate(
            resolvedPayload.route as string,
            { replace: resolvedPayload.replace as boolean }
          );
        }
        break;

      case "navigateBack":
        actionContext.navigateBack();
        break;

      case "setState":
        if (resolvedPayload) {
          // Use setScreenState for screen-local state updates (default behavior)
          // Use setState only for explicitly persistent state
          if (actionContext.setScreenState) {
            actionContext.setScreenState(resolvedPayload);
          } else {
            actionContext.setState(resolvedPayload);
          }
        }
        break;

      case "setPersistentState":
        // Explicitly persist state across screens
        if (resolvedPayload) {
          actionContext.setState(resolvedPayload);
        }
        break;

      case "setField":
        if (resolvedPayload.field && resolvedPayload.value !== undefined) {
          actionContext.setFormValue(
            resolvedPayload.field as string,
            resolvedPayload.value
          );
        }
        break;

      case "showToast":
        const toastType = (resolvedPayload.type as string) || "default";
        const toastMessage = resolvedPayload.message as string;
        const toastTitle = resolvedPayload.title as string;

        switch (toastType) {
          case "success":
            toast.success(toastTitle || toastMessage, {
              description: toastTitle ? toastMessage : undefined,
            });
            break;
          case "error":
            toast.error(toastTitle || toastMessage, {
              description: toastTitle ? toastMessage : undefined,
            });
            break;
          case "warning":
            toast.warning(toastTitle || toastMessage, {
              description: toastTitle ? toastMessage : undefined,
            });
            break;
          case "info":
            toast.info(toastTitle || toastMessage, {
              description: toastTitle ? toastMessage : undefined,
            });
            break;
          default:
            toast(toastTitle || toastMessage, {
              description: toastTitle ? toastMessage : undefined,
            });
        }
        break;

      case "openModal":
        if (actionContext.openModal && resolvedPayload.modalId) {
          actionContext.openModal(
            resolvedPayload.modalId as string,
            resolvedPayload.data
          );
        }
        break;

      case "closeModal":
        if (actionContext.closeModal) {
          actionContext.closeModal(resolvedPayload.modalId as string);
        }
        break;

      case "nextStep":
        if (actionContext.setStep && actionContext.currentStep !== undefined) {
          const nextStep = actionContext.currentStep + 1;
          if (actionContext.totalSteps === undefined || nextStep < actionContext.totalSteps) {
            actionContext.setStep(nextStep);
          }
        }
        break;

      case "prevStep":
        if (actionContext.setStep && actionContext.currentStep !== undefined) {
          const prevStep = Math.max(0, actionContext.currentStep - 1);
          actionContext.setStep(prevStep);
        }
        break;

      case "goToStep":
        if (actionContext.setStep && typeof resolvedPayload.step === "number") {
          actionContext.setStep(resolvedPayload.step);
        }
        break;

      case "submit":
        if (actionContext.submitForm) {
          actionContext.submitForm();
        }
        break;

      case "validate":
        if (actionContext.validateForm) {
          return actionContext.validateForm();
        }
        break;

      case "apiCall":
        if (actionContext.callApi && resolvedPayload.endpoint) {
          try {
            const result = await actionContext.callApi(
              resolvedPayload.endpoint as string,
              {
                method: (resolvedPayload.method as string) || "GET",
                body: resolvedPayload.body,
                headers: resolvedPayload.headers as Record<string, string>,
              }
            );

            // Store result in API context if resultKey is provided
            if (resolvedPayload.resultKey) {
              actionContext.setState({
                api: {
                  ...actionContext.api,
                  [resolvedPayload.resultKey as string]: result,
                },
              });
            }

            // Execute onSuccess actions
            if (action.onSuccess) {
              for (const successAction of action.onSuccess) {
                await executeAction(
                  successAction,
                  { ...actionContext, api: { ...actionContext.api, result } },
                  result
                );
              }
            }
          } catch (error) {
            // Execute onError actions
            if (action.onError) {
              for (const errorAction of action.onError) {
                await executeAction(
                  errorAction,
                  { ...actionContext, api: { ...actionContext.api, error } },
                  error
                );
              }
            } else {
              throw error;
            }
          }
        }
        break;

      case "custom":
        if (
          actionContext.customHandlers &&
          resolvedPayload.handler &&
          actionContext.customHandlers[resolvedPayload.handler as string]
        ) {
          await actionContext.customHandlers[resolvedPayload.handler as string](
            resolvedPayload
          );
        }
        break;

      default:
        console.warn(`Unknown action type: ${action.type}`);
    }

    return true;
  } catch (error) {
    console.error(`Error executing action ${action.type}:`, error);

    // Execute onError actions if available
    if (action.onError) {
      for (const errorAction of action.onError) {
        await executeAction(errorAction, actionContext, error);
      }
    }

    return false;
  }
}

/**
 * Executes multiple actions in sequence
 */
export async function executeActions(
  actions: Action[],
  actionContext: ActionContext,
  event?: unknown
): Promise<boolean> {
  for (const action of actions) {
    const success = await executeAction(action, actionContext, event);
    if (!success) return false;
  }
  return true;
}

/**
 * Creates action handlers for a component
 */
export function createActionHandlers(
  actions: Action[] | undefined,
  actionContext: ActionContext
): Record<string, (event?: unknown) => void> {
  if (!actions || actions.length === 0) return {};

  const handlers: Record<string, (event?: unknown) => void> = {};

  // Group actions by trigger
  const actionsByTrigger = actions.reduce(
    (acc, action) => {
      const trigger = action.trigger;
      if (!acc[trigger]) acc[trigger] = [];
      acc[trigger].push(action);
      return acc;
    },
    {} as Record<string, Action[]>
  );

  // Map triggers to React event handlers
  const triggerToHandler: Record<string, string> = {
    click: "onClick",
    submit: "onSubmit",
    change: "onChange",
    blur: "onBlur",
    focus: "onFocus",
  };

  for (const [trigger, triggerActions] of Object.entries(actionsByTrigger) as [string, Action[]][]) {
    const handlerName = triggerToHandler[trigger];
    if (handlerName) {
      handlers[handlerName] = async (event?: unknown) => {
        await executeActions(triggerActions, actionContext, event);
      };
    }
  }

  return handlers;
}

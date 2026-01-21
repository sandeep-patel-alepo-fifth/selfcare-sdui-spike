import type { RenderCondition, ConditionGroup } from "@/types/sdui";

/**
 * Gets a nested value from an object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return (current as Record<string, unknown>)[key];
  }, obj as unknown);
}

/**
 * Evaluates a single render condition against a context
 */
export function evaluateCondition(
  condition: RenderCondition,
  context: Record<string, unknown>
): boolean {
  const fieldValue = getNestedValue(context, condition.field);
  const conditionValue = condition.value;

  switch (condition.operator) {
    case "eq":
      return fieldValue === conditionValue;

    case "neq":
      return fieldValue !== conditionValue;

    case "gt":
      return typeof fieldValue === "number" && fieldValue > (conditionValue as number);

    case "gte":
      return typeof fieldValue === "number" && fieldValue >= (conditionValue as number);

    case "lt":
      return typeof fieldValue === "number" && fieldValue < (conditionValue as number);

    case "lte":
      return typeof fieldValue === "number" && fieldValue <= (conditionValue as number);

    case "contains":
      if (typeof fieldValue === "string") {
        return fieldValue.includes(conditionValue as string);
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(conditionValue);
      }
      return false;

    case "notContains":
      if (typeof fieldValue === "string") {
        return !fieldValue.includes(conditionValue as string);
      }
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(conditionValue);
      }
      return true;

    case "startsWith":
      return typeof fieldValue === "string" && fieldValue.startsWith(conditionValue as string);

    case "endsWith":
      return typeof fieldValue === "string" && fieldValue.endsWith(conditionValue as string);

    case "in":
      return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);

    case "notIn":
      return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);

    case "exists":
      return fieldValue !== undefined && fieldValue !== null;

    case "notExists":
      return fieldValue === undefined || fieldValue === null;

    default:
      console.warn(`Unknown condition operator: ${condition.operator}`);
      return true;
  }
}

/**
 * Type guard to check if a condition is a ConditionGroup
 */
function isConditionGroup(
  condition: RenderCondition | ConditionGroup
): condition is ConditionGroup {
  return "operator" in condition && ("and" === condition.operator || "or" === condition.operator);
}

/**
 * Evaluates a condition or condition group against a context
 */
export function evaluateConditions(
  conditions: RenderCondition | ConditionGroup | undefined,
  context: Record<string, unknown>
): boolean {
  if (!conditions) return true;

  if (isConditionGroup(conditions)) {
    const results = conditions.conditions.map((c) => evaluateConditions(c, context));

    if (conditions.operator === "and") {
      return results.every(Boolean);
    } else {
      return results.some(Boolean);
    }
  }

  return evaluateCondition(conditions, context);
}

/**
 * Evaluates multiple conditions with AND logic (all must be true)
 */
export function evaluateAllConditions(
  conditions: RenderCondition[],
  context: Record<string, unknown>
): boolean {
  return conditions.every((condition) => evaluateCondition(condition, context));
}

/**
 * Evaluates multiple conditions with OR logic (at least one must be true)
 */
export function evaluateAnyCondition(
  conditions: RenderCondition[],
  context: Record<string, unknown>
): boolean {
  return conditions.some((condition) => evaluateCondition(condition, context));
}

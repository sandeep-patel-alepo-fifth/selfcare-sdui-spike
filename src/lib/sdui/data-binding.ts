import type { DataBinding } from "@/types/sdui";

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
 * Sets a nested value in an object using dot notation
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  const keys = path.split(".");
  const result = { ...obj };
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = { ...(current[key] as Record<string, unknown>) || {} };
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
  return result;
}

/**
 * Transform functions that can be applied to bound data
 */
const transforms: Record<string, (value: unknown, ...args: unknown[]) => unknown> = {
  // String transforms
  uppercase: (value) => (typeof value === "string" ? value.toUpperCase() : value),
  lowercase: (value) => (typeof value === "string" ? value.toLowerCase() : value),
  capitalize: (value) =>
    typeof value === "string"
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : value,
  trim: (value) => (typeof value === "string" ? value.trim() : value),
  truncate: (value, length = 50) =>
    typeof value === "string" && value.length > (length as number)
      ? value.slice(0, length as number) + "..."
      : value,

  // Number transforms
  currency: (value, currency = "USD") =>
    typeof value === "number"
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: currency as string }).format(
          value
        )
      : value,
  percent: (value, decimals = 0) =>
    typeof value === "number"
      ? `${(value * 100).toFixed(decimals as number)}%`
      : value,
  round: (value, decimals = 0) =>
    typeof value === "number" ? Number(value.toFixed(decimals as number)) : value,
  abs: (value) => (typeof value === "number" ? Math.abs(value) : value),

  // Date transforms
  date: (value, format = "short") => {
    const date = value instanceof Date ? value : new Date(value as string);
    if (isNaN(date.getTime())) return value;
    const formats: Record<string, Intl.DateTimeFormatOptions> = {
      short: { month: "short", day: "numeric", year: "numeric" },
      long: { month: "long", day: "numeric", year: "numeric", weekday: "long" },
      time: { hour: "numeric", minute: "numeric" },
      datetime: {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      },
    };
    return date.toLocaleDateString("en-US", formats[format as string] || formats.short);
  },
  relativeTime: (value) => {
    const date = value instanceof Date ? value : new Date(value as string);
    if (isNaN(date.getTime())) return value;
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const diff = date.getTime() - Date.now();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    if (Math.abs(days) < 1) {
      const hours = Math.round(diff / (1000 * 60 * 60));
      if (Math.abs(hours) < 1) {
        const minutes = Math.round(diff / (1000 * 60));
        return rtf.format(minutes, "minute");
      }
      return rtf.format(hours, "hour");
    }
    return rtf.format(days, "day");
  },

  // Array transforms
  join: (value, separator = ", ") =>
    Array.isArray(value) ? value.join(separator as string) : value,
  first: (value) => (Array.isArray(value) ? value[0] : value),
  last: (value) => (Array.isArray(value) ? value[value.length - 1] : value),
  length: (value) => (Array.isArray(value) || typeof value === "string" ? value.length : 0),

  // Boolean transforms
  not: (value) => !value,
  bool: (value) => Boolean(value),

  // Fallback
  default: (value, defaultValue) => (value ?? defaultValue),
};

/**
 * Applies a transform to a value
 */
function applyTransform(value: unknown, transformStr: string): unknown {
  const match = transformStr.match(/^(\w+)(?:\((.+)\))?$/);
  if (!match) return value;

  const [, name, argsStr] = match;
  const transform = transforms[name];
  if (!transform) {
    console.warn(`Unknown transform: ${name}`);
    return value;
  }

  const args = argsStr
    ? argsStr.split(",").map((arg) => {
        const trimmed = arg.trim();
        // Try to parse as number
        if (/^-?\d+\.?\d*$/.test(trimmed)) {
          return Number(trimmed);
        }
        // Remove quotes for strings
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
          return trimmed.slice(1, -1);
        }
        return trimmed;
      })
    : [];

  return transform(value, ...args);
}

/**
 * Resolves a single data binding
 */
export function resolveBinding(
  binding: DataBinding,
  context: {
    context?: Record<string, unknown>;
    state?: Record<string, unknown>;
    form?: Record<string, unknown>;
    api?: Record<string, unknown>;
  }
): unknown {
  let sourceData: Record<string, unknown>;

  switch (binding.source) {
    case "context":
      sourceData = context.context || {};
      break;
    case "state":
      sourceData = context.state || {};
      break;
    case "form":
      sourceData = context.form || {};
      break;
    case "api":
      sourceData = context.api || {};
      break;
    default:
      sourceData = {};
  }

  let value = getNestedValue(sourceData, binding.path);

  // Apply fallback if value is undefined
  if (value === undefined && binding.fallback !== undefined) {
    value = binding.fallback;
  }

  // Apply transform if specified
  if (binding.transform && value !== undefined) {
    value = applyTransform(value, binding.transform);
  }

  return value;
}

/**
 * Resolves all data bindings in a props object
 */
export function resolveDataBindings(
  props: Record<string, unknown> = {},
  bindings: Record<string, DataBinding> = {},
  context: {
    context?: Record<string, unknown>;
    state?: Record<string, unknown>;
    form?: Record<string, unknown>;
    api?: Record<string, unknown>;
  }
): Record<string, unknown> {
  const resolved = { ...props };

  for (const [key, binding] of Object.entries(bindings)) {
    resolved[key] = resolveBinding(binding, context);
  }

  return resolved;
}

/**
 * Safe expression evaluator - handles common patterns without eval/new Function
 */
function safeEvaluateExpression(expression: string, context: Record<string, unknown>): unknown {
  const expr = expression.trim();

  // Handle ternary operator: condition ? trueValue : falseValue
  const ternaryMatch = expr.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/);
  if (ternaryMatch) {
    const condition = safeEvaluateExpression(ternaryMatch[1], context);
    const trueVal = safeEvaluateExpression(ternaryMatch[2], context);
    const falseVal = safeEvaluateExpression(ternaryMatch[3], context);
    return condition ? trueVal : falseVal;
  }

  // Handle comparison operators
  const comparisonOps = ['===', '!==', '>=', '<=', '>', '<', '==', '!='];
  for (const op of comparisonOps) {
    if (expr.includes(op)) {
      const [left, right] = expr.split(op).map(s => s.trim());
      if (left && right) {
        const leftVal = safeEvaluateExpression(left, context);
        const rightVal = safeEvaluateExpression(right, context);
        switch (op) {
          case '===': return leftVal === rightVal;
          case '!==': return leftVal !== rightVal;
          case '==': return leftVal == rightVal;
          case '!=': return leftVal != rightVal;
          case '>=': return (leftVal as number) >= (rightVal as number);
          case '<=': return (leftVal as number) <= (rightVal as number);
          case '>': return (leftVal as number) > (rightVal as number);
          case '<': return (leftVal as number) < (rightVal as number);
        }
      }
    }
  }

  // Handle logical operators
  if (expr.includes('&&')) {
    const parts = expr.split('&&').map(s => s.trim());
    return parts.every(part => safeEvaluateExpression(part, context));
  }
  if (expr.includes('||')) {
    const parts = expr.split('||').map(s => s.trim());
    return parts.some(part => safeEvaluateExpression(part, context));
  }

  // Handle arithmetic operators
  const arithmeticMatch = expr.match(/^(.+?)\s*([+\-*/])\s*(.+)$/);
  if (arithmeticMatch) {
    const left = safeEvaluateExpression(arithmeticMatch[1], context);
    const right = safeEvaluateExpression(arithmeticMatch[3], context);
    const op = arithmeticMatch[2];
    if (typeof left === 'number' && typeof right === 'number') {
      switch (op) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return right !== 0 ? left / right : 0;
      }
    }
    // String concatenation
    if (op === '+') {
      return String(left ?? '') + String(right ?? '');
    }
  }

  // Handle negation
  if (expr.startsWith('!')) {
    return !safeEvaluateExpression(expr.slice(1), context);
  }

  // Handle string literals
  if ((expr.startsWith("'") && expr.endsWith("'")) ||
      (expr.startsWith('"') && expr.endsWith('"'))) {
    return expr.slice(1, -1);
  }

  // Handle number literals
  if (/^-?\d+\.?\d*$/.test(expr)) {
    return Number(expr);
  }

  // Handle boolean literals
  if (expr === 'true') return true;
  if (expr === 'false') return false;
  if (expr === 'null') return null;
  if (expr === 'undefined') return undefined;

  // Handle property access (e.g., state.currentSlide, form.phone)
  return getNestedValue(context, expr);
}

/**
 * Resolves template strings like "Hello, {{user.name}}!" or expressions like "{{state.count + 1}}"
 * If the entire string is a single expression, returns the raw value (preserving type)
 * If mixed with other text, returns a string
 */
export function resolveTemplateString(
  template: string,
  context: Record<string, unknown>
): unknown {
  // Check if the entire template is a single expression (no other text)
  const singleExprMatch = template.match(/^\{\{([^}]+)\}\}$/);
  if (singleExprMatch) {
    const trimmedExpr = singleExprMatch[1].trim();
    const [exprPart, ...transformParts] = trimmedExpr.split("|");
    let value = safeEvaluateExpression(exprPart.trim(), context);
    for (const transform of transformParts) {
      value = applyTransform(value, transform.trim());
    }
    return value; // Return raw value, preserving type (boolean, number, etc.)
  }

  // Mixed template - convert all to strings
  return template.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
    const trimmedExpr = expression.trim();
    const [exprPart, ...transformParts] = trimmedExpr.split("|");
    let value = safeEvaluateExpression(exprPart.trim(), context);
    for (const transform of transformParts) {
      value = applyTransform(value, transform.trim());
    }
    return value !== undefined ? String(value) : "";
  });
}

/**
 * Recursively resolves all template strings in an object
 */
export function resolveAllTemplates(
  obj: unknown,
  context: Record<string, unknown>
): unknown {
  if (typeof obj === "string") {
    return resolveTemplateString(obj, context);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => resolveAllTemplates(item, context));
  }

  if (obj !== null && typeof obj === "object") {
    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = resolveAllTemplates(value, context);
    }
    return resolved;
  }

  return obj;
}

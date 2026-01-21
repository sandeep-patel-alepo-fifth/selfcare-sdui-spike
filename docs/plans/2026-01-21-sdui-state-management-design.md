# SDUI State Management Design

## Overview

This document describes the state management architecture for the Server-Driven UI (SDUI) framework, specifically addressing how screen-local state and persistent state are handled.

## Problem Statement

The original implementation had a single global `state` object in the Zustand store that didn't get initialized from screen definitions. This caused:

1. Screen `initialState` values were ignored
2. Conditions checking state (e.g., `state.currentSlide === 0`) failed on initial render
3. Components that depended on initial state didn't render correctly

## Solution: Hybrid State Management

We implemented a hybrid approach with two types of state:

### Screen-Local State (`screenState`)
- Reset when a screen changes
- Initialized from the screen's `initialState` definition
- Used for UI state specific to a single screen (slide index, form step, etc.)
- Modified via `setState` action (default behavior)

### Persistent State (`state`)
- Survives across screen changes within a flow
- Used for data that needs to persist (selected plan, user choices)
- Modified via `setPersistentState` action

## Architecture

### Store Changes (`src/lib/sdui/store.ts`)

```typescript
interface SDUIStore {
  // Screen-local state (reset when screen changes)
  screenState: Record<string, unknown>;
  initializeScreenState: (initialState: Record<string, unknown>) => void;
  setScreenState: (updates: Record<string, unknown>) => void;

  // Persistent state (survives across screens)
  state: Record<string, unknown>;
  setState: (updates: Record<string, unknown>) => void;
}
```

### Renderer Changes (`src/lib/sdui/renderer.tsx`)

The renderer now receives both `state` and `screenState` and merges them for condition evaluation:

```typescript
const fullContext = useMemo(
  () => ({
    ...context,
    state: { ...state, ...screenState },  // Merged state
    form: formState.values,
    api: apiData,
  }),
  [context, state, screenState, formState.values, apiData]
);
```

### Page Components

Both `FlowPage` and `ScreenPage` compute an `effectiveScreenState` that merges the screen's `initialState` with actual `screenState`. This ensures initial values are available on the first render:

```typescript
const effectiveScreenState = useMemo(() => ({
  ...(currentScreen?.initialState || {}),
  ...screenState,
}), [currentScreen?.initialState, screenState]);
```

### Action Dispatcher Changes

- `setState` action now uses `setScreenState` (screen-local) by default
- New `setPersistentState` action explicitly persists state across screens

## Usage in Schemas

### Screen-Local State (Default)
```typescript
// Defined in screen schema
initialState: {
  currentSlide: 0,
  step: "phone"
}

// Modified via action
actions: [{
  trigger: "click",
  type: "setState",  // Uses screen-local state
  payload: { currentSlide: 1 }
}]
```

### Persistent State
```typescript
// Modified via action
actions: [{
  trigger: "click",
  type: "setPersistentState",  // Persists across screens
  payload: { selectedPlan: "premium" }
}]
```

## Key Benefits

1. **Proper initialization** - Screen state is available on first render
2. **Isolation** - Screen-local state doesn't leak between screens
3. **Flexibility** - Explicit control over what persists
4. **Backward compatible** - Existing `setState` works as expected

## Files Modified

- `src/lib/sdui/store.ts` - Added screenState management
- `src/lib/sdui/renderer.tsx` - Updated to merge state types
- `src/lib/sdui/action-dispatcher.ts` - Added setPersistentState action
- `src/types/sdui.ts` - Added setPersistentState to action types
- `src/components/sdui/flow-page.tsx` - Added effectiveScreenState
- `src/components/sdui/screen-page.tsx` - Added effectiveScreenState
- `src/app/admin/page.tsx` - Added effectiveScreenState

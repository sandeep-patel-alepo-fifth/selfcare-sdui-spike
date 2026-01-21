import { create } from "zustand";
import type { Screen, Flow } from "@/types/sdui";

// ============================================================================
// SDUI Store Types
// ============================================================================

export interface SDUIContextData {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    plan?: {
      type: "prepaid" | "postpaid";
      name: string;
      price: number;
    };
    usage?: {
      data: { used: number; total: number; unit: string };
      voice: { used: number; total: number; unit: string };
      sms: { used: number; total: number; unit: string };
    };
    balance?: number;
  };
  tenant?: {
    id: string;
    name: string;
    logo?: string;
    theme?: string;
  };
  [key: string]: unknown;
}

export interface SDUIFormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export interface SDUIStore {
  // Context
  context: SDUIContextData;
  setContext: (context: Partial<SDUIContextData>) => void;

  // Screen-local state (reset when screen changes)
  screenState: Record<string, unknown>;
  initializeScreenState: (initialState: Record<string, unknown>) => void;
  setScreenState: (updates: Record<string, unknown>) => void;

  // Persistent state (survives across screens)
  state: Record<string, unknown>;
  setState: (updates: Record<string, unknown>) => void;

  // Form state
  formState: SDUIFormState;
  setFormValue: (field: string, value: unknown) => void;
  setFormError: (field: string, error: string) => void;
  setFormTouched: (field: string) => void;
  resetForm: () => void;
  setFormValues: (values: Record<string, unknown>) => void;

  // API data
  apiData: Record<string, unknown>;
  setApiData: (key: string, data: unknown) => void;

  // Flow state
  currentFlow: Flow | null;
  currentStep: number;
  setCurrentFlow: (flow: Flow | null) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Screen cache
  screens: Record<string, Screen>;
  setScreen: (id: string, screen: Screen) => void;

  // Modal state
  activeModals: Array<{ id: string; data?: unknown }>;
  openModal: (id: string, data?: unknown) => void;
  closeModal: (id?: string) => void;

  // Loading state
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

// ============================================================================
// SDUI Store
// ============================================================================

// Initialize with mock data for demo
const initialMockUser: SDUIContextData["user"] = {
  id: "user-001",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  plan: {
    type: "postpaid",
    name: "Premium Plus",
    price: 49.99,
  },
  usage: {
    data: { used: 15.5, total: 25, unit: "GB" },
    voice: { used: 320, total: 500, unit: "min" },
    sms: { used: 45, total: 100, unit: "SMS" },
  },
  balance: 125.50,
};

const initialMockTenant: SDUIContextData["tenant"] = {
  id: "tenant-001",
  name: "TelcoMax",
  logo: "/logo.svg",
  theme: "default",
};

export const useSDUIStore = create<SDUIStore>((set, get) => ({
  // Context - initialize with mock data
  context: { user: initialMockUser, tenant: initialMockTenant },
  setContext: (context) =>
    set((state) => ({ context: { ...state.context, ...context } })),

  // Screen-local state (reset when screen changes)
  screenState: {},
  initializeScreenState: (initialState) =>
    set({ screenState: { ...initialState } }),
  setScreenState: (updates) =>
    set((state) => ({ screenState: { ...state.screenState, ...updates } })),

  // Persistent state (survives across screens)
  state: {},
  setState: (updates) =>
    set((state) => ({ state: { ...state.state, ...updates } })),

  // Form state
  formState: { values: {}, errors: {}, touched: {} },
  setFormValue: (field, value) =>
    set((state) => ({
      formState: {
        ...state.formState,
        values: { ...state.formState.values, [field]: value },
        touched: { ...state.formState.touched, [field]: true },
        // Clear error when value changes
        errors: { ...state.formState.errors, [field]: "" },
      },
    })),
  setFormError: (field, error) =>
    set((state) => ({
      formState: {
        ...state.formState,
        errors: { ...state.formState.errors, [field]: error },
      },
    })),
  setFormTouched: (field) =>
    set((state) => ({
      formState: {
        ...state.formState,
        touched: { ...state.formState.touched, [field]: true },
      },
    })),
  resetForm: () =>
    set({ formState: { values: {}, errors: {}, touched: {} } }),
  setFormValues: (values) =>
    set((state) => ({
      formState: {
        ...state.formState,
        values: { ...state.formState.values, ...values },
      },
    })),

  // API data
  apiData: {},
  setApiData: (key, data) =>
    set((state) => ({ apiData: { ...state.apiData, [key]: data } })),

  // Flow state
  currentFlow: null,
  currentStep: 0,
  setCurrentFlow: (flow) => set({ currentFlow: flow, currentStep: 0 }),
  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => {
    const { currentStep, currentFlow } = get();
    if (currentFlow && currentStep < currentFlow.steps.length - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  // Screen cache
  screens: {},
  setScreen: (id, screen) =>
    set((state) => ({ screens: { ...state.screens, [id]: screen } })),

  // Modal state
  activeModals: [],
  openModal: (id, data) =>
    set((state) => ({
      activeModals: [...state.activeModals, { id, data }],
    })),
  closeModal: (id) =>
    set((state) => ({
      activeModals: id
        ? state.activeModals.filter((m) => m.id !== id)
        : state.activeModals.slice(0, -1),
    })),

  // Loading state
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));

// ============================================================================
// Mock Data
// ============================================================================

export const mockUser: SDUIContextData["user"] = {
  id: "user-001",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  plan: {
    type: "postpaid",
    name: "Premium Plus",
    price: 49.99,
  },
  usage: {
    data: { used: 15.5, total: 25, unit: "GB" },
    voice: { used: 320, total: 500, unit: "min" },
    sms: { used: 45, total: 100, unit: "SMS" },
  },
  balance: 125.50,
};

export const mockTenant: SDUIContextData["tenant"] = {
  id: "tenant-001",
  name: "TelcoMax",
  logo: "/logo.svg",
  theme: "default",
};

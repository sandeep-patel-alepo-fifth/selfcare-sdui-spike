import type { Screen, Flow } from "@/types/sdui";

// ============================================================================
// Welcome Screen (Step 1) - Simplified and Working
// ============================================================================

export const onboardingWelcomeScreen: Screen = {
  version: "1.0",
  id: "onboarding-welcome",
  type: "screen",
  meta: {
    title: "Welcome",
    description: "Welcome slides for new users",
    tags: ["onboarding", "welcome"],
  },
  layout: {
    type: "flex",
    direction: "column",
    padding: 0,
  },
  initialState: {
    currentSlide: 0,
  },
  components: [
    {
      id: "welcome-container",
      type: "container",
      className: "min-h-screen w-full flex flex-col",
      children: [
        // Slides Container
        {
          id: "slides-area",
          type: "container",
          className: "flex-1 relative",
          children: [
            // Slide 1 - Welcome
            {
              id: "slide-1",
              type: "container",
              className: "absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8 text-center bg-gradient-to-br from-indigo-500 to-indigo-700 text-white transition-opacity duration-500",
              style: { opacity: "{{state.currentSlide === 0 ? 1 : 0}}", pointerEvents: "{{state.currentSlide === 0 ? 'auto' : 'none'}}" },
              children: [
                {
                  id: "slide-1-icon",
                  type: "container",
                  className: "mb-6 sm:mb-8 flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm",
                  children: [
                    { id: "s1-emoji", type: "text", props: { text: "👋", className: "text-3xl sm:text-5xl" } },
                  ],
                },
                { id: "slide-1-title", type: "heading", props: { text: "Welcome to TelcoMax", level: 1, className: "text-2xl sm:text-4xl mb-3 sm:mb-4" } },
                { id: "slide-1-desc", type: "text", props: { text: "Your all-in-one mobile management app. Track usage, pay bills, and manage your account with ease.", className: "text-base sm:text-xl opacity-90 max-w-md px-4" } },
              ],
            },
            // Slide 2 - Usage Tracking
            {
              id: "slide-2",
              type: "container",
              className: "absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8 text-center bg-gradient-to-br from-emerald-500 to-emerald-700 text-white transition-opacity duration-500",
              style: { opacity: "{{state.currentSlide === 1 ? 1 : 0}}", pointerEvents: "{{state.currentSlide === 1 ? 'auto' : 'none'}}" },
              children: [
                {
                  id: "slide-2-icon",
                  type: "container",
                  className: "mb-6 sm:mb-8 flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm",
                  children: [
                    { id: "s2-emoji", type: "text", props: { text: "📊", className: "text-3xl sm:text-5xl" } },
                  ],
                },
                { id: "slide-2-title", type: "heading", props: { text: "Real-time Usage Tracking", level: 1, className: "text-2xl sm:text-4xl mb-3 sm:mb-4" } },
                { id: "slide-2-desc", type: "text", props: { text: "Monitor your data, calls, and messages in real-time. Never be surprised by your bill again.", className: "text-base sm:text-xl opacity-90 max-w-md px-4" } },
              ],
            },
            // Slide 3 - Payments
            {
              id: "slide-3",
              type: "container",
              className: "absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8 text-center bg-gradient-to-br from-amber-500 to-amber-700 text-white transition-opacity duration-500",
              style: { opacity: "{{state.currentSlide === 2 ? 1 : 0}}", pointerEvents: "{{state.currentSlide === 2 ? 'auto' : 'none'}}" },
              children: [
                {
                  id: "slide-3-icon",
                  type: "container",
                  className: "mb-6 sm:mb-8 flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm",
                  children: [
                    { id: "s3-emoji", type: "text", props: { text: "💳", className: "text-3xl sm:text-5xl" } },
                  ],
                },
                { id: "slide-3-title", type: "heading", props: { text: "Easy Payments & Recharge", level: 1, className: "text-2xl sm:text-4xl mb-3 sm:mb-4" } },
                { id: "slide-3-desc", type: "text", props: { text: "Pay your bills or recharge your prepaid account in seconds. Multiple payment options available.", className: "text-base sm:text-xl opacity-90 max-w-md px-4" } },
              ],
            },
          ],
        },

        // Navigation Controls
        {
          id: "nav-controls",
          type: "container",
          className: "bg-white px-4 py-6 sm:px-6 sm:py-8 border-t",
          children: [
            // Dot Indicators
            {
              id: "dots",
              type: "flex",
              props: { justify: "center", gap: 3 },
              className: "mb-6",
              children: [
                {
                  id: "dot-0",
                  type: "container",
                  className: "w-3 h-3 rounded-full cursor-pointer transition-all",
                  style: { backgroundColor: "{{state.currentSlide === 0 ? '#6366f1' : '#e2e8f0'}}" },
                  actions: [{ trigger: "click", type: "setState", payload: { currentSlide: 0 } }],
                },
                {
                  id: "dot-1",
                  type: "container",
                  className: "w-3 h-3 rounded-full cursor-pointer transition-all",
                  style: { backgroundColor: "{{state.currentSlide === 1 ? '#6366f1' : '#e2e8f0'}}" },
                  actions: [{ trigger: "click", type: "setState", payload: { currentSlide: 1 } }],
                },
                {
                  id: "dot-2",
                  type: "container",
                  className: "w-3 h-3 rounded-full cursor-pointer transition-all",
                  style: { backgroundColor: "{{state.currentSlide === 2 ? '#6366f1' : '#e2e8f0'}}" },
                  actions: [{ trigger: "click", type: "setState", payload: { currentSlide: 2 } }],
                },
              ],
            },

            // Buttons Row
            {
              id: "buttons",
              type: "flex",
              props: { justify: "between", align: "center" },
              children: [
                // Skip Button
                {
                  id: "skip-btn",
                  type: "button",
                  props: { variant: "ghost", text: "Skip" },
                  actions: [{ trigger: "click", type: "nextStep" }],
                },
                // Next Button (slides 0-1)
                {
                  id: "next-btn",
                  type: "button",
                  props: { variant: "primary", text: "Next" },
                  conditions: { field: "state.currentSlide", operator: "lt", value: 2 },
                  actions: [
                    {
                      trigger: "click",
                      type: "setState",
                      payload: { currentSlide: "{{state.currentSlide + 1}}" },
                    },
                  ],
                },
                // Get Started Button (slide 2)
                {
                  id: "start-btn",
                  type: "button",
                  props: { variant: "primary", text: "Get Started" },
                  conditions: { field: "state.currentSlide", operator: "eq", value: 2 },
                  actions: [{ trigger: "click", type: "nextStep" }],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ============================================================================
// Registration Screen (Step 2) - Phone → OTP → Profile
// ============================================================================

export const onboardingRegistrationScreen: Screen = {
  version: "1.0",
  id: "onboarding-registration",
  type: "screen",
  meta: {
    title: "Create Account",
    description: "User registration form",
    tags: ["onboarding", "registration", "signup"],
  },
  layout: {
    type: "flex",
    direction: "column",
    padding: 0,
  },
  initialState: {
    step: "phone", // "phone" | "otp" | "profile"
    isLoading: false,
  },
  components: [
    {
      id: "reg-container",
      type: "container",
      className: "min-h-screen bg-white flex flex-col",
      children: [
        // Main Content Area
        {
          id: "content",
          type: "container",
          className: "flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12",
          children: [
            // Logo/Brand
            {
              id: "brand",
              type: "container",
              className: "mb-6 sm:mb-8 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-xl sm:text-2xl font-bold",
              children: [{ id: "brand-text", type: "text", props: { text: "TM" } }],
            },

            // =====================
            // PHONE STEP
            // =====================
            {
              id: "phone-step",
              type: "container",
              className: "w-full max-w-sm",
              conditions: { field: "state.step", operator: "eq", value: "phone" },
              children: [
                { id: "phone-title", type: "heading", props: { text: "Create Your Account", level: 1, align: "center", className: "text-xl sm:text-2xl" }, className: "mb-2" },
                { id: "phone-subtitle", type: "text", props: { text: "Enter your phone number to get started", color: "secondary", align: "center", className: "text-sm sm:text-base" }, className: "mb-6 sm:mb-8" },
                {
                  id: "phone-form",
                  type: "stack",
                  props: { gap: 4 },
                  children: [
                    {
                      id: "phone-input",
                      type: "input",
                      props: {
                        name: "phone",
                        label: "Phone Number",
                        type: "tel",
                        placeholder: "+1 (555) 000-0000",
                      },
                    },
                    {
                      id: "send-otp-btn",
                      type: "button",
                      props: {
                        variant: "primary",
                        text: "{{state.isLoading ? 'Sending...' : 'Send Verification Code'}}",
                        className: "w-full",
                        disabled: "{{state.isLoading}}",
                      },
                      actions: [
                        { trigger: "click", type: "setState", payload: { isLoading: true } },
                        {
                          trigger: "click",
                          type: "apiCall",
                          payload: {
                            endpoint: "/api/auth/send-otp",
                            method: "POST",
                            body: { phone: "{{form.phone}}" },
                          },
                          onSuccess: [
                            { trigger: "click", type: "setState", payload: { step: "otp", isLoading: false } },
                            { trigger: "click", type: "showToast", payload: { type: "success", message: "Verification code sent! Use 123456 for demo." } },
                          ],
                          onError: [
                            { trigger: "click", type: "setState", payload: { isLoading: false } },
                            { trigger: "click", type: "showToast", payload: { type: "error", message: "Failed to send code. Please try again." } },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },

            // =====================
            // OTP STEP
            // =====================
            {
              id: "otp-step",
              type: "container",
              className: "w-full max-w-sm",
              conditions: { field: "state.step", operator: "eq", value: "otp" },
              children: [
                { id: "otp-title", type: "heading", props: { text: "Verify Your Phone", level: 1, align: "center", className: "text-xl sm:text-2xl" }, className: "mb-2" },
                { id: "otp-subtitle", type: "text", props: { text: "Enter the 6-digit code sent to {{form.phone}}", color: "secondary", align: "center", className: "text-sm sm:text-base" }, className: "mb-6 sm:mb-8" },
                {
                  id: "otp-form",
                  type: "stack",
                  props: { gap: 4, align: "center" },
                  children: [
                    {
                      id: "otp-input",
                      type: "otp",
                      props: { name: "otp", length: 6 },
                    },
                    { id: "otp-hint", type: "text", props: { text: "Hint: Use 123456 for demo", color: "muted", variant: "small" } },
                    {
                      id: "verify-btn",
                      type: "button",
                      props: {
                        variant: "primary",
                        text: "{{state.isLoading ? 'Verifying...' : 'Verify'}}",
                        className: "w-full",
                        disabled: "{{state.isLoading}}",
                      },
                      actions: [
                        { trigger: "click", type: "setState", payload: { isLoading: true } },
                        {
                          trigger: "click",
                          type: "apiCall",
                          payload: {
                            endpoint: "/api/auth/verify-otp",
                            method: "POST",
                            body: { phone: "{{form.phone}}", otp: "{{form.otp}}" },
                          },
                          onSuccess: [
                            { trigger: "click", type: "setState", payload: { step: "profile", isLoading: false } },
                            { trigger: "click", type: "showToast", payload: { type: "success", message: "Phone verified successfully!" } },
                          ],
                          onError: [
                            { trigger: "click", type: "setState", payload: { isLoading: false } },
                            { trigger: "click", type: "showToast", payload: { type: "error", message: "Invalid code. Please try again." } },
                          ],
                        },
                      ],
                    },
                    {
                      id: "resend-row",
                      type: "flex",
                      props: { gap: 2, justify: "center" },
                      children: [
                        { id: "resend-text", type: "text", props: { text: "Didn't receive code?", color: "muted" } },
                        {
                          id: "resend-btn",
                          type: "button",
                          props: { variant: "link", text: "Resend" },
                          actions: [
                            {
                              trigger: "click",
                              type: "apiCall",
                              payload: { endpoint: "/api/auth/send-otp", method: "POST", body: { phone: "{{form.phone}}" } },
                              onSuccess: [{ trigger: "click", type: "showToast", payload: { type: "success", message: "Code resent!" } }],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      id: "change-phone-btn",
                      type: "button",
                      props: { variant: "ghost", text: "Change Phone Number" },
                      actions: [{ trigger: "click", type: "setState", payload: { step: "phone" } }],
                    },
                  ],
                },
              ],
            },

            // =====================
            // PROFILE STEP
            // =====================
            {
              id: "profile-step",
              type: "container",
              className: "w-full max-w-sm",
              conditions: { field: "state.step", operator: "eq", value: "profile" },
              children: [
                { id: "profile-title", type: "heading", props: { text: "Complete Your Profile", level: 1, align: "center", className: "text-xl sm:text-2xl" }, className: "mb-2" },
                { id: "profile-subtitle", type: "text", props: { text: "Tell us a bit about yourself", color: "secondary", align: "center", className: "text-sm sm:text-base" }, className: "mb-6 sm:mb-8" },
                {
                  id: "profile-form",
                  type: "stack",
                  props: { gap: 4 },
                  children: [
                    {
                      id: "name-row",
                      type: "grid",
                      props: { columns: 2, gap: 4 },
                      children: [
                        { id: "first-name", type: "input", props: { name: "firstName", label: "First Name", placeholder: "John" } },
                        { id: "last-name", type: "input", props: { name: "lastName", label: "Last Name", placeholder: "Doe" } },
                      ],
                    },
                    { id: "email", type: "input", props: { name: "email", label: "Email Address", type: "email", placeholder: "john@example.com" } },
                    { id: "terms", type: "checkbox", props: { name: "acceptTerms", label: "I agree to the Terms of Service and Privacy Policy" } },
                    {
                      id: "continue-btn",
                      type: "button",
                      props: { variant: "primary", text: "Continue to Plan Selection", className: "w-full" },
                      actions: [{ trigger: "click", type: "nextStep" }],
                    },
                  ],
                },
              ],
            },
          ],
        },

        // Progress Indicator
        {
          id: "progress",
          type: "container",
          className: "px-4 py-3 sm:px-6 sm:py-4 border-t bg-slate-50",
          children: [
            {
              id: "progress-steps",
              type: "flex",
              props: { justify: "center", gap: 4 },
              className: "sm:gap-8",
              children: [
                {
                  id: "step-phone",
                  type: "flex",
                  props: { gap: 2, align: "center" },
                  children: [
                    {
                      id: "step-phone-dot",
                      type: "container",
                      className: "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium",
                      style: {
                        backgroundColor: "{{state.step === 'phone' ? '#6366f1' : (state.step === 'otp' || state.step === 'profile') ? '#10b981' : '#e2e8f0'}}",
                        color: "{{state.step === 'phone' || state.step === 'otp' || state.step === 'profile' ? 'white' : '#64748b'}}",
                      },
                      children: [{ id: "sp-num", type: "text", props: { text: "{{state.step === 'otp' || state.step === 'profile' ? '✓' : '1'}}" } }],
                    },
                    { id: "step-phone-label", type: "text", props: { text: "Phone", variant: "small", className: "text-xs sm:text-sm hidden sm:block" } },
                  ],
                },
                {
                  id: "step-otp",
                  type: "flex",
                  props: { gap: 2, align: "center" },
                  children: [
                    {
                      id: "step-otp-dot",
                      type: "container",
                      className: "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium",
                      style: {
                        backgroundColor: "{{state.step === 'otp' ? '#6366f1' : state.step === 'profile' ? '#10b981' : '#e2e8f0'}}",
                        color: "{{state.step === 'otp' || state.step === 'profile' ? 'white' : '#64748b'}}",
                      },
                      children: [{ id: "so-num", type: "text", props: { text: "{{state.step === 'profile' ? '✓' : '2'}}" } }],
                    },
                    { id: "step-otp-label", type: "text", props: { text: "Verify", variant: "small", className: "text-xs sm:text-sm hidden sm:block" } },
                  ],
                },
                {
                  id: "step-profile",
                  type: "flex",
                  props: { gap: 2, align: "center" },
                  children: [
                    {
                      id: "step-profile-dot",
                      type: "container",
                      className: "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium",
                      style: {
                        backgroundColor: "{{state.step === 'profile' ? '#6366f1' : '#e2e8f0'}}",
                        color: "{{state.step === 'profile' ? 'white' : '#64748b'}}",
                      },
                      children: [{ id: "spr-num", type: "text", props: { text: "3" } }],
                    },
                    { id: "step-profile-label", type: "text", props: { text: "Profile", variant: "small", className: "text-xs sm:text-sm hidden sm:block" } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ============================================================================
// Plan Selection Screen (Step 3)
// ============================================================================

export const onboardingPlanSelectionScreen: Screen = {
  version: "1.0",
  id: "onboarding-plan-selection",
  type: "screen",
  meta: {
    title: "Choose Your Plan",
    description: "Plan selection during onboarding",
    tags: ["onboarding", "plans", "subscription"],
  },
  layout: {
    type: "flex",
    direction: "column",
    padding: 0,
  },
  initialState: {
    selectedPlan: null,
    planType: "postpaid",
    isLoading: false,
  },
  components: [
    {
      id: "plan-container",
      type: "container",
      className: "min-h-screen bg-slate-50 flex flex-col",
      children: [
        // Header
        {
          id: "header",
          type: "container",
          className: "bg-white border-b px-4 py-4 sm:px-6 sm:py-6",
          children: [
            { id: "plan-title", type: "heading", props: { text: "Choose Your Plan", level: 1, align: "center", className: "text-xl sm:text-2xl" }, className: "mb-2" },
            { id: "plan-subtitle", type: "text", props: { text: "Select the perfect plan for your needs", color: "secondary", align: "center", className: "text-sm sm:text-base" } },
          ],
        },

        // Plan Type Toggle
        {
          id: "toggle-container",
          type: "container",
          className: "px-4 py-3 sm:px-6 sm:py-4 flex justify-center",
          children: [
            {
              id: "toggle-group",
              type: "flex",
              props: { gap: 1 },
              className: "p-1 bg-white rounded-xl shadow-sm border",
              children: [
                {
                  id: "postpaid-toggle",
                  type: "button",
                  props: {
                    variant: "{{state.planType === 'postpaid' ? 'primary' : 'ghost'}}",
                    text: "Postpaid",
                    className: "px-4 sm:px-6 text-sm sm:text-base",
                  },
                  actions: [{ trigger: "click", type: "setState", payload: { planType: "postpaid", selectedPlan: null } }],
                },
                {
                  id: "prepaid-toggle",
                  type: "button",
                  props: {
                    variant: "{{state.planType === 'prepaid' ? 'primary' : 'ghost'}}",
                    text: "Prepaid",
                    className: "px-4 sm:px-6 text-sm sm:text-base",
                  },
                  actions: [{ trigger: "click", type: "setState", payload: { planType: "prepaid", selectedPlan: null } }],
                },
              ],
            },
          ],
        },

        // Plans Grid
        {
          id: "plans-area",
          type: "container",
          className: "flex-1 px-4 py-3 sm:px-6 sm:py-4 overflow-auto",
          children: [
            // Postpaid Plans
            {
              id: "postpaid-plans",
              type: "grid",
              props: { columns: { sm: 1, md: 3 }, gap: 4 },
              className: "max-w-4xl mx-auto",
              conditions: { field: "state.planType", operator: "eq", value: "postpaid" },
              children: [
                {
                  id: "plan-basic",
                  type: "planCard",
                  props: {
                    name: "Basic",
                    description: "For light users",
                    price: 29.99,
                    currency: "$",
                    period: "/month",
                    features: [
                      { text: "10 GB Data", included: true },
                      { text: "200 Voice Minutes", included: true },
                      { text: "50 SMS", included: true },
                      { text: "5G Access", included: false },
                      { text: "International Calls", included: false },
                    ],
                    isSelected: "{{state.selectedPlan === 'basic'}}",
                  },
                  actions: [{ trigger: "click", type: "setState", payload: { selectedPlan: "basic" } }],
                },
                {
                  id: "plan-premium",
                  type: "planCard",
                  props: {
                    name: "Premium Plus",
                    description: "Most popular choice",
                    price: 49.99,
                    currency: "$",
                    period: "/month",
                    isPopular: true,
                    features: [
                      { text: "25 GB Data", included: true },
                      { text: "500 Voice Minutes", included: true },
                      { text: "Unlimited SMS", included: true },
                      { text: "5G Access", included: true },
                      { text: "International Calls", included: false },
                    ],
                    isSelected: "{{state.selectedPlan === 'premium'}}",
                  },
                  actions: [{ trigger: "click", type: "setState", payload: { selectedPlan: "premium" } }],
                },
                {
                  id: "plan-unlimited",
                  type: "planCard",
                  props: {
                    name: "Unlimited",
                    description: "For power users",
                    price: 79.99,
                    currency: "$",
                    period: "/month",
                    features: [
                      { text: "Unlimited Data", included: true },
                      { text: "Unlimited Voice", included: true },
                      { text: "Unlimited SMS", included: true },
                      { text: "5G Access", included: true },
                      { text: "International Calls", included: true },
                    ],
                    isSelected: "{{state.selectedPlan === 'unlimited'}}",
                  },
                  actions: [{ trigger: "click", type: "setState", payload: { selectedPlan: "unlimited" } }],
                },
              ],
            },

            // Prepaid Plans
            {
              id: "prepaid-plans",
              type: "grid",
              props: { columns: { sm: 1, md: 3 }, gap: 4 },
              className: "max-w-4xl mx-auto",
              conditions: { field: "state.planType", operator: "eq", value: "prepaid" },
              children: [
                {
                  id: "plan-starter",
                  type: "planCard",
                  props: {
                    name: "Starter",
                    description: "30 days validity",
                    price: 15,
                    currency: "$",
                    period: "",
                    features: [
                      { text: "5 GB Data", included: true },
                      { text: "100 Voice Minutes", included: true },
                      { text: "50 SMS", included: true },
                      { text: "4G Access", included: true },
                      { text: "5G Access", included: false },
                    ],
                    isSelected: "{{state.selectedPlan === 'starter'}}",
                  },
                  actions: [{ trigger: "click", type: "setState", payload: { selectedPlan: "starter" } }],
                },
                {
                  id: "plan-value",
                  type: "planCard",
                  props: {
                    name: "Value Pack",
                    description: "30 days validity",
                    price: 30,
                    currency: "$",
                    period: "",
                    isPopular: true,
                    features: [
                      { text: "15 GB Data", included: true },
                      { text: "300 Voice Minutes", included: true },
                      { text: "100 SMS", included: true },
                      { text: "4G Access", included: true },
                      { text: "5G Access", included: true },
                    ],
                    isSelected: "{{state.selectedPlan === 'value'}}",
                  },
                  actions: [{ trigger: "click", type: "setState", payload: { selectedPlan: "value" } }],
                },
                {
                  id: "plan-super",
                  type: "planCard",
                  props: {
                    name: "Super Saver",
                    description: "60 days validity",
                    price: 50,
                    currency: "$",
                    period: "",
                    features: [
                      { text: "30 GB Data", included: true },
                      { text: "Unlimited Voice", included: true },
                      { text: "Unlimited SMS", included: true },
                      { text: "4G Access", included: true },
                      { text: "5G Access", included: true },
                    ],
                    isSelected: "{{state.selectedPlan === 'super'}}",
                  },
                  actions: [{ trigger: "click", type: "setState", payload: { selectedPlan: "super" } }],
                },
              ],
            },
          ],
        },

        // Footer with Action
        {
          id: "footer",
          type: "container",
          className: "bg-white border-t px-4 py-3 sm:px-6 sm:py-4",
          children: [
            {
              id: "footer-content",
              type: "stack",
              props: { gap: 3 },
              className: "max-w-md mx-auto",
              children: [
                {
                  id: "complete-btn",
                  type: "button",
                  props: {
                    variant: "primary",
                    text: "{{state.isLoading ? 'Creating Account...' : 'Complete Registration'}}",
                    className: "w-full",
                    disabled: "{{!state.selectedPlan || state.isLoading}}",
                  },
                  actions: [
                    { trigger: "click", type: "setState", payload: { isLoading: true } },
                    {
                      trigger: "click",
                      type: "apiCall",
                      payload: {
                        endpoint: "/api/auth/register",
                        method: "POST",
                        body: {
                          phone: "{{form.phone}}",
                          firstName: "{{form.firstName}}",
                          lastName: "{{form.lastName}}",
                          email: "{{form.email}}",
                          plan: "{{state.selectedPlan}}",
                          planType: "{{state.planType}}",
                        },
                      },
                      onSuccess: [
                        { trigger: "click", type: "setState", payload: { isLoading: false } },
                        { trigger: "click", type: "showToast", payload: { type: "success", title: "Welcome!", message: "Your account has been created successfully." } },
                        { trigger: "click", type: "navigate", payload: { route: "/dashboard" } },
                      ],
                      onError: [
                        { trigger: "click", type: "setState", payload: { isLoading: false } },
                        { trigger: "click", type: "showToast", payload: { type: "error", message: "Registration failed. Please try again." } },
                      ],
                    },
                  ],
                },
                {
                  id: "back-btn",
                  type: "button",
                  props: { variant: "ghost", text: "Back to Profile", className: "w-full" },
                  actions: [{ trigger: "click", type: "prevStep" }],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ============================================================================
// Onboarding Flow Definition
// ============================================================================

export const onboardingFlow: Flow = {
  version: "1.0",
  id: "onboarding",
  type: "flow",
  meta: {
    title: "Onboarding",
    description: "New user onboarding flow",
    tags: ["onboarding", "signup"],
  },
  steps: [
    {
      id: "welcome",
      screenId: "onboarding-welcome",
      title: "Welcome",
    },
    {
      id: "registration",
      screenId: "onboarding-registration",
      title: "Create Account",
    },
    {
      id: "plan-selection",
      screenId: "onboarding-plan-selection",
      title: "Choose Plan",
    },
  ],
  initialStep: "welcome",
  onComplete: [
    {
      trigger: "submit",
      type: "navigate",
      payload: { route: "/dashboard" },
    },
  ],
};

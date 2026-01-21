import type { Screen } from "@/types/sdui";

export const dashboardScreen: Screen = {
  version: "1.0",
  id: "dashboard",
  type: "screen",
  meta: {
    title: "Dashboard",
    description: "Main dashboard showing user overview, usage, and quick actions",
    requiresAuth: true,
    tags: ["dashboard", "home", "overview"],
  },
  layout: {
    type: "grid",
    columns: 12,
    gap: 8,
    padding: 0,
  },
  initialState: {
    showRechargeModal: false,
  },
  components: [
    // Header Section
    {
      id: "header-container",
      type: "container",
      className: "col-span-12 mb-2",
      children: [
        {
          id: "greeting",
          type: "flex",
          props: {
            justify: "between",
            align: "center",
          },
          children: [
            {
              id: "greeting-text",
              type: "stack",
              props: { gap: 2 },
              children: [
                {
                  id: "welcome-text",
                  type: "text",
                  props: {
                    text: "Welcome back,",
                    variant: "small",
                    color: "secondary",
                  },
                },
                {
                  id: "user-name",
                  type: "heading",
                  props: {
                    text: "{{user.firstName}} {{user.lastName}}",
                    level: 2,
                  },
                },
              ],
            },
            {
              id: "user-avatar",
              type: "avatar",
              props: {
                fallback: "{{user.firstName}} {{user.lastName}}",
                size: "lg",
              },
            },
          ],
        },
      ],
    },

    // Account Summary Card
    {
      id: "account-summary",
      type: "card",
      className: "col-span-12 md:col-span-6 lg:col-span-4",
      props: {
        variant: "elevated",
        padding: "lg",
      },
      children: [
        {
          id: "account-header",
          type: "flex",
          props: { justify: "between", align: "start" },
          children: [
            {
              id: "account-info",
              type: "stack",
              props: { gap: 2 },
              children: [
                {
                  id: "plan-badge",
                  type: "badge",
                  props: {
                    variant: "info",
                  },
                  children: [
                    {
                      id: "plan-type-text",
                      type: "text",
                      props: { text: "{{user.plan.type|uppercase}}" },
                    },
                  ],
                },
                {
                  id: "plan-name",
                  type: "heading",
                  props: {
                    text: "{{user.plan.name}}",
                    level: 4,
                  },
                },
                {
                  id: "plan-price",
                  type: "text",
                  props: {
                    text: "{{user.plan.price|currency}}/month",
                    color: "secondary",
                  },
                },
              ],
            },
          ],
        },
        {
          id: "account-divider",
          type: "divider",
          className: "my-4",
        },
        {
          id: "balance-section",
          type: "flex",
          props: { justify: "between", align: "center" },
          children: [
            {
              id: "balance-label",
              type: "text",
              props: { text: "Current Balance", color: "secondary" },
            },
            {
              id: "balance-value",
              type: "heading",
              props: {
                text: "{{user.balance|currency}}",
                level: 3,
              },
            },
          ],
        },
      ],
    },

    // Usage Widget - Only for postpaid users
    {
      id: "usage-card",
      type: "usageWidget",
      className: "col-span-12 md:col-span-6 lg:col-span-4",
      props: {
        title: "Your Usage",
        items: [
          {
            type: "data",
            used: "{{user.usage.data.used}}",
            total: "{{user.usage.data.total}}",
            unit: "{{user.usage.data.unit}}",
            label: "Mobile Data",
          },
          {
            type: "voice",
            used: "{{user.usage.voice.used}}",
            total: "{{user.usage.voice.total}}",
            unit: "{{user.usage.voice.unit}}",
            label: "Voice Minutes",
          },
          {
            type: "sms",
            used: "{{user.usage.sms.used}}",
            total: "{{user.usage.sms.total}}",
            unit: "{{user.usage.sms.unit}}",
            label: "Text Messages",
          },
        ],
      },
      conditions: {
        field: "user.plan.type",
        operator: "eq",
        value: "postpaid",
      },
    },

    // Quick Actions - For prepaid users (recharge focused)
    {
      id: "prepaid-actions",
      type: "card",
      className: "col-span-12 md:col-span-6 lg:col-span-4",
      props: {
        variant: "default",
        padding: "lg",
      },
      conditions: {
        field: "user.plan.type",
        operator: "eq",
        value: "prepaid",
      },
      children: [
        {
          id: "prepaid-title",
          type: "heading",
          props: { text: "Quick Recharge", level: 4 },
          className: "mb-4",
        },
        {
          id: "recharge-buttons",
          type: "grid",
          props: { columns: 2, gap: 3 },
          children: [
            {
              id: "recharge-10",
              type: "button",
              props: { variant: "outline", text: "$10" },
              actions: [
                {
                  trigger: "click",
                  type: "setState",
                  payload: { rechargeAmount: 10 },
                },
                {
                  trigger: "click",
                  type: "navigate",
                  payload: { route: "/recharge?amount=10" },
                },
              ],
            },
            {
              id: "recharge-20",
              type: "button",
              props: { variant: "outline", text: "$20" },
              actions: [
                {
                  trigger: "click",
                  type: "navigate",
                  payload: { route: "/recharge?amount=20" },
                },
              ],
            },
            {
              id: "recharge-50",
              type: "button",
              props: { variant: "outline", text: "$50" },
              actions: [
                {
                  trigger: "click",
                  type: "navigate",
                  payload: { route: "/recharge?amount=50" },
                },
              ],
            },
            {
              id: "recharge-custom",
              type: "button",
              props: { variant: "primary", text: "Custom" },
              actions: [
                {
                  trigger: "click",
                  type: "navigate",
                  payload: { route: "/recharge" },
                },
              ],
            },
          ],
        },
      ],
    },

    // Quick Actions Card
    {
      id: "quick-actions",
      type: "card",
      className: "col-span-12 lg:col-span-4",
      props: {
        variant: "default",
        padding: "lg",
      },
      children: [
        {
          id: "actions-title",
          type: "heading",
          props: { text: "Quick Actions", level: 4 },
          className: "mb-4",
        },
        {
          id: "actions-list",
          type: "stack",
          props: { gap: 3 },
          children: [
            {
              id: "action-pay-bill",
              type: "button",
              props: {
                variant: "outline",
                text: "Pay Bill",
                className: "w-full justify-start",
              },
              conditions: {
                field: "user.plan.type",
                operator: "eq",
                value: "postpaid",
              },
              actions: [
                {
                  trigger: "click",
                  type: "navigate",
                  payload: { route: "/billing/pay" },
                },
              ],
            },
            {
              id: "action-view-plans",
              type: "button",
              props: {
                variant: "outline",
                text: "View Plans",
                className: "w-full justify-start",
              },
              actions: [
                {
                  trigger: "click",
                  type: "navigate",
                  payload: { route: "/plans" },
                },
              ],
            },
            {
              id: "action-support",
              type: "button",
              props: {
                variant: "outline",
                text: "Contact Support",
                className: "w-full justify-start",
              },
              actions: [
                {
                  trigger: "click",
                  type: "navigate",
                  payload: { route: "/support" },
                },
              ],
            },
            {
              id: "action-settings",
              type: "button",
              props: {
                variant: "ghost",
                text: "Account Settings",
                className: "w-full justify-start",
              },
              actions: [
                {
                  trigger: "click",
                  type: "navigate",
                  payload: { route: "/settings" },
                },
              ],
            },
          ],
        },
      ],
    },

    // KPI Cards Row
    {
      id: "kpi-section",
      type: "container",
      className: "col-span-12 mt-4",
      children: [
        {
          id: "kpi-title",
          type: "heading",
          props: { text: "This Month", level: 4 },
          className: "mb-4",
        },
        {
          id: "kpi-grid",
          type: "grid",
          props: { columns: { sm: 2, lg: 4 }, gap: 6 },
          children: [
            {
              id: "kpi-data-used",
              type: "kpi",
              props: {
                label: "Data Used",
                value: "{{user.usage.data.used}}",
                unit: "GB",
                change: 12,
                changeLabel: "vs last month",
              },
            },
            {
              id: "kpi-calls-made",
              type: "kpi",
              props: {
                label: "Calls Made",
                value: "{{user.usage.voice.used}}",
                unit: "min",
                change: -5,
                changeLabel: "vs last month",
              },
            },
            {
              id: "kpi-messages",
              type: "kpi",
              props: {
                label: "Messages Sent",
                value: "{{user.usage.sms.used}}",
                unit: "SMS",
                change: 8,
                changeLabel: "vs last month",
              },
            },
            {
              id: "kpi-bill",
              type: "kpi",
              props: {
                label: "Current Bill",
                value: "{{user.plan.price|currency}}",
                change: 0,
                changeLabel: "same as usual",
              },
              conditions: {
                field: "user.plan.type",
                operator: "eq",
                value: "postpaid",
              },
            },
          ],
        },
      ],
    },

    // Recent Activity Section
    {
      id: "recent-activity",
      type: "card",
      className: "col-span-12",
      props: {
        variant: "default",
        padding: "lg",
      },
      children: [
        {
          id: "activity-header",
          type: "flex",
          props: { justify: "between", align: "center" },
          className: "mb-4",
          children: [
            {
              id: "activity-title",
              type: "heading",
              props: { text: "Recent Activity", level: 4 },
            },
            {
              id: "view-all-link",
              type: "button",
              props: { variant: "link", text: "View All" },
              actions: [
                {
                  trigger: "click",
                  type: "navigate",
                  payload: { route: "/activity" },
                },
              ],
            },
          ],
        },
        {
          id: "activity-list",
          type: "stack",
          props: { gap: 3 },
          children: [
            {
              id: "activity-1",
              type: "flex",
              props: { justify: "between", align: "center" },
              className: "py-3 border-b border-slate-200",
              children: [
                {
                  id: "activity-1-info",
                  type: "stack",
                  props: { gap: 1 },
                  children: [
                    {
                      id: "activity-1-title",
                      type: "text",
                      props: { text: "Bill Payment", weight: "medium" },
                    },
                    {
                      id: "activity-1-date",
                      type: "text",
                      props: { text: "Jan 15, 2026", variant: "small", color: "muted" },
                    },
                  ],
                },
                {
                  id: "activity-1-amount",
                  type: "text",
                  props: { text: "-$49.99", weight: "semibold", color: "error" },
                },
              ],
            },
            {
              id: "activity-2",
              type: "flex",
              props: { justify: "between", align: "center" },
              className: "py-3 border-b border-slate-200",
              children: [
                {
                  id: "activity-2-info",
                  type: "stack",
                  props: { gap: 1 },
                  children: [
                    {
                      id: "activity-2-title",
                      type: "text",
                      props: { text: "Data Add-on", weight: "medium" },
                    },
                    {
                      id: "activity-2-date",
                      type: "text",
                      props: { text: "Jan 10, 2026", variant: "small", color: "muted" },
                    },
                  ],
                },
                {
                  id: "activity-2-amount",
                  type: "text",
                  props: { text: "-$9.99", weight: "semibold", color: "error" },
                },
              ],
            },
            {
              id: "activity-3",
              type: "flex",
              props: { justify: "between", align: "center" },
              className: "py-2",
              children: [
                {
                  id: "activity-3-info",
                  type: "stack",
                  props: { gap: 1 },
                  children: [
                    {
                      id: "activity-3-title",
                      type: "text",
                      props: { text: "Account Credit", weight: "medium" },
                    },
                    {
                      id: "activity-3-date",
                      type: "text",
                      props: { text: "Jan 5, 2026", variant: "small", color: "muted" },
                    },
                  ],
                },
                {
                  id: "activity-3-amount",
                  type: "text",
                  props: { text: "+$25.00", weight: "semibold", color: "success" },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

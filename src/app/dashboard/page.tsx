"use client";

import { ScreenPage } from "@/components/sdui/screen-page";
import { dashboardScreen } from "@/lib/sdui/schemas/dashboard";

export default function DashboardPage() {
  return <ScreenPage screenId="dashboard" initialScreen={dashboardScreen} />;
}

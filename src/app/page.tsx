"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center text-white mb-12">
          <h1 className="text-5xl font-bold mb-4">Selfcare SDUI Spike</h1>
          <p className="text-xl opacity-90">
            Server-Driven UI Framework for Alepo Selfcare
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>
                View the main dashboard with usage widgets, KPIs, and conditional rendering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                View Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Onboarding Flow</CardTitle>
              <CardDescription>
                Experience the multi-step onboarding: Welcome → Registration → Plan Selection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => router.push("/onboarding")}
              >
                Start Onboarding
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Admin Studio</CardTitle>
              <CardDescription>
                Edit screen schemas with live preview and JSON editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push("/admin")}
              >
                Open Studio
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center text-white/80">
          <p className="text-sm">
            This is a spike/POC demonstrating Server-Driven UI capabilities.
          </p>
          <p className="text-sm mt-1">
            UI is rendered dynamically from JSON schemas.
          </p>
        </div>
      </div>
    </div>
  );
}

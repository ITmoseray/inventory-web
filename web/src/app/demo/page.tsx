import { DemoDashboard } from "@/components/dashboard/demo-dashboard";

export const metadata = {
  title: "Demo Account | Protech Inventory OS",
  description: "Experience Africa's smartest business management platform.",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <DemoDashboard />
    </div>
  );
}

import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import type { DashboardViewModel } from "@/features/dashboard/types";

const emptyDashboard: DashboardViewModel = {
  internship: null,
  activityCount: 0,
  lastActivityAt: null,
  recentActivities: [],
};

export default function DashboardPage() {
  return <DashboardOverview model={emptyDashboard} />;
}

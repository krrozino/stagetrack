import { getActivitySummary } from "@/features/activities";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import type { DashboardViewModel } from "@/features/dashboard/types";
import { getCurrentInternshipOverview } from "@/features/internships";

export default async function DashboardPage() {
  const internshipResult = await getCurrentInternshipOverview();

  if (!internshipResult.ok) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8 dark:border-amber-900 dark:bg-amber-950/40">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Dashboard indisponível</p>
        <h1 className="mt-2 text-2xl font-bold text-amber-950 dark:text-amber-50">
          Não foi possível carregar seu estágio agora.
        </h1>
        <p className="mt-3 text-sm leading-6 text-amber-800 dark:text-amber-200">
          Sua sessão continua protegida. Atualize a página e tente novamente.
        </p>
      </section>
    );
  }

  const internship = internshipResult.data;
  const activityResult = internship
    ? await getActivitySummary(internship.id)
    : {
        ok: true as const,
        data: {
          totalMinutes: 0,
          count: 0,
          lastActivityAt: null,
          recent: [],
        },
      };

  if (!activityResult.ok) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8 dark:border-amber-900 dark:bg-amber-950/40">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Dashboard indisponível</p>
        <h1 className="mt-2 text-2xl font-bold text-amber-950 dark:text-amber-50">
          Não foi possível carregar suas atividades agora.
        </h1>
      </section>
    );
  }

  const activities = activityResult.data;
  const model: DashboardViewModel = {
    internship: internship
      ? {
          id: internship.id,
          title: internship.internship_types.name,
          organizationName: internship.organizations.name,
          completedMinutes: activities.totalMinutes,
          requiredMinutes: internship.required_minutes,
          expectedEndDate: internship.expected_end_date,
          status: internship.status,
        }
      : null,
    activityCount: activities.count,
    lastActivityAt: activities.lastActivityAt,
    recentActivities: activities.recent.map((activity) => ({
      id: activity.id,
      date: activity.activity_date,
      description: activity.description,
      durationMinutes: activity.duration_minutes,
      status: activity.status,
    })),
  };

  return <DashboardOverview model={model} />;
}

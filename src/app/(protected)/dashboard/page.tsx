import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import type { DashboardViewModel } from "@/features/dashboard/types";
import { getCurrentInternshipOverview } from "@/features/internships";

export default async function DashboardPage() {
  const internshipResult = await getCurrentInternshipOverview();

  if (!internshipResult.ok) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
        <p className="text-sm font-semibold text-amber-800">Dashboard indisponível</p>
        <h1 className="mt-2 text-2xl font-bold text-amber-950">
          Não foi possível carregar seu estágio agora.
        </h1>
        <p className="mt-3 text-sm leading-6 text-amber-800">
          Sua sessão continua protegida. Atualize a página e tente novamente.
        </p>
      </section>
    );
  }

  const internship = internshipResult.data;
  const model: DashboardViewModel = {
    internship: internship
      ? {
          id: internship.id,
          title: internship.internship_types.name,
          organizationName: internship.organizations.name,
          completedMinutes: 0,
          requiredMinutes: internship.required_minutes,
          expectedEndDate: internship.expected_end_date,
          status: internship.status,
        }
      : null,
    activityCount: 0,
    lastActivityAt: null,
    recentActivities: [],
  };

  return <DashboardOverview model={model} />;
}

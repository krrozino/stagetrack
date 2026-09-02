import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AuthenticatedHeader } from "@/features/navigation/components/authenticated-header";
import { MobileNavigation } from "@/features/navigation/components/mobile-navigation";
import { Sidebar } from "@/features/navigation/components/sidebar";
import type { NavigationRole } from "@/features/navigation/config/authenticated-navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function roleLabel(role: NavigationRole) {
  switch (role) {
    case "advisor":
      return "Orientador";
    case "coordinator":
      return "Coordenador";
    default:
      return "Estudante";
  }
}

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const supabase = await createClient();
  const { data: claimsData, error } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const userId = claims?.sub;

  if (error || !userId) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,role")
    .eq("id", userId)
    .maybeSingle();

  const email = typeof claims.email === "string" ? claims.email : null;
  const displayName = profile?.full_name ?? email ?? "Usuário StageTrack";
  const role: NavigationRole = profile?.role ?? "student";
  const currentRoleLabel = roleLabel(role);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <Sidebar
        displayName={displayName}
        roleLabel={currentRoleLabel}
        role={role}
        email={email}
      />

      <div className="min-w-0 flex-1">
        <AuthenticatedHeader
          displayName={displayName}
          roleLabel={currentRoleLabel}
          role={role}
        />

        <main className="mx-auto w-full max-w-7xl px-5 py-7 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:py-10 lg:pb-10">
          {children}
        </main>
      </div>

      <MobileNavigation role={role} />
    </div>
  );
}

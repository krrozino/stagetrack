export type NavigationIconName =
  | "dashboard"
  | "internship"
  | "activities"
  | "review"
  | "coordination"
  | "profile";

export type NavigationRole = "student" | "advisor" | "coordinator";

export type AuthenticatedNavigationItem = {
  href: string;
  label: string;
  mobileLabel: string;
  description: string;
  icon: NavigationIconName;
};

const studentNavigation = [
  {
    href: "/dashboard",
    label: "Dashboard",
    mobileLabel: "Início",
    description: "Visão geral do seu estágio",
    icon: "dashboard",
  },
  {
    href: "/internships",
    label: "Meu Estágio",
    mobileLabel: "Estágio",
    description: "Dados e andamento do estágio",
    icon: "internship",
  },
  {
    href: "/activities",
    label: "Atividades",
    mobileLabel: "Atividades",
    description: "Registros e carga horária",
    icon: "activities",
  },
  {
    href: "/profile",
    label: "Perfil",
    mobileLabel: "Perfil",
    description: "Dados acadêmicos e da conta",
    icon: "profile",
  },
] as const satisfies readonly AuthenticatedNavigationItem[];

const advisorNavigation = [
  {
    href: "/advisor",
    label: "Revisões",
    mobileLabel: "Revisões",
    description: "Fila de atividades dos seus estudantes",
    icon: "review",
  },
  {
    href: "/profile",
    label: "Perfil",
    mobileLabel: "Perfil",
    description: "Dados acadêmicos e da conta",
    icon: "profile",
  },
] as const satisfies readonly AuthenticatedNavigationItem[];

const coordinatorNavigation = [
  {
    href: "/coordination",
    label: "Coordenação",
    mobileLabel: "Coordenação",
    description: "Atribuição de orientadores aos estágios",
    icon: "coordination",
  },
  {
    href: "/advisor",
    label: "Revisões",
    mobileLabel: "Revisões",
    description: "Fila de atividades dos seus estudantes",
    icon: "review",
  },
  {
    href: "/profile",
    label: "Perfil",
    mobileLabel: "Perfil",
    description: "Dados acadêmicos e da conta",
    icon: "profile",
  },
] as const satisfies readonly AuthenticatedNavigationItem[];

export function getAuthenticatedNavigation(role: NavigationRole) {
  if (role === "student") {
    return studentNavigation;
  }

  if (role === "coordinator") {
    return coordinatorNavigation;
  }

  return advisorNavigation;
}

export function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findActiveNavigationItem(pathname: string, role: NavigationRole) {
  return getAuthenticatedNavigation(role).find((item) =>
    isNavigationItemActive(pathname, item.href),
  );
}

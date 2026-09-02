export type NavigationIconName =
  | "dashboard"
  | "internship"
  | "activities"
  | "profile";

export type AuthenticatedNavigationItem = {
  href: string;
  label: string;
  mobileLabel: string;
  description: string;
  icon: NavigationIconName;
};

export const authenticatedNavigation = [
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

export function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findActiveNavigationItem(pathname: string) {
  return authenticatedNavigation.find((item) =>
    isNavigationItemActive(pathname, item.href),
  );
}

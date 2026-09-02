import type { NavigationIconName } from "../config/authenticated-navigation";

type NavigationIconProps = {
  name: NavigationIconName;
  className?: string;
};

export function NavigationIcon({
  name,
  className = "h-5 w-5",
}: NavigationIconProps) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "internship":
      return (
        <svg {...common}>
          <path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" />
          <path d="M4.5 7h15A1.5 1.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-9A1.5 1.5 0 0 1 4.5 7Z" />
          <path d="M3 12.5c2.6 1.3 5.6 2 9 2s6.4-.7 9-2" />
          <path d="M10 13.8h4" />
        </svg>
      );
    case "activities":
      return (
        <svg {...common}>
          <path d="M6 3.5h9l3 3V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
          <path d="M15 3.5V7h3.5" />
          <path d="M8 11h7" />
          <path d="M8 14.5h7" />
          <path d="M8 18h4.5" />
        </svg>
      );
    case "review":
      return (
        <svg {...common}>
          <path d="M7 3.5h8l3 3V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
          <path d="M15 3.5V7h3.5" />
          <path d="m9 13 2 2 4-4" />
          <path d="M9 18h6" />
        </svg>
      );
    case "profile":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.25" />
          <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="4.5" rx="1.5" />
          <rect x="13.5" y="10.5" width="7" height="10" rx="1.5" />
          <rect x="3.5" y="13" width="7" height="7.5" rx="1.5" />
        </svg>
      );
  }
}

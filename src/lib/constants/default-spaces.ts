export const DEFAULT_SPACES = [
  {
    name: "Personal",
    type: "personal" as const,
    description: "Your private logins and personal accounts. Private to you.",
    color: "#006FEE",
    icon: "UserIcon",
  },
  {
    name: "Work",
    type: "company" as const,
    description: "Work tools, company accounts and team credentials.",
    color: "#7828C8",
    icon: "BriefcaseIcon",
  },
  {
    name: "Finance",
    type: "personal" as const,
    description: "Banking, payments, wallets and financial services.",
    color: "#17C964",
    icon: "CreditCardIcon",
  },
  {
    name: "Social",
    type: "personal" as const,
    description: "Social media and communication apps.",
    color: "#06B7DB",
    icon: "GlobeAltIcon",
  },
] as const;

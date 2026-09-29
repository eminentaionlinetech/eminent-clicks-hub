export type Tool = {
  id: string;
  name: string;
  initial: string;
  price: number;
  tagline: string;
};

export const TOOLS: Tool[] = [
  {
    id: "subtrack",
    name: "SubTrack",
    initial: "S",
    price: 5000,
    tagline: "Recurrence & payee monitoring",
  },
  {
    id: "jobflow",
    name: "JobFlow",
    initial: "J",
    price: 10000,
    tagline: "Application pipeline builder",
  },
  {
    id: "paychaser",
    name: "PayChaser",
    initial: "P",
    price: 10000,
    tagline: "Invoice dunning & reminders",
  },
  {
    id: "reportsnap",
    name: "ReportSnap",
    initial: "R",
    price: 10000,
    tagline: "One-tap statement exports",
  },
  {
    id: "claimdesk",
    name: "ClaimDesk",
    initial: "C",
    price: 10000,
    tagline: "Dispute & claim handling",
  },
];

export const BANK = {
  name: "Kuda Bank",
  account: "2088333205",
  holder: "Okechukwu Chimaobi Destiny",
};

export function formatNaira(amount: number) {
  return "\u20a6" + amount.toLocaleString("en-NG");
}

export function toolById(id: string) {
  return TOOLS.find((t) => t.id === id);
}

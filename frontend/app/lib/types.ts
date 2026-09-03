export type User = {
  id: number;
  name: string | null;
  email: string;
};

export type AssistantAnswer = {
  question: string;
  answer: string;
  sources: string[];
  grounded: boolean;
};

export type Trip = {
  id: number;
  destination: string;
  days: number;
  budget: number;
  category: string;
  daily_budget: number;
  travel_season: string;
  reccomendation_transport: string;
  travel_style: string | null;
  ai_recommendation: string | null;
  created_at: string;
};

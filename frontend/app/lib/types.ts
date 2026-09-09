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

export type ConversationMessage = {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  sources?: string[] | null;
};

// The model closes a concrete plan with a ```trip block carrying these four
// fields; the chat turns it into a one-click "save as trip".
export type TripProposal = {
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
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

import { authFetch } from "./auth";
import type { Trip, TripProposal } from "./types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export type NewTrip = {
  destination: string;
  days: number;
  budget: number;
  travel_month: string;
  travel_style: string;
};

async function post(path: string, body?: unknown): Promise<Trip> {
  const response = await authFetch(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(`POST ${path} returned ${response.status}`);
  return response.json();
}

/** Create the trip, then fill in its AI itinerary. Used by the planner form and
 *  the chat's "save as trip" card. */
export async function createTrip(input: NewTrip): Promise<Trip> {
  const created = await post("/api/v1/trips", { ...input, currency: "USD" });
  return post(`/api/v1/trips/${created.id}/generate`);
}

export function createTripFromProposal(p: TripProposal): Promise<Trip> {
  return createTrip({
    destination: p.destination,
    days: p.days,
    budget: p.budget,
    travel_month: MONTHS[new Date().getMonth()],
    travel_style: p.travel_style,
  });
}

import type { LocationInput } from "./LocationInput";

export interface CreateAgencyModel {
  name: string;
  missionStatement: string;
  websiteUrl: string;
  location: LocationInput;
  /** Whether to show the agent's email and phone number on the public agency page. */
  showContactInfo: boolean;
}

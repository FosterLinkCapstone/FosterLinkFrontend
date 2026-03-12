import type { LocationInput } from "./LocationInput";

export interface CreateAgencyModel {
  name: string;
  missionStatement: string;
  websiteUrl: string;
  location: LocationInput;
}

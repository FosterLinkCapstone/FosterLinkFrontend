export interface CreateAgencyModel {
  name: string;
  missionStatement: string;
  websiteUrl: string;
  locationCity: string;
  locationState: string;
  locationZipCode: number;
  locationAddrLine1: string;
  locationAddrLine2?: string;
}
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/net-fosterlink/backend/AuthContext";
import type { AgencyModel } from "@/net-fosterlink/backend/models/AgencyModel";
import { getInitials } from "@/net-fosterlink/util/StringUtil";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { useRef } from "react";

export const AgencyCard = ({ agency, onRemove, highlighted } : { agency: AgencyModel, onRemove: (agencyId: number) => void, highlighted?: boolean }) => {

  const auth = useAuth()
  const fullAddress = `${agency.location.addrLine1}${agency.location.addrLine2 ? ', ' + agency.location.addrLine2 : ''}, ${agency.location.city}, ${agency.location.state} ${agency.location.zipCode}`;
  const encodedAddress = encodeURIComponent(fullAddress);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      
  const staticMapUrl = useRef(`https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=15&size=300x200&markers=color:red%7C${encodedAddress}&key=${auth.getMapsApiKey()}`);

  return (
    <Card id={`${agency.id}`} className={`w-full h-fit max-w-4xl ${highlighted ? "ring-2 ring-blue-400" : ""}`}>
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-center">{agency.agencyName}</h2>
          {
            (agency.approved == 2 && auth.admin) && 
            <Button variant="outline" className="bg-red-200 text-red-400" onClick={() => onRemove(agency.id)}>Remove</Button>
          }
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-700 leading-relaxed">
              {agency.agencyMissionStatement}
            </p>
          </div>

          {agency.agencyWebsiteLink && (
            <a 
              href={agency.agencyWebsiteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1 text-sm"
            >
              Visit Website <ExternalLink size={14} />
            </a>
          )}
        </div>

        <div className="w-full md:w-80 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-4 mb-4">   
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                {agency.agent.profilePictureUrl ? (
                  <img 
                    src={agency.agent.profilePictureUrl} 
                    alt={`${agency.agent.fullName}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-2xl">
                    {getInitials(agency.agent.fullName)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-start">
                <h3 className="font-semibold text-lg">
                  {agency.agent.fullName}
                </h3>
                <div className="flex items-start gap-2 text-sm text-gray-600 mt-1">
                  <Phone size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{agency.agentInfo.phoneNumber}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600 mt-1 break-all">
                  <Mail size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{agency.agentInfo.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <a 
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="relative rounded-lg overflow-hidden border border-gray-200 mb-3 hover:border-blue-400 transition-colors">
                <img 
                  src={staticMapUrl.current}
                  alt="Location preview"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black-1000/0 hover:bg-black-1000/25 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 bg-white rounded-full p-2 shadow-lg transition-opacity">
                    <ExternalLink size={20} className="text-blue-500" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <div>
                  <div>{agency.location.addrLine1}</div>
                  {agency.location.addrLine2 && <div>{agency.location.addrLine2}</div>}
                  <div>{agency.location.city}, {agency.location.state} {agency.location.zipCode}</div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
};
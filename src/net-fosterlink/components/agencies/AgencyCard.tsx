import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/net-fosterlink/backend/AuthContext";
import type { AgencyModel } from "@/net-fosterlink/backend/models/AgencyModel";
import { getInitials } from "@/net-fosterlink/util/StringUtil";
import { buildProfileUrl } from "@/net-fosterlink/util/UserUtil";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router";

export const AgencyCard = ({ agency, onRemove, highlighted } : { agency: AgencyModel, onRemove: (agencyId: number) => void, highlighted?: boolean }) => {

  const auth = useAuth()
  const navigate = useNavigate()
  const fullAddress = `${agency.location.addrLine1}${agency.location.addrLine2 ? ', ' + agency.location.addrLine2 : ''}, ${agency.location.city}, ${agency.location.state} ${agency.location.zipCode}`;
  const encodedAddress = encodeURIComponent(fullAddress);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      
  const staticMapUrl = useRef(`https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=15&size=300x200&markers=color:red%7C${encodedAddress}&key=${auth.getMapsApiKey()}`);

  return (
    <Card id={`${agency.id}`} className={`w-full h-fit max-w-7xl border-border ${highlighted ? "ring-2 ring-blue-400" : ""}`}>
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-border">
          <h2 className="text-2xl font-bold mb-4 text-center">{agency.agencyName}</h2>
          {
            (agency.approved == 2 && auth.admin) && 
            <Button variant="outline" className="bg-red-200 text-red-400" onClick={() => onRemove(agency.id)}>Remove</Button>
          }
          <div className="bg-muted rounded-lg p-4 mb-4">
            <p className="text-foreground leading-relaxed">
              {agency.agencyMissionStatement}
            </p>
          </div>

          {agency.agencyWebsiteLink && (
            <a 
              href={agency.agencyWebsiteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/90 inline-flex items-center gap-1 text-sm"
            >
              Visit Website <ExternalLink size={14} />
            </a>
          )}
        </div>

        <div className="w-full md:w-80 flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-start gap-4 mb-4">   
              <div onClick={() => navigate(buildProfileUrl(agency.agent))} className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0 hover:text-primary cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring">
                {agency.agent.profilePictureUrl ? (
                  <img 
                    src={agency.agent.profilePictureUrl} 
                    alt={`${agency.agent.fullName}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground text-2xl">
                    {getInitials(agency.agent.fullName)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-start">
                <h3 className="font-semibold text-lg hover:text-primary focus:outline-none cursor-pointer focus:ring-1 focus:ring-ring" onClick={() => navigate(buildProfileUrl(agency.agent))}>
                  {agency.agent.fullName}
                </h3>
                <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1">
                  <Phone size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{agency.agentInfo.phoneNumber}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1 break-all">
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
              <div className="relative rounded-lg overflow-hidden border border-border mb-3 hover:border-primary transition-colors">
                <img 
                  src={staticMapUrl.current}
                  alt="Location preview"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black-1000/0 hover:bg-black-1000/25 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 bg-background rounded-full p-2 shadow-lg transition-opacity">
                    <ExternalLink size={20} className="text-primary" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-foreground">
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
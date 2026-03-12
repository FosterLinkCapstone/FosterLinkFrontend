import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/net-fosterlink/backend/AuthContext";
import type { AgencyModel } from "@/net-fosterlink/backend/models/AgencyModel";
import type { LocationModel } from "@/net-fosterlink/backend/models/LocationModel";
import { getInitials } from "@/net-fosterlink/util/StringUtil";
import { buildProfileUrl } from "@/net-fosterlink/util/UserUtil";
import { formatRelativeDate } from "@/net-fosterlink/util/DateUtil";
import { ExternalLink, Mail, MapPin, Pencil, Phone } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { agencyApi } from "@/net-fosterlink/backend/api/AgencyApi";
import type { UpdateAgencyLocationPayload } from "@/net-fosterlink/backend/api/AgencyApi";
import { EditAgencyLocationDialog } from "./EditAgencyLocationDialog";
import { UnsavedChangesBar } from "../account-settings/UnsavedChangesBar";
import { confirm } from "../ConfirmDialog";

type SavedSnapshot = {
  name: string;
  mission: string;
  website: string;
  addrLine1: string;
  addrLine2: string;
  city: string;
  state: string;
  zipCode: number;
};

function getSnapshot(agency: AgencyModel): SavedSnapshot {
  const loc = agency.location;
  return {
    name: agency.agencyName,
    mission: agency.agencyMissionStatement ?? "",
    website: agency.agencyWebsiteLink ?? "",
    addrLine1: loc.addrLine1,
    addrLine2: loc.addrLine2 ?? "",
    city: loc.city,
    state: loc.state,
    zipCode: loc.zipCode,
  };
}

export const AgencyCard = ({ agency, onRemove, onDelete, onRequestDeletion, onSentToPending, highlighted, showRemove = false, deletionRequested = false } : { agency: AgencyModel, onRemove: (agencyId: number) => void, onDelete?: (agencyId: number) => void, onRequestDeletion?: (agencyId: number) => void, onSentToPending?: (agencyId: number) => void, highlighted?: boolean, showRemove?: boolean, deletionRequested? : boolean }) => {
  const savedRef = useRef<SavedSnapshot>(getSnapshot(agency));
  const [draftName, setDraftName] = useState(agency.agencyName);
  const [draftMission, setDraftMission] = useState(agency.agencyMissionStatement ?? "");
  const [draftWebsite, setDraftWebsite] = useState(agency.agencyWebsiteLink ?? "");
  const [draftLocation, setDraftLocation] = useState<UpdateAgencyLocationPayload | null>(null);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    savedRef.current = getSnapshot(agency);
    setDraftName(agency.agencyName);
    setDraftMission(agency.agencyMissionStatement ?? "");
    setDraftWebsite(agency.agencyWebsiteLink ?? "");
    setDraftLocation(null);
  }, [agency.id]);

  const auth = useAuth();
  const navigate = useNavigate();
  const isOwner = auth.getUserInfo()?.id === agency.agent.id;

  const displayLocation = useMemo((): LocationModel => {
    if (draftLocation) {
      return {
        ...agency.location,
        addrLine1: draftLocation.addrLine1,
        addrLine2: draftLocation.addrLine2 ?? "",
        city: draftLocation.city,
        state: draftLocation.state,
        zipCode: draftLocation.zipCode,
      };
    }
    return agency.location;
  }, [agency.location, draftLocation]);

  const fullAddress = `${displayLocation.addrLine1}${displayLocation.addrLine2 ? ", " + displayLocation.addrLine2 : ""}, ${displayLocation.city}, ${displayLocation.state} ${displayLocation.zipCode}`;
  const encodedAddress = encodeURIComponent(fullAddress);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=15&size=300x200&markers=color:red%7C${encodedAddress}&key=${auth.getMapsApiKey()}`;

  const hasChanges = useMemo(() => {
    const s = savedRef.current;
    if (draftName !== s.name || draftMission !== s.mission || draftWebsite !== s.website) return true;
    if (draftLocation) {
      return (
        draftLocation.addrLine1 !== s.addrLine1 ||
        (draftLocation.addrLine2 ?? "") !== s.addrLine2 ||
        draftLocation.city !== s.city ||
        draftLocation.state !== s.state ||
        draftLocation.zipCode !== s.zipCode
      );
    }
    return false;
  }, [draftName, draftMission, draftWebsite, draftLocation]);

  const handleReset = () => {
    const s = savedRef.current;
    setDraftName(s.name);
    setDraftMission(s.mission);
    setDraftWebsite(s.website);
    setDraftLocation(null);
  };

  const handleCancelEdit = () => {
    handleReset();
    setEditMode(false);
  };

  const handleSave = async () => {
    const ok = await confirm({
      message:
        "Saving your changes will send this agency back to pending approval. An administrator will need to approve it again before it appears on the public list. Do you want to continue?",
    });
    if (!ok) return;
    setSaving(true);
    const api = agencyApi(auth);
    const s = savedRef.current;
    const nameChanged = draftName !== s.name;
    const missionChanged = draftMission !== s.mission;
    const websiteChanged = draftWebsite !== s.website;
    const locationChanged = draftLocation
      ? draftLocation.addrLine1 !== s.addrLine1 ||
        (draftLocation.addrLine2 ?? "") !== s.addrLine2 ||
        draftLocation.city !== s.city ||
        draftLocation.state !== s.state ||
        draftLocation.zipCode !== s.zipCode
      : false;

    try {
      if (nameChanged || missionChanged || websiteChanged) {
        const res = await api.updateAgency(
          agency.id,
          nameChanged ? draftName : null,
          missionChanged ? draftMission : null,
          websiteChanged ? draftWebsite : null
        );
        if (res.isError) {
          setSaving(false);
          return;
        }
      }
      if (locationChanged && draftLocation) {
        const res = await api.updateAgencyLocation(agency.id, draftLocation);
        if (res.isError) {
          setSaving(false);
          return;
        }
      }
      agency.agencyName = draftName;
      agency.agencyMissionStatement = draftMission;
      agency.agencyWebsiteLink = draftWebsite;
      if (draftLocation) {
        agency.location = { ...agency.location, ...displayLocation };
      }
      savedRef.current = getSnapshot(agency);
      setDraftLocation(null);
      setEditMode(false);
      onSentToPending?.(agency.id);
    } finally {
      setSaving(false);
    }
  };

  const handleDraftLocation = (draft: UpdateAgencyLocationPayload) => {
    setDraftLocation(draft);
    setLocationDialogOpen(false);
  };

  return (
    <Card id={`${agency.id}`} className={`w-full h-fit max-w-7xl border-border ${highlighted ? "ring-2 ring-blue-400" : ""}`}>
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-border">

          {isOwner && editMode ? (
            <div className="mb-1">
              <Input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="text-xl font-bold text-center"
                placeholder="Agency name"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1 mb-1">
              <h2 className="text-2xl font-bold text-center">{agency.agencyName}</h2>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setEditMode(true)}
                  aria-label="Edit agency"
                >
                  <Pencil size={14} />
                </Button>
              )}
            </div>
          )}

          {agency.createdAt && (
            <p className="text-xs text-muted-foreground text-center mb-4">
              Created {formatRelativeDate(agency.createdAt)} at {new Date(agency.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          {!agency.createdAt && <div className="mb-4" />}
          {(agency.approved === 2 && auth.admin && showRemove) && (
            <div className="flex w-full gap-2 mb-4">
              <Button variant="outline" className="flex-1 min-w-0 bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700/70 dark:hover:bg-amber-900/70" onClick={() => onRemove(agency.id)} disabled={auth.restricted}>
                Hide
              </Button>
              {onDelete && isOwner && (
                <Button variant="outline" className="flex-1 min-w-0 bg-red-200 text-red-400 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700/70 dark:hover:bg-red-900/70" onClick={() => onDelete(agency.id)} disabled={auth.restricted}>
                  Delete
                </Button>
              )}
            </div>
          )}
          {(agency.approved === 2 && isOwner && !auth.admin && onRequestDeletion) && (
            <Button variant="outline" className="bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-200 dark:border-red-700/60 mb-4" disabled={deletionRequested || auth.restricted} onClick={() => onRequestDeletion(agency.id)}>Request Deletion</Button>
          )}

          <div className="bg-muted rounded-lg p-4 mb-4">
            {isOwner && editMode ? (
              <textarea
                value={draftMission}
                onChange={(e) => setDraftMission(e.target.value)}
                className="w-full min-h-[100px] text-foreground leading-relaxed bg-background border border-input rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Mission statement"
              />
            ) : (
              <p className="text-foreground leading-relaxed text-sm">
                {agency.agencyMissionStatement || <span className="text-muted-foreground">No mission statement</span>}
              </p>
            )}
          </div>

          {isOwner && editMode ? (
            <div className="flex justify-center">
              <Input
                value={draftWebsite}
                onChange={(e) => setDraftWebsite(e.target.value)}
                placeholder="https://..."
                className="text-sm text-center max-w-md"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1">
              {agency.agencyWebsiteLink ? (
                <a
                  href={agency.agencyWebsiteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/90 inline-flex items-center gap-1 text-sm"
                >
                  Visit Website <ExternalLink size={14} />
                </a>
              ) : (
                <span className="text-muted-foreground text-sm">No website</span>
              )}
            </div>
          )}
          {isOwner && editMode && (
            <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground" onClick={handleCancelEdit}>
              Cancel
            </Button>
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
                  src={staticMapUrl}
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
                  <div>{displayLocation.addrLine1}</div>
                  {displayLocation.addrLine2 && <div>{displayLocation.addrLine2}</div>}
                  <div>{displayLocation.city}, {displayLocation.state} {displayLocation.zipCode}</div>
                </div>
              </div>
            </a>
            {isOwner && editMode && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setLocationDialogOpen(true)}>
                Edit address
              </Button>
            )}
          </div>
        </div>
      </div>
      <EditAgencyLocationDialog
        agency={agency}
        open={locationDialogOpen}
        onOpenChange={setLocationDialogOpen}
        submitMode="draft"
        onDraftLocation={handleDraftLocation}
        initialLocation={
          draftLocation
            ? {
                addrLine1: draftLocation.addrLine1,
                addrLine2: draftLocation.addrLine2,
                city: draftLocation.city,
                state: draftLocation.state,
                zipCode: draftLocation.zipCode,
              }
            : undefined
        }
      />
      {editMode && hasChanges && isOwner && (
        <UnsavedChangesBar
          hasErrors={false}
          saving={saving}
          restricted={auth.restricted}
          onReset={handleCancelEdit}
          onSave={handleSave}
        />
      )}
    </Card>
  );
};
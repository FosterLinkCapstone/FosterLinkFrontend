import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/net-fosterlink/backend/AuthContext";
import { agencyApi } from "@/net-fosterlink/backend/api/AgencyApi";
import type { UpdateAgencyLocationPayload } from "@/net-fosterlink/backend/api/AgencyApi";
import type { AgencyModel } from "@/net-fosterlink/backend/models/AgencyModel";
import type { LocationModel } from "@/net-fosterlink/backend/models/LocationModel";
import { useState, useEffect } from "react";
import { BackgroundLoadSpinner } from "../BackgroundLoadSpinner";

export function EditAgencyLocationDialog({
  agency,
  open,
  onOpenChange,
  onSaved,
  submitMode = "api",
  onDraftLocation,
  initialLocation,
}: {
  agency: AgencyModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (location: LocationModel) => void;
  /** When "draft", Save only reports draft to parent; no API call. */
  submitMode?: "api" | "draft";
  onDraftLocation?: (draft: UpdateAgencyLocationPayload) => void;
  /** When in draft mode, initial field values (e.g. from parent draft). */
  initialLocation?: { addrLine1: string; addrLine2?: string; city: string; state: string; zipCode: number };
}) {
  const auth = useAuth();
  const source = submitMode === "draft" && initialLocation ? initialLocation : agency.location;
  const [addrLine1, setAddrLine1] = useState(source.addrLine1);
  const [addrLine2, setAddrLine2] = useState(source.addrLine2 ?? "");
  const [city, setCity] = useState(source.city);
  const [state, setState] = useState(source.state);
  const [zipCode, setZipCode] = useState(String(source.zipCode));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const s = submitMode === "draft" && initialLocation ? initialLocation : agency.location;
      setAddrLine1(s.addrLine1);
      setAddrLine2(s.addrLine2 ?? "");
      setCity(s.city);
      setState(s.state);
      setZipCode(String(s.zipCode));
    }
  }, [open, agency.location, submitMode, initialLocation]);

  const zipNum = parseInt(zipCode, 10);
  const isValidZip = !isNaN(zipNum) && zipNum >= 501 && zipNum <= 99950;
  const canSave =
    addrLine1.trim() !== "" &&
    city.trim() !== "" &&
    state.trim() !== "" &&
    isValidZip;

  const handleSave = () => {
    if (!canSave) return;
    const location: UpdateAgencyLocationPayload = {
      addrLine1: addrLine1.trim(),
      addrLine2: addrLine2.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      zipCode: zipNum,
    };
    if (submitMode === "draft" && onDraftLocation) {
      onDraftLocation(location);
      onOpenChange(false);
      return;
    }
    setLoading(true);
    agencyApi(auth)
      .updateAgencyLocation(agency.id, location)
      .then((res) => {
        if (!res.isError && onSaved) {
          const updatedLocation: LocationModel = {
            ...agency.location,
            addrLine1: location.addrLine1,
            addrLine2: location.addrLine2 ?? "",
            city: location.city,
            state: location.state,
            zipCode: location.zipCode,
          };
          onSaved(updatedLocation);
          onOpenChange(false);
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit location</DialogTitle>
          <DialogDescription>
            Update the address for agency  {agency.agencyName.trim() || "this agency"}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="addrLine1">Address line 1</Label>
            <Input
              id="addrLine1"
              value={addrLine1}
              onChange={(e) => setAddrLine1(e.target.value)}
              placeholder="123 Main Street"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="addrLine2">Address line 2 (optional)</Label>
            <Input
              id="addrLine2"
              value={addrLine2}
              onChange={(e) => setAddrLine2(e.target.value)}
              placeholder="Suite 100"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Springfield"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="IL"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="zipCode">ZIP code</Label>
            <Input
              id="zipCode"
              type="text"
              inputMode="numeric"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="62701"
            />
            {zipCode !== "" && !isValidZip && (
              <p className="text-sm text-destructive">ZIP must be between 501 and 99950.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave || loading}>
            Save
          </Button>
          <BackgroundLoadSpinner loading={loading} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

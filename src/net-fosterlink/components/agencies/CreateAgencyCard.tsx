import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateAgencyModel } from "@/net-fosterlink/backend/models/api/CreateAgencyModel";
import type { LocationInput } from "@/net-fosterlink/backend/models/api/LocationInput";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useAuth } from "@/net-fosterlink/backend/AuthContext";
import { BackgroundLoadSpinner } from "../BackgroundLoadSpinner";

const defaultLocation: LocationInput = {
  addrLine1: '',
  addrLine2: '',
  city: '',
  state: '',
  zipCode: 0,
};

export const CreateAgencyCard = ({ handleSubmit, handleClose, serverFieldErrors }: { handleSubmit: (agency: CreateAgencyModel) => Promise<void>, handleClose: () => void, serverFieldErrors?: { [key: string]: string } }) => {
  const [formData, setFormData] = useState<CreateAgencyModel>({
    name: '',
    missionStatement: '',
    websiteUrl: '',
    location: { ...defaultLocation },
  });

  const auth = useAuth()

  const [createLoading, setCreateLoading] = useState<boolean>(false);

  const [errors, setErrors] = useState<Partial<Record<keyof CreateAgencyModel | 'location.city' | 'location.addrLine1' | 'location.state' | 'location.zipCode', string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Agency name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Agency name must be 255 characters or less';
    }

    if (!formData.missionStatement.trim()) {
      newErrors.missionStatement = 'Mission statement is required';
    }

    if (!formData.websiteUrl.trim()) {
      newErrors.websiteUrl = 'Website URL is required';
    } else {
      try {
        new URL(formData.websiteUrl);
      } catch {
        newErrors.websiteUrl = 'Please enter a valid URL (e.g., https://example.com)';
      }
    }

    const loc = formData.location;
    if (!loc.city.trim()) {
      newErrors['location.city'] = 'City is required';
    }
    if (!loc.state.trim()) {
      newErrors['location.state'] = 'State is required';
    }
    if (!loc.addrLine1.trim()) {
      newErrors['location.addrLine1'] = 'Address line 1 is required';
    }
    if (!loc.zipCode || loc.zipCode === 0) {
      newErrors['location.zipCode'] = 'Zip code is required';
    } else if (loc.zipCode < 501 || loc.zipCode > 99950) {
      newErrors['location.zipCode'] = 'Zip code must be between 501 and 99950';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = () => {
    if (validateForm()) {
      setCreateLoading(true);
      handleSubmit(formData).finally(() => {
        setCreateLoading(false);
      });
    }
  };

  const updateField = (field: keyof CreateAgencyModel, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const updateLocationField = (field: keyof LocationInput, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
    const key = `location.${field}`;
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  return (
    <Card className="mb-4 p-6 flex flex-col w-full gap-4 overflow-hidden hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold text-center mb-2">Create New Agency</h3>
      <div className="w-full items-center">
        <Badge variant="secondary" className="text-center bg-muted">Creating as {auth.getUserInfo()?.fullName}</Badge>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Agency Name *</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter agency name"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          className={errors.name ? 'border-red-500' : ''}
        />
        {(errors.name || serverFieldErrors?.name) && <span className="text-red-500">{errors.name ?? serverFieldErrors?.name}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="mission">Mission Statement *</Label>
        <Textarea
          id="mission"
          placeholder="Enter the agency's mission statement"
          value={formData.missionStatement}
          onChange={(e) => updateField('missionStatement', e.target.value)}
          className={errors.missionStatement ? 'border-red-500' : ''}
          rows={4}
        />
        {(errors.missionStatement || serverFieldErrors?.missionStatement) && <span className="text-red-500">{errors.missionStatement ?? serverFieldErrors?.missionStatement}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website URL *</Label>
        <Input
          id="website"
          type="url"
          placeholder="https://example.com"
          value={formData.websiteUrl}
          onChange={(e) => updateField('websiteUrl', e.target.value)}
          className={errors.websiteUrl ? 'border-red-500' : ''}
        />
        {(errors.websiteUrl || serverFieldErrors?.websiteUrl) && <span className="text-red-500">{errors.websiteUrl ?? serverFieldErrors?.websiteUrl}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addr1">Address Line 1 *</Label>
        <Input
          id="addr1"
          type="text"
          placeholder="Street address"
          value={formData.location.addrLine1}
          onChange={(e) => updateLocationField('addrLine1', e.target.value)}
          className={errors['location.addrLine1'] ? 'border-red-500' : ''}
        />
        {(errors['location.addrLine1'] || serverFieldErrors?.['location.addrLine1']) && <span className="text-red-500">{errors['location.addrLine1'] ?? serverFieldErrors?.['location.addrLine1']}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addr2">Address Line 2 (Optional)</Label>
        <Input
          id="addr2"
          type="text"
          placeholder="Apt, suite, unit, etc."
          value={formData.location.addrLine2 ?? ''}
          onChange={(e) => updateLocationField('addrLine2', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            type="text"
            placeholder="City"
            value={formData.location.city}
            onChange={(e) => updateLocationField('city', e.target.value)}
            className={errors['location.city'] ? 'border-red-500' : ''}
          />
          {(errors['location.city'] || serverFieldErrors?.['location.city']) && <span className="text-red-500">{errors['location.city'] ?? serverFieldErrors?.['location.city']}</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            type="text"
            placeholder="State"
            value={formData.location.state}
            onChange={(e) => updateLocationField('state', e.target.value)}
            className={errors['location.state'] ? 'border-red-500' : ''}
          />
          {(errors['location.state'] || serverFieldErrors?.['location.state']) && <span className="text-red-500">{errors['location.state'] ?? serverFieldErrors?.['location.state']}</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip">Zip Code *</Label>
          <Input
            id="zip"
            type="number"
            placeholder="12345"
            value={formData.location.zipCode || ''}
            onChange={(e) => updateLocationField('zipCode', parseInt(e.target.value) || 0)}
            className={errors['location.zipCode'] ? 'border-red-500' : ''}
          />
          {(errors['location.zipCode'] || serverFieldErrors?.['location.zipCode']) && <span className="text-red-500">{errors['location.zipCode'] ?? serverFieldErrors?.['location.zipCode']}</span>}
        </div>
      </div>

      <div className="flex gap-4 pt-2">
        <Button variant="outline" onClick={handleFormSubmit} className="flex-1" disabled={createLoading || auth.restricted}>
          {createLoading ? <BackgroundLoadSpinner loading={true} className="size-5 shrink-0" /> : "Submit"}
        </Button>
        <Button onClick={handleClose} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </Card>
  );
};

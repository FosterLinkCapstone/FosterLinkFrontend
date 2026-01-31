import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateAgencyModel } from "@/net-fosterlink/backend/models/api/CreateAgencyModel";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useAuth } from "@/net-fosterlink/backend/AuthContext";
import { BackgroundLoadSpinner } from "../BackgroundLoadSpinner";

export const CreateAgencyCard = ({ handleSubmit, handleClose } : {handleSubmit: (agency: CreateAgencyModel) => Promise<void>, handleClose: ()=>void}) => {
  const [formData, setFormData] = useState<CreateAgencyModel>({
    name: '',
    missionStatement: '',
    websiteUrl: '',
    locationCity: '',
    locationState: '',
    locationZipCode: 0,
    locationAddrLine1: '',
    locationAddrLine2: ''
  });

  const auth = useAuth()

  const [createLoading, setCreateLoading] = useState<boolean>(false);

  const [errors, setErrors] = useState<Partial<Record<keyof CreateAgencyModel, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateAgencyModel, string>> = {};

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

    if (!formData.locationCity.trim()) {
      newErrors.locationCity = 'City is required';
    }

    if (!formData.locationState.trim()) {
      newErrors.locationState = 'State is required';
    }

    if (!formData.locationAddrLine1.trim()) {
      newErrors.locationAddrLine1 = 'Address line 1 is required';
    }

    if (!formData.locationZipCode || formData.locationZipCode === 0) {
      newErrors.locationZipCode = 'Zip code is required';
    } else if (formData.locationZipCode < 501 || formData.locationZipCode > 99950) {
      newErrors.locationZipCode = 'Zip code must be between 501 and 99950';
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
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
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
        {errors.missionStatement && <p className="text-sm text-red-600">{errors.missionStatement}</p>}
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
        {errors.websiteUrl && <p className="text-sm text-red-600">{errors.websiteUrl}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addr1">Address Line 1 *</Label>
        <Input
          id="addr1"
          type="text"
          placeholder="Street address"
          value={formData.locationAddrLine1}
          onChange={(e) => updateField('locationAddrLine1', e.target.value)}
          className={errors.locationAddrLine1 ? 'border-red-500' : ''}
        />
        {errors.locationAddrLine1 && <p className="text-sm text-red-600">{errors.locationAddrLine1}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addr2">Address Line 2 (Optional)</Label>
        <Input
          id="addr2"
          type="text"
          placeholder="Apt, suite, unit, etc."
          value={formData.locationAddrLine2}
          onChange={(e) => updateField('locationAddrLine2', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            type="text"
            placeholder="City"
            value={formData.locationCity}
            onChange={(e) => updateField('locationCity', e.target.value)}
            className={errors.locationCity ? 'border-red-500' : ''}
          />
          {errors.locationCity && <p className="text-sm text-red-600">{errors.locationCity}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            type="text"
            placeholder="State"
            value={formData.locationState}
            onChange={(e) => updateField('locationState', e.target.value)}
            className={errors.locationState ? 'border-red-500' : ''}
          />
          {errors.locationState && <p className="text-sm text-red-600">{errors.locationState}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip">Zip Code *</Label>
          <Input
            id="zip"
            type="number"
            placeholder="12345"
            value={formData.locationZipCode || ''}
            onChange={(e) => updateField('locationZipCode', parseInt(e.target.value) || 0)}
            className={errors.locationZipCode ? 'border-red-500' : ''}
          />
          {errors.locationZipCode && <p className="text-sm text-red-600">{errors.locationZipCode}</p>}
        </div>
      </div>

      <div className="flex gap-4 pt-2">
        <Button variant="outline" onClick={handleFormSubmit} className="flex-1" disabled={createLoading}>
          {createLoading ? <BackgroundLoadSpinner loading={true} className="size-5 shrink-0" /> : "Submit"}
        </Button>
        <Button onClick={handleClose} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </Card>
  );
};
import React from 'react';
import { F, Input, Textarea, Select, Section } from './FormField';
import ReadOnlyField from '@/components/ui/ReadOnlyField';
import { Building2 } from 'lucide-react';

const ROLES = [
  { value: 'owner', label: 'Unit Owner (Pemilik Unit)' },
  { value: 'tenant', label: 'Tenant (Penyewa)' },
  { value: 'representative', label: 'Authorized Representative (Kuasa)' },
];

export default function StepApplicant({ form, set, approvedUnits }) {
  const selectedUnit = approvedUnits.find(u => u.id === form.unit_id);

  const handleUnitChange = (unitId) => {
    const unit = approvedUnits.find(u => u.id === unitId);
    set('unit_id', unitId);
    if (unit) {
      // Auto-prefill unit-related fields from master data
      set('unit_number', unit.unit_number);
      set('tower', unit.tower || '');
      set('property_name', unit.property_name || '');
      set('cluster_name', unit.property_name || '');
    }
  };

  return (
    <div className="space-y-4">
      {/* A. Applicant */}
      <Section title="A. Applicant Information">
        {/* Name and email are prefilled from user profile — read-only */}
        <ReadOnlyField label="Full Name (from profile)" value={form.applicant_name} />
        <ReadOnlyField label="Email (from profile)" value={form.applicant_email} />

        <F label="Role / Status" required>
          <Select value={form.applicant_role} onChange={v => set('applicant_role', v)} options={ROLES} placeholder="Select role..." />
        </F>
        <div className="grid grid-cols-2 gap-3">
          <F label="NIK / ID Number" required>
            <Input value={form.applicant_nik} onChange={v => set('applicant_nik', v)} placeholder="16-digit NIK" />
          </F>
          <F label="Phone Number" required>
            <Input type="tel" value={form.applicant_phone} onChange={v => set('applicant_phone', v)} placeholder="08xx..." />
          </F>
        </div>
        <F label="Address (as per ID)" required>
          <Textarea value={form.applicant_address} onChange={v => set('applicant_address', v)} placeholder="Address as stated on ID card..." rows={3} />
        </F>
      </Section>

      {/* B. Unit — cascading: select unit → prefill details */}
      <Section title="B. Property / Unit">
        <F label="Select Unit" required>
          <Select
            value={form.unit_id}
            onChange={handleUnitChange}
            options={approvedUnits.map(u => ({
              value: u.id,
              label: `${u.unit_number} – ${u.property_name}${u.tower ? ` Tower ${u.tower}` : ''}`
            }))}
            placeholder="Select your registered unit..."
          />
        </F>

        {/* Auto-filled from selected unit — read-only */}
        {selectedUnit && (
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <ReadOnlyField label="Property" value={selectedUnit.property_name} icon={Building2} />
              {selectedUnit.tower && <ReadOnlyField label="Tower" value={`Tower ${selectedUnit.tower}`} icon={Building2} />}
              <ReadOnlyField label="Unit Number" value={selectedUnit.unit_number} />
              <ReadOnlyField label="Unit Type" value={selectedUnit.unit_type} />
            </div>
            {selectedUnit.floor_number && <ReadOnlyField label="Floor" value={`Floor ${selectedUnit.floor_number}`} />}
          </div>
        )}
      </Section>
    </div>
  );
}
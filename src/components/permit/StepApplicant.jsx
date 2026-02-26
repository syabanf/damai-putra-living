import React from 'react';
import { F, Input, Textarea, Select, Section } from './FormField';
import { SelectUI } from '@/components/ui/select';

const ROLES = [
  { value: 'owner', label: 'Unit Owner (Pemilik Unit)' },
  { value: 'tenant', label: 'Tenant (Penyewa)' },
  { value: 'representative', label: 'Authorized Representative (Kuasa)' },
];

export default function StepApplicant({ form, set, approvedUnits }) {
  return (
    <div className="space-y-4">
      {/* A. Applicant */}
      <Section title="A. Applicant Information">
        <F label="Full Name" required>
          <Input value={form.applicant_name} onChange={v => set('applicant_name', v)} placeholder="Full legal name" />
        </F>
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
        <F label="Email Address" required>
          <Input type="email" value={form.applicant_email} onChange={v => set('applicant_email', v)} placeholder="email@example.com" />
        </F>
        <F label="Address (as per ID)" required>
          <Textarea value={form.applicant_address} onChange={v => set('applicant_address', v)} placeholder="Address as stated on ID card..." rows={3} />
        </F>
      </Section>

      {/* B. Unit */}
      <Section title="B. Property / Unit">
        <F label="Select Unit" required>
          <SelectUI
            value={form.unit_id}
            onValueChange={v => set('unit_id', v)}
            placeholder="Select your registered unit..."
          >
            {approvedUnits.map(u => (
              <option key={u.id} value={u.id}>{u.unit_number} – {u.property_name}{u.tower ? ` Tower ${u.tower}` : ''}</option>
            ))}
          </SelectUI>
        </F>
      </Section>
    </div>
  );
}
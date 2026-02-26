import React from 'react';
import { F, Input, Textarea, Select, Checkbox, FileUpload, Section } from './FormField';

const ACTIVITY_CATEGORIES = [
  { value: 'gathering', label: 'Family / Social Gathering' },
  { value: 'commercial', label: 'Commercial Activity' },
  { value: 'maintenance', label: 'Maintenance / Repair' },
  { value: 'delivery', label: 'Delivery / Installation' },
  { value: 'other', label: 'Other Activity' },
];

const WORK_TYPES = [
  { value: 'struktural', label: 'Structural' },
  { value: 'non_struktural', label: 'Non-Structural' },
  { value: 'mep', label: 'MEP (Mechanical / Electrical / Plumbing)' },
  { value: 'finishing', label: 'Finishing / Aesthetic' },
  { value: 'landscape', label: 'Landscape / Exterior' },
];

export default function StepActivity({ form, set, permitType, uploading, onUpload }) {
  const isConstruction = ['renovasi_minor', 'renovasi_mayor', 'pembangunan_kavling', 'galian'].includes(permitType);
  const isMoving = ['pindah_masuk', 'pindah_keluar'].includes(permitType);
  const isDeposit = permitType === 'pencairan_deposit';
  const isContractor = permitType === 'akses_kontraktor';
  const isActivity = permitType === 'izin_kegiatan';

  return (
    <div className="space-y-4">

      {/* D. Activity Info — shown for all except deposit */}
      {!isDeposit && (
        <Section title="C. Activity Information">
          <F label="Activity / Work Name" required>
            <Input value={form.activity_name} onChange={v => set('activity_name', v)} placeholder="Name of the activity or work" />
          </F>
          <F label="Description" required>
            <Textarea value={form.description} onChange={v => set('description', v)} placeholder="Describe the activity in detail..." rows={4} />
          </F>
          {isActivity && (
            <F label="Activity Category" required>
              <Select value={form.activity_category} onChange={v => set('activity_category', v)} options={ACTIVITY_CATEGORIES} placeholder="Select category..." />
            </F>
          )}
          <div className="grid grid-cols-2 gap-3">
            <F label="Start Date" required>
              <Input type="date" value={form.activity_date} onChange={v => set('activity_date', v)} />
            </F>
            <F label="End Date" required>
              <Input type="date" value={form.activity_end_date} onChange={v => set('activity_end_date', v)} />
            </F>
            <F label="Start Time" required>
              <Input type="time" value={form.activity_time} onChange={v => set('activity_time', v)} />
            </F>
            <F label="End Time" required>
              <Input type="time" value={form.activity_end_time} onChange={v => set('activity_end_time', v)} />
            </F>
          </div>
          {(isConstruction || isContractor || isActivity) && (
            <div className="grid grid-cols-2 gap-3">
              <F label="Number of Workers">
                <Input type="number" value={form.num_workers} onChange={v => set('num_workers', v)} placeholder="0" />
              </F>
              <F label="Contractor / Vendor">
                <Input value={form.contractor_company} onChange={v => set('contractor_company', v)} placeholder="Company name" />
              </F>
            </div>
          )}
        </Section>
      )}

      {/* E. Renovation / Construction */}
      {isConstruction && (
        <Section title="D. Renovation / Construction Details">
          <F label="Work Type" required>
            <Select value={form.work_type} onChange={v => set('work_type', v)} options={WORK_TYPES} placeholder="Select type..." />
          </F>
          <F label="Work Description" required>
            <Textarea value={form.work_scope} onChange={v => set('work_scope', v)} placeholder="Detailed scope of construction work..." rows={3} />
          </F>
          <F label="Affected Area">
            <Input value={form.affected_area} onChange={v => set('affected_area', v)} placeholder="e.g. Living room, kitchen, facade..." />
          </F>
          <div className="space-y-1">
            <Checkbox label="Heavy Equipment will be used" checked={form.uses_heavy_equipment} onChange={v => set('uses_heavy_equipment', v)} />
            <Checkbox label="Activity may generate noise" checked={form.noise_potential} onChange={v => set('noise_potential', v)} />
          </div>
        </Section>
      )}

      {/* H. Moving / Security */}
      {isMoving && (
        <Section title="D. Security / Moving Details">
          <F label="Move Type" required>
            <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 transition-all"
              value={form.permit_type} disabled>
              <option value="pindah_masuk">Move In</option>
              <option value="pindah_keluar">Move Out</option>
            </select>
          </F>
          <F label="Moving Date" required>
            <Input type="date" value={form.activity_date} onChange={v => set('activity_date', v)} />
          </F>
          <F label="Moving Company">
            <Input value={form.moving_company} onChange={v => set('moving_company', v)} placeholder="Moving company name" />
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Vehicle Type">
              <Input value={form.vehicle_type} onChange={v => set('vehicle_type', v)} placeholder="Pickup / Truck..." />
            </F>
            <F label="Plate Number">
              <Input value={form.vehicle_plate} onChange={v => set('vehicle_plate', v)} placeholder="B 1234 XX" />
            </F>
          </div>
          <F label="PIC Name">
            <Input value={form.visitor_name} onChange={v => set('visitor_name', v)} />
          </F>
          <F label="PIC Phone">
            <Input type="tel" value={form.visitor_phone} onChange={v => set('visitor_phone', v)} />
          </F>
          <F label="Number of Movers">
            <Input type="number" value={form.num_workers} onChange={v => set('num_workers', v)} placeholder="0" />
          </F>
        </Section>
      )}

      {/* Contractor-specific */}
      {isContractor && (
        <Section title="D. Contractor Details">
          <F label="Company Name" required>
            <Input value={form.contractor_company} onChange={v => set('contractor_company', v)} placeholder="PT. / CV. ..." />
          </F>
          <F label="PIC / Supervisor Name">
            <Input value={form.visitor_name} onChange={v => set('visitor_name', v)} />
          </F>
          <F label="PIC Phone">
            <Input type="tel" value={form.visitor_phone} onChange={v => set('visitor_phone', v)} />
          </F>
        </Section>
      )}

      {/* F. Deposit — for construction & deposit request */}
      {(isConstruction || isDeposit) && (
        <Section title={isDeposit ? 'C. Deposit Disbursement Request' : 'E. Deposit Information'}>
          {isDeposit && (
            <F label="Deposit Reason / Description" required>
              <Textarea value={form.description} onChange={v => set('description', v)} placeholder="Reason for deposit disbursement..." rows={3} />
            </F>
          )}
          <div className="grid grid-cols-2 gap-3">
            <F label="Deposit Required (IDR)">
              <Input type="number" value={form.deposit_required} onChange={v => set('deposit_required', v)} placeholder="0" />
            </F>
            <F label="Amount Paid (IDR)">
              <Input type="number" value={form.deposit_paid} onChange={v => set('deposit_paid', v)} placeholder="0" />
            </F>
          </div>
          <F label="Payment Date">
            <Input type="date" value={form.deposit_payment_date} onChange={v => set('deposit_payment_date', v)} />
          </F>
          <FileUpload
            label="Payment Proof Upload"
            uploading={uploading.deposit_proof}
            uploaded={!!form.deposit_payment_proof_url}
            onUpload={e => onUpload(e, 'deposit_proof', 'deposit_payment_proof_url')}
            onRemove={() => set('deposit_payment_proof_url', '')}
          />
        </Section>
      )}
    </div>
  );
}
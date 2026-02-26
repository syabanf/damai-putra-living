import React from 'react';
import { FileText, X, AlertCircle } from 'lucide-react';
import { FileUpload, Section } from './FormField';

/* Which doc slots to show per permit type */
const DOC_CONFIG = {
  izin_kegiatan: [
    { key: 'ktp', label: 'ID Card (KTP)', hint: 'Required for all applicants' },
    { key: 'supporting', label: 'Supporting Document', hint: 'Event plan, schedule, etc.' },
    { key: 'neighbor_approval', label: 'Neighbor Approval Letter', hint: 'If activity may affect neighbors' },
  ],
  renovasi_minor: [
    { key: 'ktp', label: 'ID Card (KTP)', hint: 'Required' },
    { key: 'supporting', label: 'Renovation Plan / Drawing', hint: 'Design or layout plan' },
    { key: 'contractor_agreement', label: 'Contractor Agreement', hint: 'SPK / agreement letter' },
    { key: 'photo_before', label: 'Photo Before Work', hint: 'Current condition of area' },
    { key: 'neighbor_approval', label: 'Neighbor Approval Letter', hint: 'Required for structural changes' },
  ],
  renovasi_mayor: [
    { key: 'ktp', label: 'ID Card (KTP)', hint: 'Required' },
    { key: 'supporting', label: 'Architectural / Structural Drawing', hint: 'Official permit drawing' },
    { key: 'contractor_agreement', label: 'Contractor Agreement (SPK)', hint: 'Mandatory' },
    { key: 'photo_before', label: 'Photo Before Work', hint: 'Current condition of area' },
    { key: 'neighbor_approval', label: 'Neighbor Approval Letter', hint: 'Required' },
  ],
  pembangunan_kavling: [
    { key: 'ktp', label: 'ID Card (KTP)', hint: 'Required' },
    { key: 'supporting', label: 'IMB / PBG Document', hint: 'Building permit document' },
    { key: 'contractor_agreement', label: 'Contractor Agreement', hint: 'Mandatory' },
    { key: 'photo_before', label: 'Site Photo (Before)', hint: 'Current site condition' },
    { key: 'neighbor_approval', label: 'Neighbor Approval Letter', hint: 'Required' },
  ],
  galian: [
    { key: 'ktp', label: 'ID Card (KTP)', hint: 'Required' },
    { key: 'supporting', label: 'Excavation Plan / Drawing', hint: 'Work area and depth' },
    { key: 'contractor_agreement', label: 'Contractor Agreement', hint: 'Mandatory' },
    { key: 'photo_before', label: 'Site Photo (Before)', hint: 'Before excavation begins' },
  ],
  pindah_masuk: [
    { key: 'ktp', label: 'ID Card (KTP)', hint: 'Required' },
    { key: 'supporting', label: 'Ownership / Lease Document', hint: 'Proof of ownership or lease agreement' },
  ],
  pindah_keluar: [
    { key: 'ktp', label: 'ID Card (KTP)', hint: 'Required' },
    { key: 'supporting', label: 'Move-out Clearance / Letter', hint: 'If applicable' },
  ],
  pencairan_deposit: [
    { key: 'ktp', label: 'ID Card (KTP)', hint: 'Required' },
    { key: 'supporting', label: 'Original Deposit Receipt', hint: 'Proof of deposit payment' },
    { key: 'photo_after', label: 'Photo After Work', hint: 'Post-work condition photos' },
  ],
  akses_kontraktor: [
    { key: 'ktp', label: 'Contractor ID / KTP', hint: 'Contractor identification' },
    { key: 'contractor_agreement', label: 'Work Order / SPK', hint: 'Authorization document' },
    { key: 'supporting', label: 'Insurance Document', hint: 'Contractor liability insurance (if any)' },
  ],
};

export default function StepDocuments({ form, set, permitType, uploading, onUploadMulti, selectedUnit, selectedPermit, user }) {
  const docs = DOC_CONFIG[permitType] || [
    { key: 'ktp', label: 'ID Card (KTP)', hint: 'Required' },
    { key: 'supporting', label: 'Supporting Document', hint: 'Relevant document' },
  ];

  // Track named uploads separately in form.named_docs
  const handleNamedUpload = async (e, key) => {
    await onUploadMulti(e, key);
  };

  return (
    <div className="space-y-4">
      {/* G. Documents */}
      <Section title="F. Required Documents">
        <p className="text-xs text-slate-500 -mt-2">Upload the required documents for your permit type.</p>
        <div className="space-y-4">
          {docs.map(doc => (
            <FileUpload
              key={doc.key}
              label={doc.label}
              hint={doc.hint}
              uploading={uploading[doc.key]}
              uploaded={form.named_docs?.[doc.key]}
              onUpload={e => handleNamedUpload(e, doc.key)}
              onRemove={() => set('named_docs', { ...form.named_docs, [doc.key]: null })}
            />
          ))}
        </div>
      </Section>

      {/* Additional docs */}
      {form.document_urls?.length > 0 && (
        <div className="space-y-2">
          {form.document_urls.map((url, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
              <FileText className="w-4 h-4 text-stone-500 flex-shrink-0" />
              <span className="text-xs text-slate-600 flex-1 truncate">Document {i + 1}</span>
              <button onClick={() => set('document_urls', form.document_urls.filter((_, j) => j !== i))}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="bg-white/80 rounded-2xl p-4 space-y-2">
        <h3 className="font-bold text-slate-700 text-xs uppercase tracking-widest pb-2 border-b border-slate-100">Application Summary</h3>
        {[
          ['Permit Type', selectedPermit?.label],
          ['Applicant', form.applicant_name],
          ['Role', form.applicant_role],
          ['Unit', selectedUnit?.unit_number],
          ['Property', selectedUnit?.property_name],
          ['Activity', form.activity_name || form.description?.slice(0, 40)],
          ['Start Date', form.activity_date ? new Date(form.activity_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : null],
        ].map(([k, v]) => v ? (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-slate-500">{k}</span>
            <span className="font-medium text-slate-800 text-right ml-4 max-w-[55%]">{v}</span>
          </div>
        ) : null)}
      </div>

      <div className="flex gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Your application will go through a 4-level approval process. You will receive status notifications at each stage.
        </p>
      </div>
    </div>
  );
}
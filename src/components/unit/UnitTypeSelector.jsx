import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  PROPERTY_TYPES, PROPERTIES, TYPE_FIELDS, CLASSIFICATION_SPECS,
} from './PropertyClassification';

function CascadeField({ label, children, active, done }) {
  if (!active) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {done
          ? <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold">✓</span>
          : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        }
        <Label className="text-slate-700 font-medium text-sm">{label}</Label>
      </div>
      {children}
    </div>
  );
}

export default function UnitTypeSelector({ formData, setFormData, errors }) {
  const set = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const resetBelow = (from) => {
    const fields = ['property_name', '_property_id', 'tower', '_area_id', '_unit_structure', 'unit_type', 'unit_number'];
    const idx = fields.indexOf(from);
    const reset = {};
    fields.slice(idx).forEach(f => { reset[f] = ''; });
    setFormData(prev => ({ ...prev, ...reset }));
  };

  const propertyType = formData._property_type || '';
  const propertyList = propertyType ? (PROPERTIES[propertyType] || []) : [];
  const selectedProp = propertyList.find(p => p.id === formData._property_id);
  const selectedArea = selectedProp?.areas.find(a => a.id === formData._area_id);
  const fields = propertyType ? TYPE_FIELDS[propertyType] : null;

  // Map internal unit_type to entity unit_type value
  const entityUnitType = {
    apartment: 'apartment',
    residential: 'house',
    commercial: 'commercial',
    kavling: 'kavling',
  }[propertyType] || '';

  // Sync property_name and unit_type to formData whenever they change
  const handlePropertyTypeChange = (val) => {
    setFormData(prev => ({
      ...prev,
      _property_type: val,
      property_name: '',
      _property_id: '',
      tower: '',
      _area_id: '',
      _unit_structure: '',
      unit_type: { apartment: 'apartment', residential: 'house', commercial: 'commercial', kavling: 'kavling' }[val] || '',
      unit_number: '',
    }));
  };

  const handlePropertyChange = (propId) => {
    const prop = propertyList.find(p => p.id === propId);
    setFormData(prev => ({
      ...prev,
      _property_id: propId,
      property_name: prop?.name || '',
      tower: '',
      _area_id: '',
      _unit_structure: '',
      unit_number: '',
    }));
  };

  const handleAreaChange = (areaId) => {
    const area = selectedProp?.areas.find(a => a.id === areaId);
    setFormData(prev => ({
      ...prev,
      _area_id: areaId,
      tower: area ? `${selectedProp.areaLabel} ${area.name.replace(/^(Tower|Cluster|Zone|Section)\s*/i, '')}` : '',
      _unit_structure: '',
      unit_number: '',
    }));
  };

  const handleUnitStructureChange = (val) => {
    setFormData(prev => ({ ...prev, _unit_structure: val, unit_number: '' }));
  };

  const handleClassificationChange = (val) => {
    const specs = CLASSIFICATION_SPECS[val] || {};
    setFormData(prev => ({
      ...prev,
      unit_type_classification: val,
      // Prefill spec fields — convert numbers to strings for input compatibility
      bedroom_count:   specs.bedroom_count   !== undefined ? String(specs.bedroom_count)   : prev.bedroom_count,
      bathroom_count:  specs.bathroom_count  !== undefined ? String(specs.bathroom_count)  : prev.bathroom_count,
      area_size:       specs.area_size       !== undefined ? String(specs.area_size)       : prev.area_size,
      land_size:       specs.land_size       !== undefined ? String(specs.land_size)       : prev.land_size,
      building_size:   specs.building_size   !== undefined ? String(specs.building_size)   : prev.building_size,
      garage_count:    specs.garage_count    !== undefined ? String(specs.garage_count)    : prev.garage_count,
      business_type:   specs.business_type   !== undefined ? specs.business_type           : prev.business_type,
      _prefilled_from: val, // track which classification last prefilled
    }));
  };

  return (
    <div className="space-y-4">
      {/* Step A: Property Type */}
      <div className="space-y-1.5">
        <Label className="text-slate-700 font-semibold text-sm">Property Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {PROPERTY_TYPES.map(pt => (
            <button
              key={pt.id}
              type="button"
              onClick={() => handlePropertyTypeChange(pt.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                propertyType === pt.id
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="text-lg">{pt.icon}</span>
              <p className={`text-xs font-semibold mt-1 ${propertyType === pt.id ? 'text-teal-700' : 'text-slate-700'}`}>{pt.label}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{pt.description}</p>
            </button>
          ))}
        </div>
        {errors.unit_type && <p className="text-red-500 text-xs">{errors.unit_type}</p>}
      </div>

      {/* Step B: Property */}
      <CascadeField label="Property" active={!!propertyType} done={!!formData._property_id}>
        <Select value={formData._property_id} onValueChange={handlePropertyChange}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder={`Select ${propertyType} property…`} />
          </SelectTrigger>
          <SelectContent>
            {propertyList.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.property_name && <p className="text-red-500 text-xs">{errors.property_name}</p>}
      </CascadeField>

      {/* Step C: Area Structure (Tower / Cluster / Zone / Section) */}
      <CascadeField
        label={selectedProp ? selectedProp.areaLabel : 'Area'}
        active={!!formData._property_id}
        done={!!formData._area_id}
      >
        <Select value={formData._area_id} onValueChange={handleAreaChange}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder={`Select ${selectedProp?.areaLabel || 'area'}…`} />
          </SelectTrigger>
          <SelectContent>
            {(selectedProp?.areas || []).map(a => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CascadeField>

      {/* Step D: Unit Structure (Floor / Block / Row / Area) */}
      <CascadeField
        label={selectedProp ? selectedProp.unitLabel : 'Unit Level'}
        active={!!formData._area_id}
        done={!!formData._unit_structure}
      >
        <Select value={formData._unit_structure} onValueChange={handleUnitStructureChange}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder={`Select ${selectedProp?.unitLabel || 'level'}…`} />
          </SelectTrigger>
          <SelectContent>
            {(selectedArea?.units || []).map(u => (
              <SelectItem key={u} value={u}>{u}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CascadeField>

      {/* Step E: Unit Number */}
      <CascadeField
        label={fields?.unitNumberLabel || 'Unit Number'}
        active={!!formData._unit_structure}
        done={!!formData.unit_number}
      >
        <Input
          placeholder={fields?.unitNumberPlaceholder || 'e.g. A-01'}
          value={formData.unit_number}
          onChange={e => set('unit_number', e.target.value)}
          className={`h-12 rounded-xl ${errors.unit_number ? 'border-red-300' : ''}`}
        />
        {errors.unit_number && <p className="text-red-500 text-xs">{errors.unit_number}</p>}
      </CascadeField>

      {/* Step F: Unit Classification */}
      <CascadeField
        label="Unit Classification"
        active={!!formData.unit_number}
        done={!!formData.unit_type_classification}
      >
        <Select value={formData.unit_type_classification || ''} onValueChange={handleClassificationChange}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder="Select classification…" />
          </SelectTrigger>
          <SelectContent>
            {(selectedProp?.classifications || []).map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CascadeField>

      {/* Type-specific detail fields — appear after unit classification chosen */}
      {formData.unit_type_classification && fields && (
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Unit Specifications</p>
            {formData._prefilled_from && (
              <span className="text-[10px] bg-teal-50 text-teal-600 border border-teal-200 rounded-full px-2 py-0.5 font-medium">
                ✦ Prefilled from {formData._prefilled_from}
              </span>
            )}
          </div>

          {(fields.showBedrooms || fields.showBathrooms) && (
            <div className="grid grid-cols-2 gap-3">
              {fields.showBedrooms && (
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-xs">Bedrooms</Label>
                  <Input type="number" placeholder="e.g. 2" value={formData.bedroom_count} onChange={e => set('bedroom_count', e.target.value)} className="h-11 rounded-xl bg-teal-50/60" />
                </div>
              )}
              {fields.showBathrooms && (
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-xs">Bathrooms</Label>
                  <Input type="number" placeholder="e.g. 1" value={formData.bathroom_count} onChange={e => set('bathroom_count', e.target.value)} className="h-11 rounded-xl bg-teal-50/60" />
                </div>
              )}
            </div>
          )}

          {fields.showFloor && (
            <div className="space-y-1.5">
              <Label className="text-slate-600 text-xs">Floor Number</Label>
              <Input type="number" placeholder="e.g. 8" value={formData.floor_number} onChange={e => set('floor_number', e.target.value)} className="h-11 rounded-xl" />
            </div>
          )}

          {fields.showAreaSize && (
            <div className="space-y-1.5">
              <Label className="text-slate-600 text-xs">Area Size (m²)</Label>
              <Input type="number" placeholder="e.g. 85" value={formData.area_size} onChange={e => set('area_size', e.target.value)} className="h-11 rounded-xl bg-teal-50/60" />
            </div>
          )}

          {fields.showLandSize && (
            <div className={`grid gap-3 ${fields.showBuildingSize ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div className="space-y-1.5">
                <Label className="text-slate-600 text-xs">Land Size (m²)</Label>
                <Input type="number" placeholder="e.g. 200" value={formData.land_size} onChange={e => set('land_size', e.target.value)} className="h-11 rounded-xl bg-teal-50/60" />
              </div>
              {fields.showBuildingSize && (
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-xs">Building Size (m²)</Label>
                  <Input type="number" placeholder="e.g. 150" value={formData.building_size} onChange={e => set('building_size', e.target.value)} className="h-11 rounded-xl bg-teal-50/60" />
                </div>
              )}
            </div>
          )}

          {fields.showGarage && (
            <div className="space-y-1.5">
              <Label className="text-slate-600 text-xs">Garages / Parking</Label>
              <Input type="number" placeholder="e.g. 2" value={formData.garage_count} onChange={e => set('garage_count', e.target.value)} className="h-11 rounded-xl bg-teal-50/60" />
            </div>
          )}

          {fields.showBusinessType && (
            <div className="space-y-1.5">
              <Label className="text-slate-600 text-xs">Business Type</Label>
              <Input placeholder="e.g. Retail, F&B, Office" value={formData.business_type} onChange={e => set('business_type', e.target.value)} className="h-11 rounded-xl bg-teal-50/60" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-slate-600 text-xs">Location Details (optional)</Label>
            <Input placeholder="Street, area, landmark" value={formData.location_detail} onChange={e => set('location_detail', e.target.value)} className="h-11 rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
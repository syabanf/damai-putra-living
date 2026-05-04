/**
 * Hierarchical Property Classification Data
 * 
 * Property Type → Property → Area Structure → Unit Structure → Unit Classification
 */

export const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Apartment', icon: '🏢', description: 'High-rise residential units' },
  { id: 'residential', label: 'Residential House', icon: '🏡', description: 'Landed homes in clusters' },
  { id: 'commercial', label: 'Commercial', icon: '🏪', description: 'Shops, offices, bizpark' },
  { id: 'kavling', label: 'Land / Kavling', icon: '🗺️', description: 'Empty land plots' },
];

/**
 * classificationSpecs maps classification label → default spec values to prefill.
 * Keys match the spec field names used in formData.
 */
export const CLASSIFICATION_SPECS = {
  // Apartment types
  'Studio':      { bedroom_count: 0, bathroom_count: 1, area_size: 28 },
  '1 Bedroom':   { bedroom_count: 1, bathroom_count: 1, area_size: 38 },
  '2 Bedroom':   { bedroom_count: 2, bathroom_count: 2, area_size: 65 },
  '3 Bedroom':   { bedroom_count: 3, bathroom_count: 2, area_size: 95 },
  'Penthouse':   { bedroom_count: 4, bathroom_count: 3, area_size: 180 },
  // Residential types
  'Type 36':  { bedroom_count: 2, bathroom_count: 1, building_size: 36, land_size: 60,  garage_count: 1 },
  'Type 45':  { bedroom_count: 2, bathroom_count: 1, building_size: 45, land_size: 72,  garage_count: 1 },
  'Type 54':  { bedroom_count: 3, bathroom_count: 2, building_size: 54, land_size: 90,  garage_count: 1 },
  'Type 60':  { bedroom_count: 3, bathroom_count: 2, building_size: 60, land_size: 100, garage_count: 1 },
  'Type 72':  { bedroom_count: 3, bathroom_count: 2, building_size: 72, land_size: 120, garage_count: 2 },
  'Type 90':  { bedroom_count: 4, bathroom_count: 3, building_size: 90, land_size: 150, garage_count: 2 },
  'Type 120': { bedroom_count: 4, bathroom_count: 3, building_size: 120, land_size: 200, garage_count: 2 },
  'Type 150': { bedroom_count: 5, bathroom_count: 4, building_size: 150, land_size: 250, garage_count: 3 },
  // Commercial types
  'Ruko 2 Lantai':   { area_size: 80,  business_type: 'Ruko' },
  'Ruko 3 Lantai':   { area_size: 120, business_type: 'Ruko' },
  'Office Unit':     { area_size: 60,  business_type: 'Office' },
  'F&B Space':       { area_size: 45,  business_type: 'F&B' },
  'Retail Space':    { area_size: 35,  business_type: 'Retail' },
  'Corner Unit':     { area_size: 50,  business_type: 'Retail' },
  'Double Frontage': { area_size: 70,  business_type: 'Retail' },
  // Kavling types (land size ranges — use midpoint)
  '100–150 m²': { land_size: 125 },
  '150–200 m²': { land_size: 175 },
  '200–300 m²': { land_size: 250 },
  '300–500 m²': { land_size: 400 },
  '500 m²+':    { land_size: 600 },
};

export const PROPERTIES = {
  apartment: [
    {
      id: 'sayana-apt', name: 'Sayana Apartments',
      areaLabel: 'Tower', unitLabel: 'Floor',
      areas: [
        { id: 'tower-a', name: 'Tower A', units: Array.from({length: 35}, (_, i) => `Floor ${String(i+1).padStart(2,'0')}`) },
        { id: 'tower-b', name: 'Tower B', units: Array.from({length: 35}, (_, i) => `Floor ${String(i+1).padStart(2,'0')}`) },
        { id: 'tower-c', name: 'Tower C', units: Array.from({length: 30}, (_, i) => `Floor ${String(i+1).padStart(2,'0')}`) },
      ],
      classifications: ['Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', 'Penthouse'],
    },
    {
      id: 'grand-vista', name: 'Grand Vista Residence',
      areaLabel: 'Tower', unitLabel: 'Floor',
      areas: [
        { id: 'tower-north', name: 'Tower North', units: Array.from({length: 28}, (_, i) => `Floor ${String(i+1).padStart(2,'0')}`) },
        { id: 'tower-south', name: 'Tower South', units: Array.from({length: 28}, (_, i) => `Floor ${String(i+1).padStart(2,'0')}`) },
      ],
      classifications: ['Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom'],
    },
  ],
  residential: [
    {
      id: 'damai-putra-1', name: 'Damai Putra Residence 1',
      areaLabel: 'Cluster', unitLabel: 'Block',
      areas: [
        { id: 'cl-magnolia', name: 'Cluster Magnolia', units: ['Block A', 'Block B', 'Block C', 'Block D'] },
        { id: 'cl-jasmine', name: 'Cluster Jasmine', units: ['Block A', 'Block B', 'Block C'] },
        { id: 'cl-orchid', name: 'Cluster Orchid', units: ['Block A', 'Block B'] },
      ],
      classifications: ['Type 36', 'Type 45', 'Type 54', 'Type 60', 'Type 72', 'Type 90', 'Type 120'],
    },
    {
      id: 'damai-putra-2', name: 'Damai Putra Residence 2',
      areaLabel: 'Cluster', unitLabel: 'Block',
      areas: [
        { id: 'cl-serenia', name: 'Cluster Serenia', units: ['Block A', 'Block B', 'Block C'] },
        { id: 'cl-helonia', name: 'Cluster Helonia', units: ['Block A', 'Block B'] },
      ],
      classifications: ['Type 60', 'Type 72', 'Type 90', 'Type 120', 'Type 150'],
    },
  ],
  commercial: [
    {
      id: 'damai-bizpark', name: 'Damai Putra Business Park',
      areaLabel: 'Zone', unitLabel: 'Row',
      areas: [
        { id: 'zone-a', name: 'Zone A – Commercial Row', units: ['Row 1', 'Row 2', 'Row 3'] },
        { id: 'zone-b', name: 'Zone B – Office Block', units: ['Row 1', 'Row 2'] },
        { id: 'zone-c', name: 'Zone C – F&B Strip', units: ['Row 1'] },
      ],
      classifications: ['Ruko 2 Lantai', 'Ruko 3 Lantai', 'Office Unit', 'F&B Space', 'Retail Space'],
    },
    {
      id: 'dp-commercial', name: 'Damai Putra Commercial Hub',
      areaLabel: 'Zone', unitLabel: 'Row',
      areas: [
        { id: 'zone-main', name: 'Zone Main Street', units: ['Row 1', 'Row 2'] },
      ],
      classifications: ['Retail Space', 'Corner Unit', 'Double Frontage'],
    },
  ],
  kavling: [
    {
      id: 'kavling-east', name: 'Damai Putra Kavling East',
      areaLabel: 'Section', unitLabel: 'Area',
      areas: [
        { id: 'sec-1', name: 'Section 1 – Standard', units: ['Area A', 'Area B', 'Area C'] },
        { id: 'sec-2', name: 'Section 2 – Premium Corner', units: ['Area A', 'Area B'] },
      ],
      classifications: ['100–150 m²', '150–200 m²', '200–300 m²', '300–500 m²', '500 m²+'],
    },
    {
      id: 'kavling-west', name: 'Damai Putra Kavling West',
      areaLabel: 'Section', unitLabel: 'Area',
      areas: [
        { id: 'sec-a', name: 'Section A – Lakeside', units: ['Area 1', 'Area 2', 'Area 3'] },
        { id: 'sec-b', name: 'Section B – Greenview', units: ['Area 1', 'Area 2'] },
      ],
      classifications: ['150–200 m²', '200–300 m²', '300–500 m²'],
    },
  ],
};

// Which fields to show per property type
export const TYPE_FIELDS = {
  apartment: {
    showBedrooms: true, showBathrooms: true, showFloor: true,
    showAreaSize: true, showLandSize: false, showBuildingSize: false,
    showGarage: false, showBusinessType: false,
    unitNumberLabel: 'Unit Number', unitNumberPlaceholder: 'e.g. B-0803, A-1205',
  },
  residential: {
    showBedrooms: true, showBathrooms: true, showFloor: false,
    showAreaSize: false, showLandSize: true, showBuildingSize: true,
    showGarage: true, showBusinessType: false,
    unitNumberLabel: 'House Number', unitNumberPlaceholder: 'e.g. C-15, A-07',
  },
  commercial: {
    showBedrooms: false, showBathrooms: false, showFloor: false,
    showAreaSize: true, showLandSize: false, showBuildingSize: false,
    showGarage: false, showBusinessType: true,
    unitNumberLabel: 'Unit / Lot Number', unitNumberPlaceholder: 'e.g. B-03, A-12',
  },
  kavling: {
    showBedrooms: false, showBathrooms: false, showFloor: false,
    showAreaSize: false, showLandSize: true, showBuildingSize: false,
    showGarage: false, showBusinessType: false,
    unitNumberLabel: 'Kavling Number', unitNumberPlaceholder: 'e.g. K-001, A-05',
  },
};
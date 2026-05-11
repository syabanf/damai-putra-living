const STORAGE_KEY = 'damai_putra_living_data_v1';
const USER_KEY = 'mock_user';

const now = () => new Date().toISOString();

const defaultUser = {
  id: 'user_resident_001',
  email: 'resident@damaiputra.com',
  full_name: 'Budi Santoso',
  role: 'user',
  unit: 'Tower A - Unit 15',
  mock: true,
};

const seedData = {
  User: [
    defaultUser,
    {
      id: 'user_admin_001',
      email: 'admin@damaiputra.com',
      full_name: 'Admin Damai Putra',
      role: 'admin',
      unit: 'Management Office',
      mock: true,
      created_date: '2026-01-01T00:00:00.000Z',
    },
  ],
  Unit: [
    {
      id: 'unit_001',
      user_email: 'resident@damaiputra.com',
      property_name: 'Damai Putra Residence',
      unit_number: 'A-1508',
      tower: 'A',
      status: 'approved',
      ownership_status: 'owner',
      unit_type: 'Apartment',
      created_date: '2026-01-05T08:00:00.000Z',
    },
    {
      id: 'unit_002',
      user_email: 'resident@damaiputra.com',
      property_name: 'Sayana Apartments',
      unit_number: 'B-0902',
      tower: 'B',
      status: 'pending',
      ownership_status: 'tenant',
      unit_type: 'Apartment',
      rent_end_date: '2026-12-31',
      monthly_rent: 6500000,
      rent_payment_status: 'paid',
      created_date: '2026-02-10T08:00:00.000Z',
    },
  ],
  Property: [
    {
      id: 'property_001',
      name: 'Damai Putra Residence',
      title: 'Damai Putra Residence',
      location: 'Bekasi',
      description: 'Modern township living with family-friendly facilities.',
      image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80',
      type: 'Apartment',
      price: 'Start from Rp 900M',
      created_date: '2026-01-04T08:00:00.000Z',
    },
    {
      id: 'property_002',
      name: 'Sayana Apartments',
      title: 'Sayana Apartments',
      location: 'Kota Harapan Indah',
      description: 'Compact smart living close to lifestyle destinations.',
      image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80',
      type: 'Apartment',
      price: 'Start from Rp 650M',
      created_date: '2026-01-08T08:00:00.000Z',
    },
  ],
  Destination: [
    {
      id: 'destination_001',
      name: 'Central Park Damai',
      title: 'Central Park Damai',
      category: 'Lifestyle',
      image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=900&q=80',
      description: 'Outdoor green space for dining, events, and family activities.',
      created_date: '2026-01-12T08:00:00.000Z',
    },
    {
      id: 'destination_002',
      name: 'Food Avenue',
      title: 'Food Avenue',
      category: 'Culinary',
      image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80',
      description: 'A curated mix of restaurants and neighborhood favorites.',
      created_date: '2026-01-13T08:00:00.000Z',
    },
  ],
  Tenant: [
    {
      id: 'tenant_001',
      destination_id: 'destination_002',
      name: 'Kopi Damai',
      category: 'Cafe',
      image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&q=80',
      description: 'Specialty coffee and daily pastries.',
      created_date: '2026-01-15T08:00:00.000Z',
    },
    {
      id: 'tenant_002',
      destination_id: 'destination_002',
      name: 'Rasa Nusantara',
      category: 'Restaurant',
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80',
      description: 'Indonesian comfort food for families.',
      created_date: '2026-01-16T08:00:00.000Z',
    },
  ],
  Event: [
    {
      id: 'event_001',
      title: 'Spring Garden Festival',
      name: 'Spring Garden Festival',
      start_date: '2026-06-01',
      end_date: '2026-06-15',
      location: 'Central Park Damai',
      image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80',
      description: 'Community bazaar, music, and weekend family activities.',
      created_date: '2026-02-01T08:00:00.000Z',
    },
  ],
  Ticket: [
    {
      id: 'ticket_001',
      ticket_number: 'TCK-2026-0001',
      unit_id: 'unit_001',
      user_email: 'resident@damaiputra.com',
      issue_type: 'Maintenance',
      title: 'AC service request',
      description: 'Air conditioner needs inspection.',
      status: 'Open',
      created_date: '2026-03-01T08:00:00.000Z',
    },
  ],
  PermitApplication: [
    {
      id: 'permit_001',
      application_number: 'PRM-2026-0001',
      unit_id: 'unit_001',
      user_email: 'resident@damaiputra.com',
      permit_type: 'Renovation',
      application_status: 'Submitted',
      current_approval_stage: 'Admin',
      created_date: '2026-03-03T08:00:00.000Z',
    },
  ],
  WorkItem: [
    {
      id: 'work_item_master_001',
      work_item_name: 'Interior Painting',
      work_category: 'Interior',
      work_item_type: 'General',
      is_master: true,
      created_date: '2026-01-01T08:00:00.000Z',
    },
    {
      id: 'work_item_master_002',
      work_item_name: 'Electrical Installation',
      work_category: 'MEP',
      work_item_type: 'Electrical',
      is_master: true,
      created_date: '2026-01-01T08:05:00.000Z',
    },
  ],
  PermitRule: [
    {
      id: 'permit_rule_001',
      rule_name: 'Submit contractor ID',
      permit_type: 'Renovation',
      is_master: true,
      is_mandatory: true,
      created_date: '2026-01-01T08:00:00.000Z',
    },
  ],
  Reward: [
    {
      id: 'reward_001',
      title: 'Coffee Voucher',
      name: 'Coffee Voucher',
      points_required: 100,
      is_active: true,
      image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&q=80',
      created_date: '2026-01-20T08:00:00.000Z',
    },
  ],
  UserPoints: [
    {
      id: 'points_001',
      user_email: 'resident@damaiputra.com',
      balance: 500,
      lifetime_points: 500,
      created_date: '2026-01-20T08:00:00.000Z',
    },
  ],
  Lottery: [
    {
      id: 'lottery_001',
      title: 'Resident Lucky Draw',
      name: 'Resident Lucky Draw',
      is_active: true,
      points_cost: 50,
      total_entries: 0,
      created_date: '2026-02-20T08:00:00.000Z',
    },
  ],
  Notification: [
    {
      id: 'notification_001',
      user_email: 'resident@damaiputra.com',
      title: 'Welcome to ION',
      message: 'Your resident app is ready to use.',
      read: false,
      created_date: '2026-03-01T08:00:00.000Z',
    },
  ],
  DepositRefundRequest: [],
  RefundDocumentChecklist: [],
  DepositInspectionClearance: [],
  RefundApprovalWorkflow: [],
  RefundLedger: [],
  RefundActivityLog: [],
  ActivityLog: [],
  ApprovalWorkflow: [],
  Inspection: [],
  PermitDocument: [],
  RewardClaim: [],
  ScannedReceipt: [],
  LotteryEntry: [],
};

const entityNames = [
  'ActivityLog',
  'ApprovalWorkflow',
  'DepositInspectionClearance',
  'DepositRefundRequest',
  'Destination',
  'Event',
  'Inspection',
  'Lottery',
  'LotteryEntry',
  'Notification',
  'PermitApplication',
  'PermitDocument',
  'PermitRule',
  'Property',
  'RefundActivityLog',
  'RefundApprovalWorkflow',
  'RefundDocumentChecklist',
  'RefundLedger',
  'Reward',
  'RewardClaim',
  'ScannedReceipt',
  'Tenant',
  'Ticket',
  'Unit',
  'User',
  'UserPoints',
  'WorkItem',
];

let memoryData;

const clone = (value) => JSON.parse(JSON.stringify(value));

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

const normaliseData = (data) => {
  const next = { ...data };
  entityNames.forEach((name) => {
    if (!Array.isArray(next[name])) next[name] = [];
  });
  return next;
};

const readData = () => {
  const storage = getStorage();
  if (!storage) {
    memoryData = memoryData || clone(seedData);
    return normaliseData(memoryData);
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = normaliseData(clone(seedData));
    storage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    return normaliseData(JSON.parse(raw));
  } catch {
    const seeded = normaliseData(clone(seedData));
    storage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
};

const writeData = (data) => {
  const next = normaliseData(data);
  const storage = getStorage();
  if (!storage) {
    memoryData = clone(next);
    return next;
  }
  storage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

const sortItems = (items, sort) => {
  if (!sort) return items;
  const descending = sort.startsWith('-');
  const field = descending ? sort.slice(1) : sort;
  return [...items].sort((a, b) => {
    const left = a?.[field] ?? '';
    const right = b?.[field] ?? '';
    if (left === right) return 0;
    return (left > right ? 1 : -1) * (descending ? -1 : 1);
  });
};

const applyLimit = (items, limit) => {
  if (!limit) return items;
  return items.slice(0, limit);
};

const matchesCriteria = (item, criteria = {}) =>
  Object.entries(criteria).every(([key, value]) => {
    if (value === undefined || value === null || value === '') return true;
    return item?.[key] === value;
  });

const createEntityClient = (entityName) => ({
  async list(sort, limit) {
    const data = readData();
    return clone(applyLimit(sortItems(data[entityName] || [], sort), limit));
  },
  async filter(criteria = {}, sort, limit) {
    const data = readData();
    const filtered = (data[entityName] || []).filter((item) => matchesCriteria(item, criteria));
    return clone(applyLimit(sortItems(filtered, sort), limit));
  },
  async create(payload) {
    const data = readData();
    const created = {
      id: payload?.id || `${entityName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      created_date: payload?.created_date || now(),
      ...payload,
    };
    data[entityName] = [created, ...(data[entityName] || [])];
    writeData(data);
    return clone(created);
  },
  async bulkCreate(payloads = []) {
    const created = [];
    for (const payload of payloads) {
      created.push(await this.create(payload));
    }
    return created;
  },
  async update(id, payload) {
    const data = readData();
    const items = data[entityName] || [];
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`${entityName} with id ${id} was not found`);
    }
    const updated = {
      ...items[index],
      ...payload,
      updated_date: now(),
    };
    data[entityName] = items.map((item) => (item.id === id ? updated : item));
    writeData(data);
    return clone(updated);
  },
  async delete(id) {
    const data = readData();
    data[entityName] = (data[entityName] || []).filter((item) => item.id !== id);
    writeData(data);
    return { success: true };
  },
});

const getCurrentUser = () => {
  const storage = getStorage();
  if (!storage) return defaultUser;

  const raw = storage.getItem(USER_KEY);
  if (!raw) {
    storage.setItem(USER_KEY, JSON.stringify(defaultUser));
    storage.setItem('mock_role', defaultUser.role);
    return defaultUser;
  }

  try {
    return JSON.parse(raw);
  } catch {
    storage.setItem(USER_KEY, JSON.stringify(defaultUser));
    storage.setItem('mock_role', defaultUser.role);
    return defaultUser;
  }
};

const auth = {
  async me() {
    return clone(getCurrentUser());
  },
  logout(redirectUrl = '/Splash') {
    const storage = getStorage();
    storage?.removeItem(USER_KEY);
    storage?.removeItem('mock_role');
    if (typeof window !== 'undefined' && redirectUrl) {
      window.location.assign(redirectUrl);
    }
  },
  redirectToLogin(redirectUrl = '/Home') {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams({ redirect: redirectUrl });
    window.location.assign(`/MockLogin?${params.toString()}`);
  },
};

const integrations = {
  Core: {
    async UploadFile({ file }) {
      if (typeof URL !== 'undefined' && file) {
        return { file_url: URL.createObjectURL(file) };
      }
      return { file_url: '' };
    },
    async InvokeLLM(_options = {}) {
      return {
        merchant_name: 'Demo Merchant',
        transaction_date: new Date().toISOString().slice(0, 10),
        total_amount: 125000,
        confidence: 0.85,
        notes: 'Local demo OCR result',
      };
    },
  },
};

/** @type {Record<string, any>} */
const entities = entityNames.reduce((acc, name) => {
  acc[name] = createEntityClient(name);
  return acc;
}, {});

/** @type {any} */
export const appClient = {
  auth,
  entities,
  integrations,
};

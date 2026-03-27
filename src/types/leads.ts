export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: string;
  value: number;
  createdAt: string;
  assignedTo: string;
}

export const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 555-0101',
    company: 'Acme Corp',
    status: 'new',
    source: 'Website',
    value: 5000,
    createdAt: '2026-03-25',
    assignedTo: 'Sarah Johnson',
  },
  {
    id: '2',
    name: 'Emily Davis',
    email: 'emily.davis@techstart.io',
    phone: '+1 555-0102',
    company: 'TechStart',
    status: 'contacted',
    source: 'LinkedIn',
    value: 12000,
    createdAt: '2026-03-24',
    assignedTo: 'Mike Chen',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'mbrown@globalinc.com',
    phone: '+1 555-0103',
    company: 'Global Inc',
    status: 'qualified',
    source: 'Referral',
    value: 25000,
    createdAt: '2026-03-23',
    assignedTo: 'Sarah Johnson',
  },
  {
    id: '4',
    name: 'Jessica Wilson',
    email: 'jwilson@startup.co',
    phone: '+1 555-0104',
    company: 'Startup Co',
    status: 'new',
    source: 'Website',
    value: 8000,
    createdAt: '2026-03-26',
    assignedTo: 'Mike Chen',
  },
  {
    id: '5',
    name: 'David Martinez',
    email: 'dmartinez@enterprise.com',
    phone: '+1 555-0105',
    company: 'Enterprise Ltd',
    status: 'converted',
    source: 'Trade Show',
    value: 45000,
    createdAt: '2026-03-20',
    assignedTo: 'Sarah Johnson',
  },
  {
    id: '6',
    name: 'Amanda Taylor',
    email: 'ataylor@smallbiz.net',
    phone: '+1 555-0106',
    company: 'Small Biz',
    status: 'lost',
    source: 'Cold Call',
    value: 3000,
    createdAt: '2026-03-18',
    assignedTo: 'Mike Chen',
  },
  {
    id: '7',
    name: 'Robert Anderson',
    email: 'randerson@company.com',
    phone: '+1 555-0107',
    company: 'Company Inc',
    status: 'contacted',
    source: 'Website',
    value: 15000,
    createdAt: '2026-03-22',
    assignedTo: 'Sarah Johnson',
  },
  {
    id: '8',
    name: 'Lisa Thomas',
    email: 'lthomas@webmail.com',
    phone: '+1 555-0108',
    company: 'Web Services',
    status: 'qualified',
    source: 'LinkedIn',
    value: 22000,
    createdAt: '2026-03-21',
    assignedTo: 'Mike Chen',
  },
];
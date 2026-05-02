export interface ServiceLevel {
  id: string;
  name: string;
  description: string;
  responseTimeMinutes: number;
  resolutionTimeHours: number;
  priority: "low" | "medium" | "high" | "critical";
  isActive: boolean;
}

export interface LeadSLA {
  id: string;
  leadId: string;
  serviceLevelId: string;
  assignedAt: string;
  responseDeadline: string;
  resolutionDeadline: string;
  status: "on_time" | "at_risk" | "overdue" | "completed";
  responseTime?: number;
  resolutionTime?: number;
  alerts: SLAAlert[];
}

export interface SLAAlert {
  id: string;
  leadSLAId: string;
  type: "response_due" | "resolution_due" | "overdue";
  message: string;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface SLAStats {
  totalLeads: number;
  onTime: number;
  atRisk: number;
  overdue: number;
  completed: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  complianceRate: number;
}
export const LEAD_STATUSES = ["new", "contacted", "qualified", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = ["website", "instagram", "referral"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

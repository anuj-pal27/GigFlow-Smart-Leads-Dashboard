import { Request, Response } from "express";
import { Types } from "mongoose";
import type { SortOrder } from "mongoose";
import { stringify } from "csv-stringify/sync";
import { Lead } from "../models/Lead";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";
import { sendSuccess } from "../utils/response";
import { LEAD_SOURCES, LEAD_STATUSES, LeadSource, LeadStatus } from "../types/lead";

const PAGE_LIMIT = 10;

interface LeadQuery {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sort?: "latest" | "oldest";
  page?: string;
}

const buildLeadFilter = (req: Request, query: LeadQuery) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const filter: Record<string, unknown> = {};

  if (req.user.role === "sales") {
    filter.owner = new Types.ObjectId(req.user.userId);
  }

  if (query.status && LEAD_STATUSES.includes(query.status)) {
    filter.status = query.status;
  }

  if (query.source && LEAD_SOURCES.includes(query.source)) {
    filter.source = query.source;
  }

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } }
    ];
  }

  return filter;
};

export const createLead = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const lead = await Lead.create({
    ...(req.body as Record<string, unknown>),
    owner: req.user.userId
  });

  sendSuccess(res, "Lead created successfully", { lead }, 201);
});

export const getLeads = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as LeadQuery;
  const filter = buildLeadFilter(req, query);

  const page = Number(query.page ?? 1);
  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
  const sort: Record<string, SortOrder> =
    query.sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort(sort)
      .skip((safePage - 1) * PAGE_LIMIT)
      .limit(PAGE_LIMIT),
    Lead.countDocuments(filter)
  ]);

  sendSuccess(res, "Leads fetched successfully", {
    leads,
    pagination: {
      page: safePage,
      limit: PAGE_LIMIT,
      total,
      totalPages: Math.ceil(total / PAGE_LIMIT)
    }
  });
});

export const getLeadById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  if (req.user.role === "sales" && String(lead.owner) !== req.user.userId) {
    throw new AppError("Forbidden", 403);
  }

  sendSuccess(res, "Lead fetched successfully", { lead });
});

export const updateLead = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  if (req.user.role === "sales" && String(lead.owner) !== req.user.userId) {
    throw new AppError("Forbidden", 403);
  }

  Object.assign(lead, req.body);
  await lead.save();

  sendSuccess(res, "Lead updated successfully", { lead });
});

export const deleteLead = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  if (req.user.role === "sales" && String(lead.owner) !== req.user.userId) {
    throw new AppError("Forbidden", 403);
  }

  await lead.deleteOne();

  sendSuccess(res, "Lead deleted successfully", null);
});

export const exportLeadsCsv = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as LeadQuery;
  const filter = buildLeadFilter(req, query);

  const leads = await Lead.find(filter).sort({ createdAt: -1 });

  const csv = stringify(
    leads.map((lead) => ({
      name: lead.name,
      email: lead.email,
      status: lead.status,
      source: lead.source,
      createdAt: lead.createdAt?.toISOString() ?? ""
    })),
    {
      header: true,
      columns: ["name", "email", "status", "source", "createdAt"]
    }
  );

  res.header("Content-Type", "text/csv");
  res.header("Content-Disposition", "attachment; filename=leads.csv");
  res.status(200).send(csv);
});

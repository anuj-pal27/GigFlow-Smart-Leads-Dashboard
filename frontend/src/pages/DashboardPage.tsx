import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AppLayout } from "../components/layout/AppLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";
import { api } from "../lib/api";
import type {
  ApiSuccessResponse,
  Lead,
  LeadSource,
  LeadStatus,
  PaginatedLeadsResponse
} from "../types";

const statusOptions: { label: string; value: "" | LeadStatus }[] = [
  { label: "All", value: "" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Lost", value: "lost" }
];

const sourceOptions: { label: string; value: "" | LeadSource }[] = [
  { label: "All", value: "" },
  { label: "Website", value: "website" },
  { label: "Instagram", value: "instagram" },
  { label: "Referral", value: "referral" }
];

const leadFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email"),
  status: z.enum(["new", "contacted", "qualified", "lost"]),
  source: z.enum(["website", "instagram", "referral"])
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

export const DashboardPage = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [status, setStatus] = useState<"" | LeadStatus>("");
  const [source, setSource] = useState<"" | LeadSource>("");
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<"latest" | "oldest">("latest");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const debouncedSearch = useDebounce(search, 500);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      status: "new",
      source: "website"
    }
  });

  const selectedLeadId = selectedLead?._id;

  const queryParams = useMemo(
    () => ({
      page,
      sort,
      status: status || undefined,
      source: source || undefined,
      search: debouncedSearch || undefined
    }),
    [debouncedSearch, page, sort, source, status]
  );

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await api.get<ApiSuccessResponse<PaginatedLeadsResponse>>("/leads", {
        params: queryParams
      });

      setLeads(response.data.data.leads);
      setTotalPages(response.data.data.pagination.totalPages || 1);
      setTotalItems(response.data.data.pagination.total);

      if (selectedLeadId) {
        const updated = response.data.data.leads.find((lead) => lead._id === selectedLeadId);
        setSelectedLead(updated ?? null);
      }
    } catch (_error) {
      setErrorMessage("Failed to load leads.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  useEffect(() => {
    if (!selectedLead?._id) {
      form.reset({
        name: "",
        email: "",
        status: "new",
        source: "website"
      });
      return;
    }

    form.reset({
      name: selectedLead.name,
      email: selectedLead.email,
      status: selectedLead.status,
      source: selectedLead.source
    });
  }, [form, selectedLead]);

  const onSubmit = async (values: LeadFormValues) => {
    try {
      if (selectedLead) {
        await api.patch(`/leads/${selectedLead._id}`, values);
      } else {
        await api.post("/leads", values);
      }

      setSelectedLead(null);
      await loadLeads();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ??
        "Failed to save lead";
      setErrorMessage(message);
    }
  };

  const fetchLeadDetails = async (id: string) => {
    try {
      const response = await api.get<ApiSuccessResponse<{ lead: Lead }>>(`/leads/${id}`);
      setSelectedLead(response.data.data.lead);
      setErrorMessage("");
    } catch (_error) {
      setErrorMessage("Failed to fetch lead details");
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!window.confirm("Delete this lead permanently?")) {
      return;
    }

    try {
      await api.delete(`/leads/${leadId}`);
      if (selectedLead?._id === leadId) {
        setSelectedLead(null);
      }
      await loadLeads();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ??
        "Failed to delete lead";
      setErrorMessage(message);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await api.get("/leads/export/csv", {
        params: queryParams,
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "leads.csv";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (_error) {
      setErrorMessage("Failed to export leads CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const resetFilters = () => {
    setStatus("");
    setSource("");
    setSearch("");
    setSort("latest");
    setPage(1);
  };

  return (
    <AppLayout>
      <div className="grid gap-6 lg:grid-cols-[340px,1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {selectedLead ? "Update Lead" : "Create Lead"}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Use this form to {selectedLead ? "update selected" : "create new"} lead records.
          </p>

          <form className="mt-4 space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <Input
              label="Name"
              placeholder="Rahul Sharma"
              error={form.formState.errors.name?.message}
              {...form.register("name")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="rahul@example.com"
              error={form.formState.errors.email?.message}
              {...form.register("email")}
            />
            <Select
              label="Status"
              options={statusOptions.filter((option) => option.value).map((option) => ({
                label: option.label,
                value: option.value
              }))}
              {...form.register("status")}
            />
            <Select
              label="Source"
              options={sourceOptions.filter((option) => option.value).map((option) => ({
                label: option.label,
                value: option.value
              }))}
              {...form.register("source")}
            />
            <div className="flex gap-2">
              <Button className="flex-1" type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving..."
                  : selectedLead
                    ? "Update Lead"
                    : "Create Lead"}
              </Button>
              {selectedLead ? (
                <Button
                  className="flex-1"
                  type="button"
                  variant="secondary"
                  onClick={() => setSelectedLead(null)}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Leads</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total records: <span className="font-medium text-slate-700 dark:text-slate-200">{totalItems}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={resetFilters}>
                Reset filters
              </Button>
              <Button variant="secondary" onClick={handleExport} disabled={isExporting}>
                {isExporting ? "Exporting..." : "Export CSV"}
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Input
              label="Search"
              placeholder="Search by name or email"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <Select
              label="Filter by status"
              value={status}
              options={statusOptions}
              onChange={(event) => {
                setStatus(event.target.value as "" | LeadStatus);
                setPage(1);
              }}
            />
            <Select
              label="Filter by source"
              value={source}
              options={sourceOptions}
              onChange={(event) => {
                setSource(event.target.value as "" | LeadSource);
                setPage(1);
              }}
            />
            <Select
              label="Sort"
              value={sort}
              options={[
                { label: "Latest", value: "latest" },
                { label: "Oldest", value: "oldest" }
              ]}
              onChange={(event) => {
                setSort(event.target.value as "latest" | "oldest");
                setPage(1);
              }}
            />
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-4 overflow-x-auto">
            {isLoading ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                Loading leads...
              </div>
            ) : leads.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                No leads found for the selected filters.
              </div>
            ) : (
              <table className="min-w-full border-collapse text-left text-sm text-slate-800 dark:text-slate-200">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400">
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Source</th>
                    <th className="px-3 py-2 font-medium">Created</th>
                    <th className="px-3 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2">{lead.name}</td>
                      <td className="px-3 py-2">{lead.email}</td>
                      <td className="px-3 py-2 capitalize">{lead.status}</td>
                      <td className="px-3 py-2 capitalize">{lead.source}</td>
                      <td className="px-3 py-2">{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="secondary" onClick={() => void fetchLeadDetails(lead._id)}>
                            View
                          </Button>
                          <Button variant="secondary" onClick={() => setSelectedLead(lead)}>
                            Edit
                          </Button>
                          {user?.role === "admin" ? (
                            <Button variant="danger" onClick={() => void handleDelete(lead._id)}>
                              Delete
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page {page} of {Math.max(totalPages, 1)}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </div>

          {selectedLead ? (
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Selected Lead Details</h3>
              <p className="mt-1">
                <span className="font-medium">Name:</span> {selectedLead.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {selectedLead.email}
              </p>
              <p className="capitalize">
                <span className="font-medium">Status:</span> {selectedLead.status}
              </p>
              <p className="capitalize">
                <span className="font-medium">Source:</span> {selectedLead.source}
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </AppLayout>
  );
};

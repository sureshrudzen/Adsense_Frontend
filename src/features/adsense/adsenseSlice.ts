import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../utils/api";

// ---------------- Types ----------------
export interface AdsenseAccount {
    _id?: string;
    accountId: string;
    displayName?: string;
}

export interface Site {
    name: string;
    domain: string;
    state: string;
}

export interface ReportData {
    headers: string[];
    rows: string[][];
    totals?: string[];
    averages?: string[];
    totalMatchedRows?: number;
}

interface ReportFilters {
    accountId: string;
    dateRange: string;
    startDate?: string;
    endDate?: string;
    country?: string;
    selectedSite?: string;
}

interface AdsenseState {
    // Accounts
    accounts: AdsenseAccount[];
    loading: boolean;
    error: string | null;
    search: string;
    page: number;
    pageSize: number;

    // Sites & Report
    sites: Site[];
    report: ReportData | null;
    loadingSites: boolean;
    loadingReport: boolean;
}

// ---------------- Initial State ----------------
const initialState: AdsenseState = {
    accounts: [],
    loading: false,
    error: null,
    search: "",
    page: 1,
    pageSize: 5,
    sites: [],
    report: null,
    loadingSites: false,
    loadingReport: false,
};

// ---------------- Thunks ----------------
// Fetch Accounts
export const fetchAccounts = createAsyncThunk(
    "adsense/fetchAccounts",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const res = await api.get<{ accounts: AdsenseAccount[] }>(
                "/auth/accounts",
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );
            return res.data.accounts;
        } catch (err: any) {
            return rejectWithValue("Failed to fetch AdSense accounts");
        }
    }
);

// Delete Account
export const deleteAccount = createAsyncThunk(
    "adsense/deleteAccount",
    async (accountId: string, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            await api.delete(`/adsense/accounts/${accountId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return accountId;
        } catch (err: any) {
            return rejectWithValue("Failed to delete AdSense account");
        }
    }
);

// Fetch Sites
export const fetchSites = createAsyncThunk(
    "adsense/fetchSites",
    async (accountId: string, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const res = await api.get<{ sites: Site[] }>("/adsense/sites", {
                params: { accountId },
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data.sites || [];
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.error || "Failed to fetch sites"
            );
        }
    }
);

// Fetch Report
export const fetchReport = createAsyncThunk(
    "adsense/fetchReport",
    async (filters: ReportFilters, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const res = await api.get("/adsense/report", {
                params: {
                    accountId: filters.accountId,
                    dateRange: filters.dateRange,
                    dimensions: ["DATE"],
                    metrics: ["ESTIMATED_EARNINGS", "CLICKS", "PAGE_VIEWS", "IMPRESSIONS"],
                    filters: [
                        filters.selectedSite ? `DOMAIN_NAME==${filters.selectedSite}` : null,
                        filters.country ? `COUNTRY_NAME==${filters.country}` : null,
                    ].filter(Boolean),
                    startDate:
                        filters.dateRange === "CUSTOM" ? filters.startDate : undefined,
                    endDate:
                        filters.dateRange === "CUSTOM" ? filters.endDate : undefined,
                },
                headers: { Authorization: `Bearer ${token}` },
            });

            return res.data as ReportData;
        } catch (err: any) {
            return rejectWithValue("Failed to fetch report");
        }
    }
);

// ---------------- Slice ----------------
const adsenseSlice = createSlice({
    name: "adsense",
    initialState,
    reducers: {
        setSearch: (state, action: PayloadAction<string>) => {
            state.search = action.payload;
            state.page = 1;
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Accounts
        builder
            .addCase(fetchAccounts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAccounts.fulfilled, (state, action) => {
                state.loading = false;
                state.accounts = action.payload || [];
            })
            .addCase(fetchAccounts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteAccount.fulfilled, (state, action) => {
                state.accounts = state.accounts.filter(
                    (a) => a.accountId !== action.payload
                );
            })
            .addCase(deleteAccount.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Sites
        builder
            .addCase(fetchSites.pending, (state) => {
                state.loadingSites = true;
                state.error = null;
            })
            .addCase(fetchSites.fulfilled, (state, action) => {
                state.loadingSites = false;
                state.sites = action.payload;
            })
            .addCase(fetchSites.rejected, (state, action) => {
                state.loadingSites = false;
                state.error = action.payload as string;
            });

        // Report
        builder
            .addCase(fetchReport.pending, (state) => {
                state.loadingReport = true;
                state.error = null;
            })
            .addCase(fetchReport.fulfilled, (state, action) => {
                state.loadingReport = false;
                state.report = action.payload;
            })
            .addCase(fetchReport.rejected, (state, action) => {
                state.loadingReport = false;
                state.error = action.payload as string;
            });
    },
});

export const { setSearch, setPage } = adsenseSlice.actions;
export default adsenseSlice.reducer;

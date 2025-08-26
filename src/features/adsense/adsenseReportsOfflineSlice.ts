import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../utils/api";
export interface AdsenseReport {
    _id: string;
    userId: string;
    accountId: string;
    headers: string[];
    rows: string[][];
    totals: string[];
    averages: string[];
    totalMatchedRows: string;
    startDate: string;
    endDate: string;
    createdAt: string;
}

interface ReportsState {
    data: AdsenseReport[];
    loading: boolean;
    error: string | null;
}

// Initial state
const initialState: ReportsState = {
    data: [],
    loading: false,
    error: null,
};

// ✅ Async thunk to fetch reports
export const fetchOfflineReports = createAsyncThunk<
    AdsenseReport[],
    { accountId?: string }
>("reports/fetchReports", async ({ accountId }, { rejectWithValue }) => {
    try {
        const res = await api.get("/adsense/offline/reports", {
            params: { accountId },
        });
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || "Failed to fetch reports");
    }
});

// ✅ Slice
const adsenseReportsSlice = createSlice({
    name: "reports",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOfflineReports.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOfflineReports.fulfilled, (state, action: PayloadAction<AdsenseReport[]>) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchOfflineReports.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default adsenseReportsSlice.reducer;

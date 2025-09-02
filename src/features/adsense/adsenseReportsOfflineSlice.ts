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

// ✅ Async thunk to fetch ALL reports (admin use)
export const fetchAllReports = createAsyncThunk<
  AdsenseReport[]
>("reportsOffline/fetchAllReports", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/adsense/offline/reports/all");
    console.log("ALL reports:", res.data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.error || "Failed to fetch all reports"
    );
  }
});

// ✅ Async thunk to fetch reports for current user
export const fetchOfflineReports = createAsyncThunk<
  AdsenseReport[],
  { accountId?: string }
>("reportsOffline/fetchReports", async ({ accountId }, { rejectWithValue }) => {
  try {
    const res = await api.get("/adsense/offline/reports", {
      params: { accountId },
    });
    console.log("User reports:", res.data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.error || "Failed to fetch reports"
    );
  }
});

// ✅ Slice
const adsenseReportsOfflineSlice = createSlice({
  name: "reportsOffline", // 👈 MUST match store key
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🔹 Current user reports
      .addCase(fetchOfflineReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOfflineReports.fulfilled,
        (state, action: PayloadAction<AdsenseReport[]>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchOfflineReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔹 All reports (admin)
      .addCase(fetchAllReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllReports.fulfilled,
        (state, action: PayloadAction<AdsenseReport[]>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchAllReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default adsenseReportsOfflineSlice.reducer;

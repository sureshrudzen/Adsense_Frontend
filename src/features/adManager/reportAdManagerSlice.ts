// features/report/reportSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Define the Report type based on your backend response
export interface Report {
  reportJobId: string;
  userId: string;
  networkId: string;
  updatedAt: string;
  rows: any[]; // You can define a proper type here if you know the structure
}

// Define the state type
interface ReportState {
  data: Report | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  data: null,
  loading: false,
  error: null,
};

// Async thunk to fetch the report by networkId
interface FetchReportParams {
  networkId: string;
  dateRange: string;
}

export const fetchReport = createAsyncThunk<
  Report, // return type
  FetchReportParams, // updated input type
  { rejectValue: string } // error type
>(
  "report/fetchReport",
  async ({ networkId, dateRange }, { rejectWithValue }) => {
    try {
      const response = await api.get("/admanager/report", {
        params: { networkId, dateRange },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch report");
    }
  }
);


// Slice
const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    clearReportError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.data = null;
      })
      .addCase(fetchReport.fulfilled, (state, action: PayloadAction<Report>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
      });
  },
});

export const { clearReportError } = reportSlice.actions;
export default reportSlice.reducer;

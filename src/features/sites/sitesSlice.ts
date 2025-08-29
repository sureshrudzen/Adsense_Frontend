import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { Site, SitesState } from "./sitesTypes";

// 🔹 Fetch sites for a specific account
export const fetchSites = createAsyncThunk<Site[], string, { rejectValue: string }>(
  "sites/fetchSites",
  async (accountId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/adsense/sites/${accountId}`);
      return data.sites as Site[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// 🔹 Fetch all sites
export const fetchAllSites = createAsyncThunk<Site[], void, { rejectValue: string }>(
  "sites/fetchAllSites",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/adsense/sites");
      return data.sites as Site[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

const initialState: SitesState = {
  items: [],
  loading: false,
  error: null,
};

const sitesSlice = createSlice({
  name: "sites",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSites.fulfilled, (state, action: PayloadAction<Site[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ fetchAllSites added here
      .addCase(fetchAllSites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSites.fulfilled, (state, action: PayloadAction<Site[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllSites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default sitesSlice.reducer;

// src/store/websiteSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../utils/api";

export interface Website {
  _id: string;
  url: string;
}

interface WebsiteState {
  websites: Website[];
  loading: boolean;
  error: string | null;
}

const initialState: WebsiteState = {
  websites: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchWebsites = createAsyncThunk(
  "websites/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/web/websites");
      return res.data as Website[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch websites");
    }
  }
);

export const addWebsite = createAsyncThunk(
  "websites/add",
  async (url: string, { rejectWithValue }) => {
    try {
      const res = await api.post("/web/websites", { url });
      return res.data.website as Website;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to add website");
    }
  }
);

export const deleteWebsite = createAsyncThunk(
  "websites/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/web/websites/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete website");
    }
  }
);

const websiteSlice = createSlice({
  name: "websites",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchWebsites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWebsites.fulfilled, (state, action: PayloadAction<Website[]>) => {
        state.loading = false;
        state.websites = action.payload;
      })
      .addCase(fetchWebsites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add
      .addCase(addWebsite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addWebsite.fulfilled, (state, action: PayloadAction<Website>) => {
        state.loading = false;
        state.websites.push(action.payload);
      })
      .addCase(addWebsite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete
      .addCase(deleteWebsite.fulfilled, (state, action: PayloadAction<string>) => {
        state.websites = state.websites.filter((w) => w._id !== action.payload);
      })
      .addCase(deleteWebsite.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default websiteSlice.reducer;

// src/features/filter/filterSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FilterState {
  dateRange: string;
  startDate: string | null;
  endDate: string | null;
  country: string;
  site: string;
}

const initialState: FilterState = {
  dateRange: "LAST_7_DAYS",
  startDate: null,
  endDate: null,
  country: "",
  site: "",
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setDateRange(state, action: PayloadAction<string>) {
      state.dateRange = action.payload;
    },
    setCustomRange(
      state,
      action: PayloadAction<{ startDate: string | null; endDate: string | null }>
    ) {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    setCountry(state, action: PayloadAction<string>) {
      state.country = action.payload;
    },
    setSite(state, action: PayloadAction<string>) {
      state.site = action.payload;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const { setDateRange, setCustomRange, setCountry, setSite, resetFilters } =
  filterSlice.actions;
export default filterSlice.reducer;

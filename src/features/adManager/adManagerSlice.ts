import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../utils/api";

export interface AdManagerAccount {
    googleId: string;
    email: string;
    displayName: string;
    networkId: string; // 👈 null hata diya
}
interface AdManagerState {
    accounts: AdManagerAccount[];
    loading: boolean;
    error: string | null;
    search: string;
    page: number;
    pageSize: number;
}

const initialState: AdManagerState = {
    accounts: [],
    loading: false,
    error: null,
    search: "",
    page: 1,
    pageSize: 5, // 👈 Default rows per page
};

// 🔹 Fetch all Ad Manager accounts of logged-in user
export const fetchAdManagerAccounts = createAsyncThunk<
    AdManagerAccount[],
    void,
    { rejectValue: string }
>("adManager/fetchAccounts", async (_, { rejectWithValue }) => {
    try {
        const res = await api.get("/admanager/accounts");
        return res.data;
    } catch (err: any) {
        return rejectWithValue(
            err.response?.data?.msg || "Failed to fetch Ad Manager accounts"
        );
    }
});

// 🔹 Delete Ad Manager account
export const deleteAccount = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>("adManager/deleteAccount", async (networkId, { rejectWithValue }) => {
    try {
        await api.delete(`/admanager/accounts/${networkId}`);
        return networkId;
    } catch (err: any) {
        return rejectWithValue(
            err.response?.data?.msg || "Failed to delete Ad Manager account"
        );
    }
});

const adManagerSlice = createSlice({
    name: "adManager",
    initialState,
    reducers: {
        clearAdManagerError: (state) => {
            state.error = null;
        },
        setSearch: (state, action: PayloadAction<string>) => {
            state.search = action.payload;
            state.page = 1; // 🔄 Search karte hi page 1 reset
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdManagerAccounts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchAdManagerAccounts.fulfilled,
                (state, action: PayloadAction<AdManagerAccount[]>) => {
                    state.loading = false;
                    state.accounts = action.payload;
                }
            )
            .addCase(fetchAdManagerAccounts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Unknown error";
            });

        builder.addCase(
            deleteAccount.fulfilled,
            (state, action: PayloadAction<string>) => {
                state.accounts = state.accounts.filter(
                    (acc) => acc.networkId !== action.payload
                );
            }
        );
    },
});

export const { clearAdManagerError, setSearch, setPage } =
    adManagerSlice.actions;
export default adManagerSlice.reducer;

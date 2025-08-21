import { configureStore } from "@reduxjs/toolkit";
import adsenseReducer from "../features/adsense/adsenseSlice";
import filterReducer from "../features/filter/filterSlice";
import reportsOfflineReducer from "../features/adsense/adsenseReportsOfflineSlice"
export const store = configureStore({
  reducer: {
    adsense: adsenseReducer,
    filter: filterReducer,
    reportsOffline: reportsOfflineReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

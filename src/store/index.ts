import { configureStore } from "@reduxjs/toolkit";
import adsenseReducer from "../features/adsense/adsenseSlice";
import filterReducer from "../features/filter/filterSlice";
import reportsOfflineReducer from "../features/adsense/adsenseReportsOfflineSlice"
import sitesReducer from "../features/sites/sitesSlice";
import adManagerReducer from "../features/adManager/adManagerSlice"
import admanagerreportReducer from "../features/adManager/reportAdManagerSlice"

export const store = configureStore({
  reducer: {
    adsense: adsenseReducer,
    filter: filterReducer,
    reportsOffline: reportsOfflineReducer,
    sites: sitesReducer,
    admanager: adManagerReducer,
    admanagerReport: admanagerreportReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

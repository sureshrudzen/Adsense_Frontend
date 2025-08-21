import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarLineIcon,
  EyeIcon,
  MailIcon,
  TableIcon,
  TrashBinIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchReport, fetchSites } from "../../features/adsense/adsenseSlice";
import { fetchOfflineReports } from "../../features/adsense/adsenseReportsOfflineSlice";
import { useSearchParams } from "react-router-dom";
interface MetricCardProps {
  title: string;
  value: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend: "up" | "down";
  change: string;
}

export default function AdsMetrics() {
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get("account") || "";
  const dispatch = useDispatch<AppDispatch>();
  // const { report, loadingReport, error } = useSelector(
  //   (state: RootState) => state.adsense
  // );
  const { data, loading,error } = useSelector((state: RootState) => state.reportsOffline);

  useEffect(() => {
    dispatch(fetchOfflineReports({ accountId }));
  }, [dispatch, accountId]);
// console.log(report,"report")
  console.log(data[0], "daadadadaaad")
  const [dateRange, setDateRange] = useState("TODAY");
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
  const [country, setCountry] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("");

  const [startDate, endDate] = range;
  // ✅ Extract totals from report
  // const totals = report?.totals || [];
  // Adsense API returns totals as an array of strings matching metrics order
  // Example order: ["ESTIMATED_EARNINGS", "CLICKS", "PAGE_VIEWS", "IMPRESSIONS"]

// ✅ Extract cells safely
// const cells = reportData?.totals?.cells || [];
// Example order: [EARNINGS, CLICKS, PAGE_VIEWS, IMPRESSIONS]
const reportData: any = data[0];

// Ek hi array bana lo dono cases ke liye
const totalsArray: string[] =
  Array.isArray(reportData?.totals)
    ? reportData?.totals               // online → string[]
    : reportData?.totals?.cells?.map((c: any) => c.value) || []; // offline → extract values

// Ab yahan se common code chalega
const totalSpend = Number(totalsArray[1] || 0);       // Earnings
const totalClicks = Number(totalsArray[2] || 0);      // Clicks
const totalPageViews = Number(totalsArray[3] || 0);   // Page Views
const totalImpressions = Number(totalsArray[4] || 0); // Impressions

  // Example ROAS calculation (if you store revenue in ESTIMATED_EARNINGS)
  // const roas =
  //   totalSpend > 0 ? (Number(totals[0]) / totalSpend).toFixed(2) : "0.0";
  // useEffect(() => {
  //   if (accountId) {
  //     dispatch(
  //       fetchReport({
  //         accountId,
  //         dateRange,
  //         startDate: startDate?.toISOString().split("T")[0],
  //         endDate: endDate?.toISOString().split("T")[0],
  //         country,
  //         selectedSite,
  //       })
  //     );
  //   }
  // }, [accountId, dateRange, startDate, endDate, country, selectedSite, dispatch]);
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Adsense Performance Report
        </h3>
        <div className="space-y-4 md:flex md:space-y-0 md:space-x-4">
          {/* Date Range Dropdown */}
          <div className="flex-1">
            <label className="block text-sm font-medium">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="LAST_7_DAYS">Last 7 days</option>
              <option value="LAST_30_DAYS">Last 30 days</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          {/* Custom Date Picker */}
          {dateRange === "CUSTOM" && (
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Select Range
              </label>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) =>
                  setRange(update as [Date | null, Date | null])
                }
                isClearable
                placeholderText="Select a date range"   // ✅ placeholder
                className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}


          {/* Country Dropdown */}
          <div className="flex-1">
            <label className="block text-sm font-medium">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="">All</option>
              <option value="IN">India</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
            </select>
          </div>
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        <MetricCard
          title="Total Earnings"
          value={`$${totalSpend.toLocaleString()}`}
          Icon={DollarLineIcon}
          trend="up"
          change="8.2%"
        />
        <MetricCard
          title="Clicks"
          value={totalClicks.toLocaleString()}
          Icon={MailIcon}
          trend="down"
          change="2.9%"
        />

        <MetricCard
          title="Page Views"
          value={totalPageViews.toLocaleString()}
          Icon={TableIcon}
          trend="up"
          change="6.3%"
        />
        <MetricCard
          title="Impressions"
          value={totalImpressions.toLocaleString()}
          Icon={EyeIcon}
          trend="up"
          change="5.6%"
        />
        {/* <MetricCard
          title="ROAS"
          value={`${roas}x`}
          Icon={TrashBinIcon}
          trend="up"
          change="4.1%"
        /> */}
      </div>
    </div>
  );
}

function MetricCard({ title, value, Icon, trend, change }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        <Icon className="text-gray-800 size-6 dark:text-white/90" />
      </div>
      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {value}
          </h4>
        </div>
        <Badge color={trend === "up" ? "success" : "error"}>
          {trend === "up" ? <ArrowUpIcon /> : <ArrowDownIcon />}
          {change}
        </Badge>
      </div>
    </div>
  );
}

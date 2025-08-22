import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarLineIcon,
  EyeIcon,
  MailIcon,
  TableIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchOfflineReports } from "../../features/adsense/adsenseReportsOfflineSlice";
import { useSearchParams } from "react-router-dom";
import AdSenseDashboard from "../../pages/AddWebsite/Adsense";
interface MetricCardProps {
  title: string;
  value: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend: "up" | "down";
  change: string;
}

// 🔹 Helper: format Date → "YYYY-MM-DD"
function formatDate(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AdsMetrics({ onData }: { onData?: (data: any) => void }) {

  const [searchParams] = useSearchParams();
  const accountId = searchParams.get("account") || "";
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.reportsOffline
  );

  useEffect(() => {
    dispatch(fetchOfflineReports({ accountId }));
  }, [dispatch, accountId]);

  const [dateRange, setDateRange] = useState("TODAY");
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
  const [country, setCountry] = useState("");

  const [startDate, endDate] = range;
  const todayReport = data.find((r: any) => r.type === "TODAY");
  const last30Report = data.find((r: any) => r.type === "LAST_30_DAYS");
  let rows: any[] = [];

  if (dateRange === "TODAY") {
    rows = todayReport?.rows || [];
  } else {
    rows = last30Report?.rows || [];
  }
  // 🔹 Dates for today / yesterday
  const todayStr = formatDate(new Date());
  const yesterdayStr = formatDate(new Date(Date.now() - 86400000));

  // 🔹 Start / End for custom ranges
  const startStr = startDate ? formatDate(startDate) : null;
  const endStr = endDate ? formatDate(endDate) : null;
  let filteredRows: any[] = [];

  if (dateRange === "TODAY") {
    // Backend se TODAY already filtered aata hai
    filteredRows = rows;
  } else if (dateRange === "YESTERDAY") {
    filteredRows = rows.filter((row) => row.cells[0]?.value === yesterdayStr);
  } else if (dateRange === "LAST_7_DAYS") {
    const last7 = formatDate(new Date(Date.now() - 6 * 86400000));
    filteredRows = rows.filter(
      (row) => row.cells[0]?.value >= last7 && row.cells[0]?.value <= todayStr
    );
  } else if (dateRange === "LAST_30_DAYS") {
    const last30 = formatDate(new Date(Date.now() - 29 * 86400000));
    filteredRows = rows.filter(
      (row) => row.cells[0]?.value >= last30 && row.cells[0]?.value <= todayStr
    );
  } else if (dateRange === "CUSTOM" && startStr && endStr) {
    filteredRows = rows.filter(
      (row) => row.cells[0]?.value >= startStr && row.cells[0]?.value <= endStr
    );
  }
  // 🔹 Aggregate totals from filtered rows
  const totals = filteredRows.reduce(
    (acc, row) => {
      const cells = row.cells || [];
      acc.earnings += Number(cells[1]?.value || 0);
      acc.clicks += Number(cells[2]?.value || 0);
      acc.pageViews += Number(cells[3]?.value || 0);
      acc.impressions += Number(cells[4]?.value || 0);
      return acc;
    },
    { earnings: 0, clicks: 0, pageViews: 0, impressions: 0 }
  );
  const result = {
    rows: filteredRows,
    headers: todayReport?.headers || last30Report?.headers || [],
    dateRange,
    totals,
  };

  // agar parent ne callback diya hai to use bhej do
  useEffect(() => {
    if (onData) {
      onData(result);
    }
  }, [filteredRows, dateRange, totals]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Adsense Performance Report ({dateRange})
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
                placeholderText="Select a date range"
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
          value={`$${totals.earnings.toLocaleString()}`}
          Icon={DollarLineIcon}
          trend="up"
          change="8.2%"
        />
        <MetricCard
          title="Clicks"
          value={totals.clicks.toLocaleString()}
          Icon={MailIcon}
          trend="down"
          change="2.9%"
        />
        <MetricCard
          title="Page Views"
          value={totals.pageViews.toLocaleString()}
          Icon={TableIcon}
          trend="up"
          change="6.3%"
        />
        <MetricCard
          title="Impressions"
          value={totals.impressions.toLocaleString()}
          Icon={EyeIcon}
          trend="up"
          change="5.6%"
        />
      </div>
      <AdSenseDashboard
        rows={filteredRows}
        headers={todayReport?.headers || last30Report?.headers || []}
        dateRange={dateRange}
        totals={totals}   // ✅ totals bhi bhej do
      />
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



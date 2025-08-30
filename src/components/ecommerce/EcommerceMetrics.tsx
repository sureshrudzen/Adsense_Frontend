import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarLineIcon,
  EyeIcon,
  MailIcon,
  TableIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchSites } from "../../features/sites";
import { fetchOfflineReports } from "../../features/adsense/adsenseReportsOfflineSlice";
import { useSearchParams } from "react-router-dom";
import AdSenseDashboard from "../../pages/AddWebsite/Adsense";
import ReportViewer from "../../pages/AddWebsite/ReportViewer";
import FilterPanel from "../common/adsense/FilterPanel";

interface MetricCardProps {
  title: string;
  value: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend: "up" | "down";
  change: string;
}
type ReportRow = {
  cells: { value: string }[];
};

type Report = {
  type: string;
  headers: string[] | { name: string }[];
  rows: ReportRow[];
};
// 🔹 Helper: format Date → "YYYY-MM-DD"
function formatDate(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 🔹 Helper: human-readable date range label
function getDateRangeLabel(dateRange: string, start: Date | null, end: Date | null) {
  if (dateRange === "CUSTOM" && start && end) {
    return `${formatDate(start)} → ${formatDate(end)}`;
  }
  if (dateRange === "TODAY") return "Today";
  if (dateRange === "YESTERDAY") return "Yesterday";
  if (dateRange === "LAST_7_DAYS") return "Last 7 Days";
  if (dateRange === "LAST_30_DAYS") return "Last 30 Days";
  return dateRange;
}

export default function AdsMetrics() {
  const defaultColumns = ["ESTIMATED_EARNINGS", "CLICKS", "PAGE_VIEWS", "IMPRESSIONS"];
  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultColumns);

  const [siteQuery, setSiteQuery] = useState("");
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [showSite, setShowSite] = useState(false);
  const [domainSearch, setDomainSearch] = useState("");

  const [dateRange, setDateRange] = useState("TODAY");
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
const [country, setCountry] = useState<string[]>([]);



  const [searchParams] = useSearchParams();
  const accountId = searchParams.get("account") || "";
  const dispatch = useDispatch<AppDispatch>();

  const { data, loading, error } = useSelector((state: RootState) => state.reportsOffline);
  const {
    items: sites,
    loading: sitesLoading,
    error: sitesError,
  } = useSelector((state: RootState) => state.sites);

  useEffect(() => {
    dispatch(fetchOfflineReports({ accountId }));
  }, [dispatch, accountId]);

  useEffect(() => {
    if (accountId) {
      dispatch(fetchSites(accountId));
    }
  }, [dispatch, accountId]);

  const [startDate, endDate] = range;

  const todayReport = data.find((r: any) => r.type === "TODAY") as Report | undefined;
  const last30Report = data.find((r: any) => r.type === "LAST_30_DAYS") as Report | undefined;
  const headers = todayReport?.headers || last30Report?.headers || [];
  const rows: ReportRow[] = (dateRange === "TODAY"
    ? todayReport?.rows
    : last30Report?.rows) || [];
  // 🔹 Date strings
  const todayStr = formatDate(new Date());
  const yesterdayStr = formatDate(new Date(Date.now() - 86400000));
  const startStr = startDate ? formatDate(startDate) : null;
  const endStr = endDate ? formatDate(endDate) : null;

  // 🔹 Filtered rows by date
  let filteredRows: ReportRow[] = [...rows];
  if (dateRange === "YESTERDAY") {
    filteredRows = rows.filter(row => row.cells[0]?.value === yesterdayStr);
  } else if (dateRange === "LAST_7_DAYS") {
    const last7 = formatDate(new Date(Date.now() - 6 * 86400000));
    filteredRows = rows.filter(row => row.cells[0]?.value >= last7 && row.cells[0]?.value <= todayStr);
  } else if (dateRange === "LAST_30_DAYS") {
    const last30 = formatDate(new Date(Date.now() - 29 * 86400000));
    filteredRows = rows.filter(row => row.cells[0]?.value >= last30 && row.cells[0]?.value <= todayStr);
  } else if (dateRange === "CUSTOM" && startStr && endStr) {
    filteredRows = rows.filter(row => row.cells[0]?.value >= startStr && row.cells[0]?.value <= endStr);
  }

if (country.length > 0) {
  const countryIndex = getHeaderIndex(headers, "COUNTRY_NAME"); // or whatever your country column is called
  filteredRows = filteredRows.filter(row => country.includes(row.cells[countryIndex]?.value));
}

  // 🔹 Filter by site
  if (selectedSites.length > 0) {
    filteredRows = filteredRows.filter(row => selectedSites.includes(row.cells[1]?.value));
  }

  if (siteQuery.trim()) {
    const query = siteQuery.toLowerCase();
    filteredRows = filteredRows.filter(row => row.cells[1]?.value.toLowerCase().includes(query));
  }

  const uniqueSites = Array.from(
    new Set(rows.map(row => row.cells[1]?.value).filter(Boolean))
  ).sort();



  const allColumns = headers.map((h: any) => (typeof h === "string" ? h : h.name));
  // 🔄 Sync default columns with available headers
  useEffect(() => {
    if (headers.length > 0) {
      const headerNames = headers.map((h: any) => (typeof h === "string" ? h : h.name));
      const filteredDefault = defaultColumns.filter(col => headerNames.includes(col));
      setVisibleColumns(prev => [...new Set([...prev, ...filteredDefault])]);
    }
  }, [headers]);

  function getHeaderIndex(headers: any[], name: string) {
    return headers.findIndex(h => (typeof h === "string" ? h : h.name) === name);
  }

  const earningsIndex = getHeaderIndex(headers, "ESTIMATED_EARNINGS");
  const clicksIndex = getHeaderIndex(headers, "CLICKS");
  const pageViewsIndex = getHeaderIndex(headers, "PAGE_VIEWS");
  const impressionsIndex = getHeaderIndex(headers, "IMPRESSIONS");
  const datesIndex = getHeaderIndex(headers, "DATE");
  const totals = filteredRows.reduce(
    (acc, row) => {
      const cells = row.cells || [];
      acc.earnings += Number(cells[earningsIndex]?.value || 0);
      acc.clicks += Number(cells[clicksIndex]?.value || 0);
      acc.pageViews += Number(cells[pageViewsIndex]?.value || 0);
      acc.impressions += Number(cells[impressionsIndex]?.value || 0);
      if (!acc.date && cells[datesIndex]?.value) {
        acc.date = cells[datesIndex].value;
      } return acc;
    },
    {
      earnings: 0, clicks: 0, pageViews: 0, impressions: 0,
      date: "",
    }
  );

  const toggleColumn = (col: string) => {
    setVisibleColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };
  const countries = Array.from(
    new Set(rows.map(row => row.cells[2]?.value).filter(Boolean))
  ).sort();
  return (
    <div className="space-y-4">
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

      <ReportViewer sites={sites} loading={sitesLoading} error={sitesError} />

      <FilterPanel
        dateRange={dateRange}
        setDateRange={setDateRange}
        range={range}
        setRange={setRange}
        country={country}
        setCountry={setCountry}
        domainSearch={domainSearch}
        setDomainSearch={setDomainSearch}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        toggleColumn={toggleColumn}
        allColumns={allColumns}
        siteQuery={siteQuery}
        setSiteQuery={setSiteQuery}
        uniqueSites={uniqueSites}
        selectedSites={selectedSites}
        setSelectedSites={setSelectedSites}
        showSite={showSite}
        setShowSite={setShowSite}
        countries={countries}
      />


      <AdSenseDashboard
        rows={filteredRows}
        headers={headers}
        dateRange={getDateRangeLabel(dateRange, startDate, endDate)}
        totals={totals}
        visibleColumns={visibleColumns}
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

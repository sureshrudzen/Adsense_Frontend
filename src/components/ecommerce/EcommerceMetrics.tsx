import {
  DollarLineIcon,
  MailIcon,
  TableIcon,
} from "../../icons";
import { CircleFadingArrowUp, Camera } from 'lucide-react';
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchSites } from "../../features/sites";
import { fetchOfflineReports } from "../../features/adsense/adsenseReportsOfflineSlice";
import { useSearchParams } from "react-router-dom";
import AdSenseDashboard from "../../pages/AddWebsite/Adsense";
import ReportViewer from "../../pages/AddWebsite/ReportViewer";
import FilterPanel from "../common/adsense/FilterPanel";


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
  const defaultColumns = ["ESTIMATED_EARNINGS", "CLICKS", "PAGE_VIEWS", "IMPRESSIONS", "CTR"];
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
  const refreshData = () => {
    if (accountId) {
      // dispatch(fetchReport({ accountId, dateRange }));
      dispatch(fetchSites(accountId));
      dispatch(fetchOfflineReports({ accountId }));
    }
  };
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


  // console.log(filteredRows, "filteredRows")
  // const countryIndex = 2;

  // const updatedRows = filteredRows.map(row => {
  //   // Make a shallow copy of the cells array
  //   const newCells = row.cells.filter((_, idx) => idx !== countryIndex);

  //   // Return a new row object with updated cells
  //   return { ...row, cells: newCells };
  // });

  // console.log(updatedRows, "filteredRows after removing country cell");


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
  // const cpcIndex = getHeaderIndex(headers, "COST_PER_CLICK");
  const totals = filteredRows.reduce(
    (acc, row) => {
      const cells = row.cells || [];
      acc.earnings += Number(cells[earningsIndex]?.value || 0);
      acc.clicks += Number(cells[clicksIndex]?.value || 0);
      acc.pageViews += Number(cells[pageViewsIndex]?.value || 0);
      acc.impressions += Number(cells[impressionsIndex]?.value || 0);
      // const rowCpc = Number(cells[cpcIndex]?.value || 0);
      if (!acc.date && cells[datesIndex]?.value) {
        acc.date = cells[datesIndex].value;
      }

      acc.cpcSum = acc.earnings / acc.clicks;

      if (!acc.date && cells[datesIndex]?.value) {
        acc.date = cells[datesIndex].value;
      }

      if (acc.impressions > 0) {
        acc.ctr = (acc.clicks / acc.impressions) * 100;
      } else {
        acc.ctr = 0; // Avoid division by zero
      }
      return acc;
    },
    {
      earnings: 0, clicks: 0, pageViews: 0, impressions: 0,
      date: "", ctr: 0, cpcSum: 0,
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          {/* Icon */}
          <div className="self-start sm:self-auto p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
            <TableIcon className="w-6 h-5 sm:w-8 sm:h-8 text-white" />
          </div>
          {/* Title and Subtitle */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Adsense Performance
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              {/* {getDateRangeLabel(dateRange, start, end)} • Real-time Analytics */}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium">{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 md:gap-6">
        <MetricCard
          title="Total Earnings"
          value={`$${totals.earnings.toLocaleString()}`}
          Icon={DollarLineIcon}
          trend="up"
          gradient="from-emerald-500 to-green-600"
        />
        <MetricCard
          title="CTR"
          value={`${(Math.floor((totals.ctr ?? 0) * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`}
          Icon={Camera}
          trend="up"
          gradient="from-pink-500 to-yellow-600"
        />
        <MetricCard
          title="Clicks"
          value={totals.clicks.toLocaleString()}
          Icon={MailIcon}
          trend="down"
          gradient="from-blue-500 to-cyan-600"
        />
        <MetricCard
          title="Page Views"
          value={totals.pageViews.toLocaleString()}
          Icon={TableIcon}
          trend="up"

          gradient="from-purple-500 to-pink-600"
        />
        <MetricCard
          title="Impressions"
          value={totals.impressions.toLocaleString()}
          Icon={CircleFadingArrowUp}
          trend="up"
          gradient="from-orange-500 to-red-600"
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
function MetricCard({
  title,
  value,
  Icon,
  gradient,
}: {
  title: string;
  value: string | number;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend: "up" | "down";
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-1 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 w-full sm:w-auto">
      {/* Background gradient effect */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${gradient}`}
      ></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col items-end sm:items-start">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1">
              {title}
            </p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

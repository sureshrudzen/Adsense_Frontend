import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import AdSenseDashboard from "../AddWebsite/Adsense";
import DashboardKpi from "../../components/ecommerce/dashboardKpi";
import AddWebsite from "../AddWebsite/addwebsite";
import FilterPanel from "../../components/common/adsense/FilterPanel";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { useSearchParams } from "react-router";
import { fetchOfflineReports } from "../../features/adsense/adsenseReportsOfflineSlice";

function formatDate(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateRangeLabel(dateRange: string, start: Date | null, end: Date | null) {
  if (dateRange === "CUSTOM" && start && end) return `${formatDate(start)} → ${formatDate(end)}`;
  if (dateRange === "TODAY") return "Today";
  if (dateRange === "YESTERDAY") return "Yesterday";
  if (dateRange === "LAST_7_DAYS") return "Last 7 Days";
  if (dateRange === "LAST_30_DAYS") return "Last 30 Days";
  return dateRange;
}

export default function Home() {
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
  const { data } = useSelector((state: RootState) => state.reportsOffline);

  useEffect(() => {
    dispatch(fetchOfflineReports({ accountId }));
  }, [dispatch, accountId]);

  const [startDate, endDate] = range;

  // Combine all reports (TODAY + LAST_30_DAYS + CUSTOM)
  const combinedReports = data || [];

  // Flatten all rows
  const allRows = combinedReports.flatMap((report: any) => report.rows || []);
  const headers = combinedReports[0]?.headers || [];
  const allColumns = headers.map((h: any) => (typeof h === "string" ? h : h.name));

  // Safe: get header index
  const getHeaderIndex = (name: string) =>
    headers.findIndex((h: any) => (typeof h === "string" ? h : h.name) === name);

  const earningsIndex = getHeaderIndex("ESTIMATED_EARNINGS");
  const clicksIndex = getHeaderIndex("CLICKS");
  const pageViewsIndex = getHeaderIndex("PAGE_VIEWS");
  const impressionsIndex = getHeaderIndex("IMPRESSIONS");
  const datesIndex = getHeaderIndex("DATE");
  const siteIndex = getHeaderIndex("SITE");

  // Filter rows by date, site, country, and search query
  let filteredRows = allRows.filter(row => row.cells && row.cells.length > 0);

  const todayStr = formatDate(new Date());
  const yesterdayStr = formatDate(new Date(Date.now() - 86400000));
  const startStr = startDate ? formatDate(startDate) : null;
  const endStr = endDate ? formatDate(endDate) : null;

  filteredRows = filteredRows.filter(row => {
    const dateVal = row.cells[datesIndex]?.value || todayStr;

    // Date filter
    if (dateRange === "TODAY" && dateVal !== todayStr) return false;
    if (dateRange === "YESTERDAY" && dateVal !== yesterdayStr) return false;
    if (dateRange === "LAST_7_DAYS") {
      const last7 = formatDate(new Date(Date.now() - 6 * 86400000));
      if (dateVal < last7 || dateVal > todayStr) return false;
    }
    if (dateRange === "LAST_30_DAYS") {
      const last30 = formatDate(new Date(Date.now() - 29 * 86400000));
      if (dateVal < last30 || dateVal > todayStr) return false;
    }
    if (dateRange === "CUSTOM" && startStr && endStr && (dateVal < startStr || dateVal > endStr)) return false;

    // Site filter
    if (selectedSites.length > 0 && !selectedSites.includes(row.cells[siteIndex]?.value)) return false;
    if (siteQuery && !row.cells[siteIndex]?.value.toLowerCase().includes(siteQuery.toLowerCase())) return false;

    return true;
  });

  // Compute totals safely
  const totals = filteredRows.reduce(
    (acc, row) => {
      acc.earnings += Number(row.cells[earningsIndex]?.value || 0);
      acc.clicks += Number(row.cells[clicksIndex]?.value || 0);
      acc.pageViews += Number(row.cells[pageViewsIndex]?.value || 0);
      acc.impressions += Number(row.cells[impressionsIndex]?.value || 0);
      acc.ctr = acc.impressions > 0 ? (acc.clicks / acc.impressions) * 100 : 0;
      return acc;
    },
    { earnings: 0, clicks: 0, pageViews: 0, impressions: 0, ctr: 0 }
  );

  const uniqueSites = Array.from(new Set(allRows.map(row => row.cells[siteIndex]?.value).filter(Boolean))).sort();
  const countries = Array.from(new Set(allRows.map(row => row.cells[2]?.value).filter(Boolean))).sort();
  const toggleColumn = (col: string) => {
    setVisibleColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };
  return (
    <>
      <PageMeta title="Adsense Dashboard" description="Monitor AdSense and Ad Manager performance" />
      <div>
        <DashboardKpi />
        <AddWebsite />
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
    </>
  );
}

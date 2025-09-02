import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import AdSenseDashboard from "../AddWebsite/Adsense";
import DashboardKpi from "../../components/ecommerce/dashboardKpi";
import AddWebsite from "../AddWebsite/addwebsite";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchAllReports } from "../../features/adsense/adsenseReportsOfflineSlice";
import GlobalFilterPanel from "../../components/common/GlobalFilterPanel";
import ShowWebsites from "../AddWebsite/ShowWebsites";
import { fetchWebsites, deleteWebsite } from "../../features/Wbsite/websiteSlice";
import ReportListManager from "../../components/admanager/ReportListManager";

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

export default function Home() {
  const [selectedSite, setSelectedSiteId] = useState<string | null>(null);
  const defaultColumns = ["ESTIMATED_EARNINGS", "CLICKS", "PAGE_VIEWS", "IMPRESSIONS", "CTR"];
  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultColumns);
  const { websites } = useSelector((state: RootState) => state.websites);

  const [siteQuery, setSiteQuery] = useState("");
  const [selectedSites, setSelectedSites] = useState<string[]>([]); const [showSite, setShowSite] = useState(false);
  const [domainSearch, setDomainSearch] = useState("");

  const [dateRange, setDateRange] = useState("TODAY");
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
  const [country, setCountry] = useState<string[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.reportsOffline);

  useEffect(() => {
    dispatch(fetchAllReports());
    dispatch(fetchWebsites());
  }, [dispatch]);

  const [startDate, endDate] = range;

  // 🔹 Merge rows
  const todayReports = data.filter((r: any) => r.type === "TODAY");
  const customReports = data.filter((r: any) => r.type === "LAST_30_DAYS");
  const allRows = todayReports.flatMap((r: any) => r.rows);
  const allCustomRows = customReports.flatMap((r: any) => r.rows);
  const mergedRows = [...allRows, ...allCustomRows];

  // 🔹 Group rows by site
  const rowsBySite = mergedRows.reduce((acc: any, row: any) => {
    const site = row.cells[1]?.value.replace(/^https?:\/\/(www\.)?/, "").trim();
    if (!acc[site]) acc[site] = [];
    acc[site].push(row);
    return acc;
  }, {});

  const siteList = Object.keys(rowsBySite);

  // 🔹 Normalize selected site
  const normalizedSelected = selectedSite
    ? selectedSite.replace(/^https?:\/\/(www\.)?/, "").trim()
    : "";

  // 🔹 Filter rowsBySite for only added websites
  const filteredRowsBySite: Record<string, ReportRow[]> = {};
  const normalizedWebsites = websites.map(w =>
    w.url.trim().replace(/^https?:\/\/(www\.)?/, "")
  );
  Object.keys(rowsBySite).forEach(siteKey => {
    if (normalizedWebsites.includes(siteKey)) {
      filteredRowsBySite[siteKey] = rowsBySite[siteKey];
    }
  });

  // 🔹 Flatten all added sites rows
  let allAddedSiteRows = Object.values(filteredRowsBySite).flat();
  console.log(allAddedSiteRows, "allAddedSiteRows")
  // 🔹 If a specific site is selected
  if (normalizedSelected) {
    allAddedSiteRows = filteredRowsBySite[normalizedSelected] || [];
  }

  // 🔹 Date strings
  const todayStr = formatDate(new Date());
  const yesterdayStr = formatDate(new Date(Date.now() - 86400000));
  const startStr = startDate ? formatDate(startDate) : null;
  const endStr = endDate ? formatDate(endDate) : null;

  if (selectedSites.length > 0) {
    allAddedSiteRows = allAddedSiteRows.filter((row) => {
      const site = row.cells[1]?.value.replace(/^https?:\/\/(www\.)?/, "").trim();
      return selectedSites.includes(site);
    });
  }
  // 🔹 Apply date filtering
  let filteredRows: ReportRow[] = [...allAddedSiteRows];
  if (dateRange === "TODAY") {
    filteredRows = filteredRows.filter(row => row.cells[0]?.value === todayStr);
  } else if (dateRange === "YESTERDAY") {
    filteredRows = filteredRows.filter(row => row.cells[0]?.value === yesterdayStr);
  } else if (dateRange === "LAST_7_DAYS") {
    const last7 = formatDate(new Date(Date.now() - 6 * 86400000));
    filteredRows = filteredRows.filter(row => row.cells[0]?.value >= last7 && row.cells[0]?.value <= todayStr);
  } else if (dateRange === "LAST_30_DAYS") {
    const last30 = formatDate(new Date(Date.now() - 29 * 86400000));
    filteredRows = filteredRows.filter(row => row.cells[0]?.value >= last30 && row.cells[0]?.value <= todayStr);
  } else if (dateRange === "CUSTOM" && startStr && endStr) {
    filteredRows = filteredRows.filter(row => row.cells[0]?.value >= startStr && row.cells[0]?.value <= endStr);
  }

  // 🔹 Apply country filter
  const todayReport = data.find((r: any) => r.type === "TODAY") as Report | undefined;
  const last30Report = data.find((r: any) => r.type === "LAST_30_DAYS") as Report | undefined;
  const headers = todayReport?.headers || last30Report?.headers || [];

  function getHeaderIndex(headers: any[], name: string) {
    return headers.findIndex(h => (typeof h === "string" ? h : h.name) === name);
  }

  if (country.length > 0) {
    const countryIndex = getHeaderIndex(headers, "COUNTRY_NAME");
    filteredRows = filteredRows.filter(row => country.includes(row.cells[countryIndex]?.value));
  }

  // 🔹 Site search filter
  if (siteQuery.trim()) {
    const query = siteQuery.toLowerCase();
    filteredRows = filteredRows.filter(row => row.cells[1]?.value.toLowerCase().includes(query));
  }

  // 🔹 Columns & totals
  const allColumns = headers.map((h: any) => (typeof h === "string" ? h : h.name));

  useEffect(() => {
    if (headers.length > 0) {
      const headerNames = headers.map((h: any) => (typeof h === "string" ? h : h.name));
      const filteredDefault = defaultColumns.filter(col => headerNames.includes(col));
      setVisibleColumns(prev => [...new Set([...prev, ...filteredDefault])]);
    }
  }, [headers]);

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
      acc.cpcSum = acc.clicks > 0 ? acc.earnings / acc.clicks : 0;
      acc.ctr = acc.impressions > 0 ? (acc.clicks / acc.impressions) * 100 : 0;
      if (!acc.date && cells[datesIndex]?.value) acc.date = cells[datesIndex].value;
      return acc;
    },
    { earnings: 0, clicks: 0, pageViews: 0, impressions: 0, date: "", ctr: 0, cpcSum: 0 }
  );

  const uniqueSites = Array.from(
    new Set(websites.map(site => site.url).filter(Boolean))
  ).sort();

  const countries = Array.from(
    new Set(allRows.map(row => row.cells[2]?.value).filter(Boolean))
  ).sort();

  const toggleColumn = (col: string) => {
    setVisibleColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) {
      dispatch(deleteWebsite(id));
    }
  };

  return (
    <>
      <PageMeta title="Adsense Dashboard" description="Monitor AdSense and Ad Manager performance" />
      <div>
        <DashboardKpi totals={totals} />

        <AddWebsite websites={siteList} />

        <div className="mt-6">
          <ShowWebsites
            websites={websites}
            error={error || ""}
            onDelete={handleDelete}
          />
        </div>

        <GlobalFilterPanel
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4">
          {/* <ReportListManager
            rows={filtered}
            headers={[
              "Date",
              "Site",
              "Country",
              "Ad Exchange Impressions",
              "Ad Exchange Clicks",
              "Ad Exchange Revenue ($)",
              "Ad Exchange Average eCPM ($)",
              "Ad Exchange CTR (%)",
              "Ad Exchange CPC ($)",
            ]}
            dateRange={getDateRangeLabel(dateRange, start, end)}
            totals={{
              reportDate: derivedTotals.reportDate,
              adxExchangeLineItemLevelImpressions: derivedTotals.impressions,
              adxExchangeLineItemLevelClicks: derivedTotals.clicks,
              adxExchangeLineItemLevelRevenue: derivedTotals.revenue,
              adxExchangeLineItemLevelCtr: derivedTotals.ctr,
              adxExchangeLineItemLevelAverageECPM: derivedTotals.averageECPM,
              adxExchangeCostPerClick: derivedTotals.costPerClick,
            }}
          /> */}
          <p>Report List MAnager</p>
        </div>
      </div>
    </>
  );
}

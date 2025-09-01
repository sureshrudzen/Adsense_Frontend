import { useState, useMemo } from "react";
import Pagination from "../../components/common/Pagination";
import ExportPdfButton from "./ExportToPdf";

interface AdManagerRow {
  reportDate: string;
  adUnit: string;
  site: string;
  country: string;
  adxCostPerClick: number;
  adxLineItemClicks: number;
  adxLineItemImpressions: number;
  adxLineItemCtr: number;
  adServerAllRevenueGross: number;
  activeViewViewableRate: number;
  totalLineItemClicks: number;
  [key: string]: string | number; // Allow dynamic access to all fields
}

interface ReportListManagerProps {
  rows: AdManagerRow[];
  headers: string[];
  dateRange: string;
  totals?: Record<string, number>;
}

export default function ReportListManager({
  rows,
  headers,
  dateRange,
  totals,
}: ReportListManagerProps) {
  // State to track which columns are visible
  const [visibleColumns, setVisibleColumns] = useState<string[]>(headers.slice(4, 8));
  const isSiteVisible = visibleColumns.includes("Site");

  // Toggle column visibility
  const toggleColumn = (header: string) => {
    setVisibleColumns((prev) =>
      prev.includes(header) ? prev.filter((h) => h !== header) : [...prev, header]
    );
  };

  // Sorting
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "reportDate",
    direction: "asc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 30;
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  // Map headers to actual data keys
  const headerKeyMap: Record<string, string> = {
    Date: "reportDate",
    Site: "site",
    "Country": "country",
    "Ad Exchange Impressions": "adxExchangeLineItemLevelImpressions",
    "Ad Exchange Clicks": "adxExchangeLineItemLevelClicks",
    "Ad Exchange Revenue ($)": "adxExchangeLineItemLevelRevenue",
    "Ad Exchange Average eCPM ($)": "adxExchangeLineItemLevelAverageECPM",
    "Ad Exchange CTR (%)": "adxExchangeLineItemLevelCtr",
    "Ad Exchange CPC ($)": "adxExchangeCostPerClick",
  };

  const getKeyFromHeader = (header: string) => headerKeyMap[header] ?? header;

  // Sort rows
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const key = sortConfig.key;
      const aValue = a[key];
      const bValue = b[key];

      // Handle Date sorting specifically
      if (key === "reportDate" && typeof aValue === "string" && typeof bValue === "string") {
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();
        return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
      }

      // Handle numeric sorting for other fields
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Handle string sorting (if it's neither a date nor a number)
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0; // If the types don't match or aren't handled, return 0 (no sorting)
    });
  }, [rows, sortConfig]);

  // On clicking a header, update sortConfig to toggle the direction
  const handleSortClick = (header: string) => {
    const key = getKeyFromHeader(header);
    setSortConfig((prev) => {
      const isAsc = prev.key === key && prev.direction === "asc";
      return { key, direction: isAsc ? "desc" : "asc" };
    });
    setCurrentPage(1); // Reset to first page after sorting
  };

  // Paginate rows
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, currentPage]);

  // ✅ Export ke liye filteredRows = sortedRows (sab rows export karne ke liye)
  const filteredRows = sortedRows;

  // Formatting helpers
  function formatCurrencyValue(key: string, rawValue: number): string {
    const currencyKeys = [
      "adxExchangeLineItemLevelRevenue",
      "adxExchangeCostPerClick",
      "adxExchangeLineItemLevelAverageECPM",
    ];

    if (currencyKeys.includes(key) && typeof rawValue === "number") {
      const valueInDollars = rawValue / 1_000_000;
      return `$${formatNumber(valueInDollars)}`;
    }

    return formatNumber(rawValue);
  }

  function formatNumber(num: number): string {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toFixed(2);
  }

  function formatTotalValue(key: string, totals: Record<string, number>): string {
    const value = totals[key];

    if (key === "adxExchangeLineItemLevelAverageECPM") {
      const revenueMicros = totals["adxExchangeLineItemLevelRevenue"] || 0;
      const impressions = totals["adxExchangeLineItemLevelImpressions"] || 0;
      const revenueDollars = revenueMicros / 1_000_000;
      const eCPM = impressions > 0 ? (revenueDollars / impressions) * 1000 : 0;
      return `$${formatNumber(eCPM)}`;
    }

    if (key === "adxExchangeLineItemLevelCtr") {
      const clicks = totals["adxExchangeLineItemLevelClicks"] || 0;
      const impressions = totals["adxExchangeLineItemLevelImpressions"] || 0;
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      return `${ctr.toFixed(2)}%`;
    }

    if (key === "adxExchangeLineItemLevelRevenue") {
      return typeof value === "number" ? `$${formatNumber(value / 1_000_000)}` : "$0.00";
    }

    if (key === "adxExchangeCostPerClick") {
      const rawRevenue = totals["adxExchangeLineItemLevelRevenue"] || 0;
      const clicks = totals["adxExchangeLineItemLevelClicks"] || 0;
      const revenue = rawRevenue / 1_000_000;
      const cpc = clicks > 0 ? revenue / clicks : 0;
      return `$${formatNumber(cpc)}`;
    }

    if (key === "adxExchangeLineItemLevelImpressions" || key === "adxExchangeLineItemLevelClicks") {
      return typeof value === "number" ? value.toLocaleString() : "-";
    }

    if (typeof value === "number") {
      return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    return "-";
  }

  return (
    <div className="w-full max-w-[1182px] overflow-x-auto">
      <h4 className="text-md font-semibold text-gray-700 dark:text-white/80 mb-3">
        Detailed Ad Manager Reports ({dateRange})
      </h4>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          📊 Visible Metrics
        </h3>
        <div className="flex space-x-2">

          {/* <div className="mt-4">
          <ExportPdfButton
            headers={headers.filter((h) => visibleColumns.includes(h))}
            rows={filteredRows}
            totals={totals as any}
            title="Ad Manager Report"
            dateRangeLabel={dateRange}
            fileName={`admanager_${dateRange.toLowerCase()}.pdf`}
          />
        </div> */}
          <button
            type="button"
            onClick={() => setVisibleColumns([...headers])}
            className="text-sm px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700 transition"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={() => setVisibleColumns([])}
            className="text-sm px-3 py-1 rounded bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition"
          >
            Clear All
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-3 shadow-inner">
        {headers.map((col) => (
          <label
            key={col}
            className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-650 cursor-pointer transition-all duration-200 group"
          >
            <input
              type="checkbox"
              checked={visibleColumns.includes(col)}
              onChange={() => toggleColumn(col)}
              className="w-4 h-4 text-purple-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-purple-500 focus:ring-2 transition-colors"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              {col}
            </span>
            <div className="ml-auto">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-200 ${visibleColumns.includes(col)
                  ? "bg-green-500 shadow-lg shadow-green-200"
                  : "bg-gray-300"
                  }`}
              />

            </div>
          </label>
        ))}
      </div>
      {/* Table */}
      <div className="relative mt-4 overflow-x-auto rounded-xl border border-gray-200 shadow-sm max-w-full">
        <table className="min-w-[1000px] w-full border-collapse table-auto">

          <thead className="bg-gray-50 dark:bg-gray-800 top-0 z-10">
            <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-left">
              {headers
                .filter((header) => visibleColumns.includes(header))
                .map((header, i) => {
                  const key = getKeyFromHeader(header);
                  const isSorted = sortConfig.key === key;
                  return (
                    <th
                      key={i}
                      className="px-2 md:px-4 py-3 text-sm font-medium border cursor-pointer select-none max-w-[150px] break-words"
                      onClick={() => handleSortClick(header)} // Handling the click event here
                    >
                      {header}
                      {isSorted ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </th>
                  );
                })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {visibleColumns.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  Please select at least one column to view the report.
                </td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No data available for the selected page.
                </td>
              </tr>
            ) : (
              <>
                {isSiteVisible &&
                  paginatedRows.map((row, i) => (
                    <tr
                      key={i}
                      className={`transition-colors ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"} hover:bg-blue-50 dark:hover:bg-gray-700`}
                    >
                      {headers
                        .filter((header) => visibleColumns.includes(header))
                        .map((header, j) => {
                          const key = getKeyFromHeader(header);
                          const rawValue = row[key];
                          let displayValue = "-";

                          // Handle "reportDate"
                          if (key === "reportDate" && rawValue) {
                            displayValue = new Date(rawValue as string).toLocaleDateString();
                          } else if (key === "adxExchangeLineItemLevelCtr") {
                            const impressions = row["adxExchangeLineItemLevelImpressions"];
                            const clicks = row["adxExchangeLineItemLevelClicks"];
                            if (typeof impressions === "number" && impressions > 0 && typeof clicks === "number") {
                              const ctr = (clicks / impressions) * 100;
                              displayValue = ctr.toFixed(2) + "%";
                            } else {
                              displayValue = "0.00%";
                            }
                          } else if (
                            ["adxExchangeLineItemLevelRevenue", "adxExchangeCostPerClick", "adxExchangeLineItemLevelAverageECPM"].includes(key)
                          ) {
                            if (typeof rawValue === "number") {
                              displayValue = formatCurrencyValue(key, rawValue);
                            }
                          } else if (
                            ["adxExchangeLineItemLevelImpressions", "adxExchangeLineItemLevelClicks"].includes(key)
                          ) {
                            if (typeof rawValue === "number") {
                              displayValue = rawValue.toLocaleString();
                            }
                          } else if (typeof rawValue === "number") {
                            displayValue = rawValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          } else if (typeof rawValue === "string") {
                            displayValue = rawValue;
                          }

                          return (
                            <td
                              key={j}
                              className="px-2 md:px-4 py-2 text-sm border text-gray-700 dark:text-gray-300 whitespace-nowrap"
                            >
                              {displayValue}
                            </td>
                          );
                        })}
                    </tr>
                  ))}

                {/* Totals row */}
                {totals && (
                  <tr
                    className={`${isSiteVisible ? "bg-blue-100 dark:bg-blue-900 font-semibold" : "bg-white dark:bg-gray-900 font-normal"}`}
                  >
                    {headers.map((header, i) => {
                      if (!visibleColumns.includes(header)) return null;
                      const key = getKeyFromHeader(header);
                      let displayValue = "";

                      if (i === 0) {
                        displayValue = isSiteVisible
                          ? "TOTAL"
                          : totals.reportDate
                            ? new Date(totals.reportDate).toLocaleDateString()
                            : "-";
                      } else if (key === "reportDate") {
                        displayValue = "-";
                      } else {
                        displayValue = formatTotalValue(key, totals);
                      }

                      return (
                        <td
                          key={i}
                          className={`px-2 md:px-4 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap ${isSiteVisible ? "border border-blue-200" : "text-sm border"}`}
                        >
                          {displayValue}
                        </td>
                      );
                    })}
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}

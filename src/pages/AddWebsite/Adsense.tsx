import { useState, useMemo } from "react";
import Pagination from "../../components/common/Pagination";

interface AdSenseDashboardProps {
  visibleColumns: string[];
  rows: any[];
  headers: any[];
  dateRange: string;
  totals?: {
    earnings: number;
    clicks: number;
    pageViews: number;
    impressions: number;
    avgImpressionsCtr?: number;
    ctr?: number;
    date?: string;
    cpcSum?:Number;
  };
}


export default function AdSenseDashboard({
  rows,
  headers,
  dateRange,
  totals,
  visibleColumns,
}: AdSenseDashboardProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "DATE",
    direction: "asc",
  });
  const isSiteVisible = visibleColumns.includes("DOMAIN_NAME");
  const isCountryVisible = visibleColumns.includes("COUNTRY_NAME");
  //   console.log(isSiteVisible, "isSiteVisible")
  // console.log(rows,"rows")
  //   console.log(isCountryVisible, "isCountryVisible")
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 30;
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const sortedRows = useMemo(() => {
    const sortIndex = headers.findIndex((h) => h.name === sortConfig.key);
    if (sortIndex === -1) return rows;

    return [...rows].sort((a, b) => {
      const aValue = a.cells[sortIndex]?.value ?? "";
      const bValue = b.cells[sortIndex]?.value ?? "";

      // DATE sorting
      if (sortConfig.key === "DATE") {
        return sortConfig.direction === "asc"
          ? new Date(aValue).getTime() - new Date(bValue).getTime()
          : new Date(bValue).getTime() - new Date(aValue).getTime();
      }

      // Numeric sorting
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      const isNumeric = !isNaN(aNum) && !isNaN(bNum);

      if (isNumeric) {
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      // String sorting
      return sortConfig.direction === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [rows, sortConfig, headers]);
  const getSortedColumnValues = (columnName: string, direction: "asc" | "desc") => {
    const index = headers.findIndex(h => h.name === columnName);
    if (index === -1) return [];

    const values = rows.map(row => row.cells[index]?.value ?? "");

    // ✅ Only sort if this column is selected
    if (sortConfig.key !== columnName) {
      return values; // return default order
    }

    return [...values].sort((a, b) => {
      const aNum = Number(a);
      const bNum = Number(b);
      const isNumeric = !isNaN(aNum) && !isNaN(bNum);

      if (isNumeric) {
        return direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      return direction === "asc"
        ? String(a).localeCompare(String(b))
        : String(b).localeCompare(String(a));
    });
  };
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, currentPage]);

  const visibleHeaderInfo = useMemo(
    () =>
      headers
        .map((h: any, i: number) => ({ header: h, index: i }))
        .filter(({ header }) => header?.name && visibleColumns.includes(header.name)),
    [headers, visibleColumns]
  );
  const headerNameMap: Record<string, string> = {
    PAGE_VIEWS_CTR: "CTR",
    ESTIMATED_EARNINGS: "Earnings",
    IMPRESSIONS: "Impressions",
    CLICKS: "Clicks",
    PAGE_VIEWS: "Page View",
    DOMAIN_NAME: "Site",
    COUNTRY_NAME: "Country",
    DATE: "Date",
    COST_PER_CLICK: "CPC"
  };
  return (
    <div>
      <div className="mt-6 overflow-x-auto">
        <h4 className="text-md font-semibold text-gray-700 dark:text-white/80 mb-3">
          Detailed Report ({dateRange})
        </h4>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className="min-w-full table-fixed border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
              <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                {headers
                  .filter(h => h?.name && visibleColumns.includes(h.name))
                  .map((h) => (
                    <th
                      key={h.name}
                      className="px-4 py-3 text-left text-sm font-semibold cursor-pointer select-none border-r last:border-r-0"
                      onClick={() => {
                        setSortConfig(prev => ({
                          key: h.name,
                          direction: prev.key === h.name && prev.direction === "asc" ? "desc" : "asc"
                        }));
                      }}
                    >
                      {/* 👇 Agar map me hai to short name use karo otherwise original */}
                      {headerNameMap[h.name] ?? h.name}{" "}
                      {sortConfig.key === h.name ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </th>
                  ))}

              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isSiteVisible &&
                Array.from({ length: paginatedRows.length }).map((_, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`transition-colors ${rowIndex % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50 dark:bg-gray-800"
                      } hover:bg-blue-50 dark:hover:bg-gray-700`}
                  >
                    {headers
                      .filter(h => h?.name && visibleColumns?.includes(h.name))
                      .map((h) => {
                        const sortedValues = getSortedColumnValues(
                          h?.name,
                          sortConfig.key === h?.name ? sortConfig.direction : "asc"
                        );

                        let clickValue = 0;
                        let impressionValue = 0;

                        const clickHeader = headers.find(header => header?.name === "CLICKS");
                        const impressionHeader = headers.find(header => header?.name === "IMPRESSIONS");

                        if (clickHeader) {
                          clickValue = getSortedColumnValues(
                            clickHeader?.name,
                            sortConfig.key === clickHeader?.name ? sortConfig.direction : "asc"
                          )[rowIndex];
                        }

                        if (impressionHeader) {
                          impressionValue = getSortedColumnValues(
                            impressionHeader?.name,
                            sortConfig.key === impressionHeader?.name ? sortConfig.direction : "asc"
                          )[rowIndex];
                        }

                        const cellValue =
                          h?.name === "PAGE_VIEWS_CTR"
                            ? impressionValue !== 0
                              ? (clickValue / impressionValue) * 100
                              : 0
                            : sortedValues[rowIndex];

                        const formattedCellValue = isNaN(cellValue) ? cellValue : Number(cellValue);

                        const finalCellValue =
                          typeof formattedCellValue === "number" && !isNaN(formattedCellValue)
                            ? formattedCellValue.toFixed(2)
                            : formattedCellValue;

                        return (
                          <td
                            key={`${rowIndex}-${h?.name}`}
                            className={`px-4 py-2 text-sm border-r last:border-r-0 text-gray-700 dark:text-gray-300 ${sortConfig.key === h?.name
                              ? "bg-yellow-50 dark:bg-yellow-900 font-semibold"
                              : ""
                              }`}
                          >
                            {h?.name === "ESTIMATED_EARNINGS"
                              ? `$${finalCellValue}`
                              : h?.name === "PAGE_VIEWS_CTR"
                                ? `${finalCellValue}%`
                                : finalCellValue}
                          </td>
                        );
                      })}
                  </tr>
                ))
              }


              {/* Totals Row */}
              {totals && (
                <tr className={`${isSiteVisible
                  ? "bg-blue-100 dark:bg-blue-900 font-semibold"
                  : "bg-white dark:bg-gray-900 font-normal"
                  }`}
                >
                  {visibleHeaderInfo.map(({ header, index }) => {
                    const key = typeof header === "string" ? header : header.name;
                    let value = "";

                    switch (key) {
                      case "ESTIMATED_EARNINGS":
                        value = `$${totals.earnings.toLocaleString()}`;
                        break;
                      case "CLICKS":
                        value = totals.clicks.toLocaleString();
                        break;
                      case "PAGE_VIEWS":
                        value = totals.pageViews.toLocaleString();
                        break;
                      case "IMPRESSIONS":
                        value = totals.impressions.toLocaleString();
                        break;
                      case "IMPRESSIONS_CTR":
                        value = totals.impressions && totals.pageViews
                          ? ((totals.impressions / totals.pageViews) * 100).toFixed(2) + "%"
                          : "0.00%";
                        break;
                      case "PAGE_VIEWS_CTR":
                        value = totals.ctr ? totals.ctr.toFixed(2) + "%" : "0.00%";
                        break;
                      case "COST_PER_CLICK":
                        value = totals.cpcSum ? `$${totals.cpcSum.toFixed(2)}` : "$0.00"; // <-- CPC added
                        break;
                      case "DATE":
                      case "day":
                        if (isSiteVisible) {
                          value = "TOTAL";
                        } else if (totals.date) {
                          value = new Date(totals.date).toLocaleDateString();
                        } else {
                          value = "-";
                        }
                        break;
                      default:
                        if (index === 0) value = "TOTAL";
                        break;
                    }

                    return (
                      <td
                        key={`total-${index}`}
                        className="px-4 py-2 text-sm border border-blue-200 text-gray-700 dark:text-gray-300"
                      >
                        {value}
                      </td>
                    );
                  })}

                  {visibleColumns.includes("IMPRESSIONS_CTR") && (
                    <td
                      className="px-4 py-2 text-sm border border-blue-200 text-gray-700 dark:text-gray-300"
                    >
                      {totals.impressions && totals.pageViews
                        ? ((totals.impressions / totals.pageViews) * 100).toFixed(2) + "%"
                        : "0.00%"}
                    </td>
                  )}
                </tr>
              )}

            </tbody>

          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

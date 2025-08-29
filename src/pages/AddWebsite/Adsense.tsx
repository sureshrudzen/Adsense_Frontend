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
  };
}

export default function AdSenseDashboard({
  rows,
  headers,
  dateRange,
  totals,
  visibleColumns,
}: AdSenseDashboardProps) {
  // 🔹 Sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "DATE",
    direction: "asc",
  });

  // 🔹 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 30;
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  // 🔹 Sorted rows
  const sortedRows = useMemo(() => {
    const index = headers.findIndex((h) => (h.name || h) === sortConfig.key);
    if (index === -1) return rows;

    return [...rows].sort((a, b) => {
      const aValue = a.cells[index]?.value;
      const bValue = b.cells[index]?.value;

      if (sortConfig.key === "DATE") {
        return sortConfig.direction === "asc"
          ? new Date(aValue).getTime() - new Date(bValue).getTime()
          : new Date(bValue).getTime() - new Date(aValue).getTime();
      }

      return sortConfig.direction === "asc"
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });
  }, [rows, sortConfig, headers]);

  // 🔹 Paginated rows
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, currentPage]);

  // 🔹 Get visible header info
  const visibleHeaderInfo = useMemo(
    () =>
      headers
        .map((h: any, i: number) => ({ header: h, index: i }))
        .filter(({ header }) => visibleColumns.includes(header.name || header)),
    [headers, visibleColumns]
  );

  return (
    <div>
      <div className="mt-6 overflow-x-auto">
        <h4 className="text-md font-semibold text-gray-700 dark:text-white/80 mb-3">
          Detailed Report ({dateRange})
        </h4>

        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full border-collapse table-fixed">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-left">
                {visibleHeaderInfo.map(({ header, index }) => {
                  const headerName = header.name || header;
                  const isSorted = sortConfig.key === headerName;

                  return (
                    <th
                      key={headerName}
                      className="px-4 text-left py-3 border text-sm font-medium cursor-pointer select-none"
                      onClick={() => {
                        setSortConfig({
                          key: headerName,
                          direction:
                            isSorted && sortConfig.direction === "asc"
                              ? "desc"
                              : "asc",
                        });
                        setCurrentPage(1);
                      }}
                    >
                      {headerName} {isSorted ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row: any, i: number) => (
                  <tr
                    key={i}
                    className={`transition-colors ${
                      i % 2 === 0
                        ? "bg-white dark:bg-gray-900"
                        : "bg-gray-50 dark:bg-gray-800"
                    } hover:bg-blue-50 dark:hover:bg-gray-700`}
                  >
                    {visibleHeaderInfo.map(({ index }) => {
                      const cell = row.cells[index];
                      const headerName = headers[index]?.name || headers[index];
                      return (
                        <td
                          key={`${i}-${index}`}
                          className="px-4 py-2 text-sm border text-gray-700 dark:text-gray-300"
                        >
                          {headerName === "ESTIMATED_EARNINGS"
                            ? `$${cell?.value}`
                            : cell?.value}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={visibleHeaderInfo.length}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    No data for {dateRange}
                  </td>
                </tr>
              )}

              {/* 🔹 Totals Row */}
              {totals && (
                <tr className="bg-blue-100 dark:bg-blue-900 font-semibold">
                  {visibleHeaderInfo.map(({ header, index }) => {
                    const key = header.name || header;
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
                      default:
                        if (key === "DATE" || index === 0) value = "TOTAL";
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
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🔹 Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

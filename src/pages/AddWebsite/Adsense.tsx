import { useState, useMemo } from "react";
import Pagination from "../../components/common/Pagination";

interface AdSenseDashboardProps {
  rows: any[];
  headers: any[];
  dateRange: string;
  totals?: any; // totals object {earnings, clicks, pageViews, impressions}
}

export default function AdSenseDashboard({ rows, headers, dateRange, totals }: AdSenseDashboardProps) {
  // 🔹 Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "DATE",
    direction: "asc",
  });

  // 🔹 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 30; // Customize rows per page
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  // 🔹 Sorted rows
  const sortedRows = useMemo(() => {
    if (!sortConfig) return rows;

    const index = headers.findIndex((h) => (h.name || h) === sortConfig.key);
    if (index === -1) return rows;

    return [...rows].sort((a, b) => {
      const aValue = a.cells[index]?.value;
      const bValue = b.cells[index]?.value;

      if (sortConfig.key === "DATE") {
        const dateA = new Date(aValue).getTime();
        const dateB = new Date(bValue).getTime();
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      return sortConfig.direction === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
    });
  }, [rows, sortConfig, headers]);

  // 🔹 Paginated rows
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, currentPage]);

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
                {headers?.map((h: any, i: number) => {
                  const headerName = h.name || h;
                  const isSorted = sortConfig.key === headerName;
                  return (
                    <th
                      key={i}
                      className="px-4 text-left py-3 border text-sm font-medium cursor-pointer select-none"
                      onClick={() => {
                        if (isSorted) {
                          setSortConfig({
                            key: headerName,
                            direction: sortConfig.direction === "asc" ? "desc" : "asc",
                          });
                        } else {
                          setSortConfig({ key: headerName, direction: "asc" });
                        }
                        setCurrentPage(1); // Reset to first page on sort
                      }}
                    >
                      {headerName} {isSorted ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginatedRows?.length > 0 ? (
                paginatedRows.map((row: any, i: number) => (
                  <tr
                    key={i}
                    className={`transition-colors ${
                      i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"
                    } hover:bg-blue-50 dark:hover:bg-gray-700`}
                  >
                    {row.cells?.map((cell: any, j: number) => {
                      const headerName = headers[j]?.name || headers[j];
                      return (
                        <td
                          key={j}
                          className="px-4 py-2 text-sm border text-gray-700 dark:text-gray-300"
                        >
                          {headerName === "ESTIMATED_EARNINGS" ? `$${cell.value}` : cell.value}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={headers?.length}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    No data for {dateRange}
                  </td>
                </tr>
              )}

              {totals && (
                <tr className="bg-blue-100 dark:bg-blue-900 font-semibold">
                  <td className="px-4 py-2 text-sm border border-blue-200 text-gray-700 dark:text-gray-300">
                    TOTAL
                  </td>
                  <td className="px-4 py-2 text-sm border border-blue-200 text-gray-700 dark:text-gray-300">
                    ${totals.earnings.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm border border-blue-200 text-gray-700 dark:text-gray-300">
                    {totals.clicks.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm border border-blue-200 text-gray-700 dark:text-gray-300">
                    {totals.pageViews.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm border border-blue-200 text-gray-700 dark:text-gray-300">
                    {totals.impressions.toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🔹 Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>
    </div>
  );
}

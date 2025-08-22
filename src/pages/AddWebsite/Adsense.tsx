import "react-datepicker/dist/react-datepicker.css";
import ReportViewer from "./ReportViewer";
import { useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

interface AdSenseDashboardProps {
  rows: any[];
  headers: any[];
  dateRange: string;
  totals?: any;   // 👈 totals add kiya
}

export default function AdSenseDashboard({ rows, headers, dateRange, totals }: AdSenseDashboardProps) {
  const query = useQuery();
  const accountId = query.get("account");

  return (
    <div>
      <div>
        {/* ReportViewer (agar accountId hai to still show karna hai) */}
        {accountId ? (
          <ReportViewer accountId={accountId} />
        ) : (
          <p>Loading accounts...</p>
        )}
      </div>

      {/* ✅ Props-based Report Table */}
      <div className="mt-6 overflow-x-auto">
        <h4 className="text-md font-semibold text-gray-700 dark:text-white/80 mb-3">
          Detailed Report ({dateRange})
        </h4>
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
              <tr>
                {headers.map((h: any, i: number) => (
                  <th
                    key={i}
                    className="px-4 text-left py-3 border text-sm font-medium text-gray-600 dark:text-gray-300"
                  >
                    {h.name || h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {/* ✅ Rows */}
              {rows.length > 0 ? (
                rows.map((row: any, i: number) => (
                  <tr
                    key={i}
                    className={`transition-colors ${i % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50 dark:bg-gray-800"
                      } hover:bg-blue-50 dark:hover:bg-gray-700`}
                  >
                    {row.cells?.map((cell: any, j: number) => {
                      const headerName = headers[j]?.name || headers[j]; // 👈 Column ka naam

                      return (
                        <td
                          key={j}
                          className="px-4 py-2 text-sm border text-gray-700 dark:text-gray-300"
                        >
                          {headerName === "ESTIMATED_EARNINGS"
                            ? `$${cell.value}` // 👈 Earnings me hi $
                            : cell.value}
                        </td>
                      );
                    })}

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    No data for {dateRange}
                  </td>
                </tr>
              )}
              {totals && (
                <tr className="bg-blue-100 dark:bg-blue-900 border  font-semibold">
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
      </div>
    </div>
  );
}

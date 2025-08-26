import { useState, useMemo } from "react";
import Pagination from "../../components/common/Pagination";

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
        // "Ad Unit": "adUnit",
        Site: "site",
        Country: "country",
        adxCostPerClick: "adxCostPerClick",
        adxLineItemClicks: "adxLineItemClicks",
        adxLineItemImpressions: "adxLineItemImpressions",
        adxLineItemCtr: "adxLineItemCtr",
        adServerAllRevenueGross: "adServerAllRevenueGross",
        activeViewViewableRate: "activeViewViewableRate",
        totalLineItemClicks: "totalLineItemClicks",
    };

    // Helper to get data key from header
    const getKeyFromHeader = (header: string) => headerKeyMap[header] ?? header;

    // Sort rows based on sortConfig
    const sortedRows = useMemo(() => {
        return [...rows].sort((a, b) => {
            const key = sortConfig.key;
            const aValue = a[key];
            const bValue = b[key];

            // Sort dates
            if (
                key === "reportDate" &&
                typeof aValue === "string" &&
                typeof bValue === "string"
            ) {
                return sortConfig.direction === "asc"
                    ? new Date(aValue).getTime() - new Date(bValue).getTime()
                    : new Date(bValue).getTime() - new Date(aValue).getTime();
            }

            // Sort numbers or fallback
            return sortConfig.direction === "asc"
                ? Number(aValue) - Number(bValue)
                : Number(bValue) - Number(aValue);
        });
    }, [rows, sortConfig]);

    // Paginate rows
    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return sortedRows.slice(start, start + rowsPerPage);
    }, [sortedRows, currentPage]);

    // Render cell values with formatting
    const getCellValue = (row: AdManagerRow, header: string) => {
        const key = getKeyFromHeader(header);
        const value = row[key];

        if (key === "reportDate" && typeof value === "string") {
            return new Date(value).toLocaleDateString();
        }

        if (typeof value === "number") {
            return Number.isFinite(value) ? value.toLocaleString() : "-";
        }

        return value ?? "-";
    };

    return (
        <div className="mt-6 w-full max-w-full overflow-x-auto">
            <h4 className="text-md font-semibold text-gray-700 dark:text-white/80 mb-3">
                Detailed Ad Manager Reports ({dateRange})
            </h4>

            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-[1200px] border-collapse table-fixed w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                        <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-left">
                            {headers.map((header, i) => {
                                const key = getKeyFromHeader(header);
                                const isSorted = sortConfig.key === key;
                                return (
                                    <th
                                        key={i}
                                        className="px-2 md:px-4 py-3 text-sm font-medium border cursor-pointer select-none max-w-[150px] break-words"
                                        onClick={() => {
                                            setSortConfig({
                                                key,
                                                direction:
                                                    isSorted && sortConfig.direction === "asc" ? "desc" : "asc",
                                            });
                                            setCurrentPage(1);
                                        }}
                                    >
                                        {header} {isSorted ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                                    </th>

                                );
                            })}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {paginatedRows.length > 0 ? (
                            paginatedRows.map((row, i) => (
                                <tr
                                    key={i}
                                    className={`transition-colors ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"
                                        } hover:bg-blue-50 dark:hover:bg-gray-700`}
                                >
                                    {headers.map((header, j) => (
                                        <td
                                            key={j}
                                            className="px-2 md:px-4 py-2 text-sm border text-gray-700 dark:text-gray-300 whitespace-nowrap"
                                        >
                                            {getCellValue(row, header)}
                                        </td>
                                    ))}
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

                        {/* Totals Row */}
                        {totals && (
                            <tr className="bg-blue-100 dark:bg-blue-900 font-semibold">
                                {headers.map((header, i) => {
                                    const key = getKeyFromHeader(header);
                                    const totalValue = totals[key];
                                    return (
                                        <td
                                            key={i}
                                            className="px-2 md:px-4 py-2 border border-blue-200 text-gray-700 dark:text-gray-300 whitespace-nowrap"
                                        >
                                            {i === 0
                                                ? "TOTAL"
                                                : typeof totalValue === "number"
                                                    ? totalValue.toLocaleString()
                                                    : ""}
                                        </td>
                                    );
                                })}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
            />
        </div>

    );
}

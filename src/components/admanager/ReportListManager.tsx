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


    console.log(totals, "totals")

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
        "Ad Exchange Impressions": "adxExchangeLineItemLevelImpressions",
        "Ad Exchange Clicks": "adxExchangeLineItemLevelClicks",
        "Ad Exchange Revenue ($)": "adxExchangeLineItemLevelRevenue",
        "Ad Exchange eCPM ($)": "adxExchangeLineItemLevelAverageECPM",
        "Ad Exchange CTR (%)": "adxExchangeLineItemLevelCtr",
        "Ad Exchange CPC ($)": "adxExchangeCostPerClick",
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

    return (
        <div className="mt-6 w-full max-w-[1182px] overflow-x-auto">

            <h4 className="text-md font-semibold text-gray-700 dark:text-white/80 mb-3">
                Detailed Ad Manager Reports ({dateRange})
            </h4>
            <div className="relative overflow-x-auto rounded-xl border border-gray-200 shadow-sm max-w-full">
                <table className="min-w-[1000px] w-full border-collapse table-auto">
                    <thead className="bg-gray-50 dark:bg-gray-800 top-0 z-10">
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
                        {paginatedRows.map((row, i) => (
                            <tr
                                key={i}
                                className={`transition-colors ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"
                                    } hover:bg-blue-50 dark:hover:bg-gray-700`}
                            >
                                {headers.map((header, j) => {
                                    const key = getKeyFromHeader(header);

                                    // raw data
                                    const rawValue = row[key];

                                    let displayValue = "-";

                                    // Format Date
                                    if (key === "reportDate" && rawValue) {
                                        displayValue = new Date(rawValue).toLocaleDateString();
                                    }
                                    // Calculate CTR dynamically
                                    else if (key === "adxExchangeLineItemLevelCtr") {
                                        const impressions = row["adxExchangeLineItemLevelImpressions"];
                                        const clicks = row["adxExchangeLineItemLevelClicks"];

                                        if (
                                            typeof impressions === "number" &&
                                            impressions > 0 &&
                                            typeof clicks === "number"
                                        ) {
                                            const ctr = (clicks / impressions) * 100;
                                            displayValue = ctr.toFixed(2) + "%";
                                        } else {
                                            displayValue = "0.00%";
                                        }
                                    }
                                    // Calculate and format eCPM dynamically
                                    else if (key === "adxExchangeLineItemLevelAverageECPM") {
                                        const revenue = row["adxExchangeLineItemLevelRevenue"];
                                        const impressions = row["adxExchangeLineItemLevelImpressions"];
                                        if (
                                            typeof revenue === "number" &&
                                            typeof impressions === "number" &&
                                            impressions > 0
                                        ) {
                                            const eCPM = (revenue / impressions) * 1000;
                                            displayValue = `$${eCPM.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}`;
                                        } else {
                                            displayValue = "$0.00";
                                        }
                                    }
                                    // Format currency fields (revenue, CPC) properly
                                    else if (
                                        ["adxExchangeLineItemLevelRevenue", "adxExchangeCostPerClick"].includes(
                                            key
                                        )
                                    ) {
                                        if (typeof rawValue === "number") {
                                            displayValue = `$${rawValue.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}`;
                                        }
                                    }
                                    // Format impressions, clicks as integer with commas
                                    else if (
                                        ["adxExchangeLineItemLevelImpressions", "adxExchangeLineItemLevelClicks"].includes(
                                            key
                                        )
                                    ) {
                                        if (typeof rawValue === "number") {
                                            displayValue = rawValue.toLocaleString();
                                        }
                                    }
                                    // Other numbers fallback
                                    else if (typeof rawValue === "number") {
                                        displayValue = rawValue.toString();
                                    }
                                    // Strings fallback
                                    else if (typeof rawValue === "string") {
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

                        {totals && (
                            <tr className="bg-blue-100 dark:bg-blue-900 font-semibold">
                                {headers.map((header, i) => {
                                    const key = getKeyFromHeader(header);
                                    const totalValue = totals[key];

                                    let displayValue = "";

                                    if (i === 0) {
                                        displayValue = "TOTAL";
                                    }
                                    // Calculate total eCPM = (totalRevenue / totalImpressions) * 1000
                                    else if (key === "adxExchangeLineItemLevelAverageECPM") {
                                        const totalRevenue = totals["adxExchangeLineItemLevelRevenue"] || 0;
                                        const totalImpressions = totals["adxExchangeLineItemLevelImpressions"] || 0;
                                        if (totalImpressions > 0) {
                                            const totalECPM = (totalRevenue / totalImpressions) * 1000;
                                            displayValue = `$${totalECPM.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}`;
                                        } else {
                                            displayValue = "$0.00";
                                        }
                                    }
                                    // Format total revenue, CPC with $ and decimals
                                    else if (
                                        ["adxExchangeLineItemLevelRevenue", "adxExchangeCostPerClick"].includes(key)
                                    ) {
                                        displayValue = totalValue
                                            ? `$${totalValue.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}`
                                            : "-";
                                    }
                                    // Format total impressions, clicks with commas
                                    else if (
                                        ["adxExchangeLineItemLevelImpressions", "adxExchangeLineItemLevelClicks"].includes(
                                            key
                                        )
                                    ) {
                                        displayValue = totalValue ? totalValue.toLocaleString() : "-";
                                    }
                                    // Calculate total CTR = (totalClicks / totalImpressions) * 100
                                    else if (key === "adxExchangeLineItemLevelCtr") {
                                        const totalClicks = totals["adxExchangeLineItemLevelClicks"] || 0;
                                        const totalImpressions = totals["adxExchangeLineItemLevelImpressions"] || 0;
                                        if (totalImpressions > 0) {
                                            displayValue = ((totalClicks / totalImpressions) * 100).toFixed(2) + "%";
                                        } else {
                                            displayValue = "0.00%";
                                        }
                                    } else if (typeof totalValue === "number") {
                                        displayValue = totalValue.toString();
                                    }

                                    return (
                                        <td
                                            key={i}
                                            className="px-2 md:px-4 py-2 border border-blue-200 text-gray-700 dark:text-gray-300 whitespace-nowrap"
                                        >
                                            {displayValue}
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

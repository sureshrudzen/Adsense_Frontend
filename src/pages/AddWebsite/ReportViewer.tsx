import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../utils/api";

export default function ReportViewer({ accountId }: { accountId: string }) {
    const [dateRange, setDateRange] = useState("LAST_7_DAYS");
    const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
    const [startDate, endDate] = range;
    const [country, setCountry] = useState("");
    const [report, setReport] = useState<any>(null);

    const [sites, setSites] = useState<AdsenseSite[]>([]);
    const [loadingSites, setLoadingSites] = useState<boolean>(false);
    const [selectedSite, setSelectedSite] = useState<string>("");
    const [error, setError] = useState<string>("");

    interface AdsenseSite {
        name: string;   // "accounts/xxx/sites/abc.com"
        domain: string; // "abc.com"
        state: string;  // APPROVED / PENDING / REQUIRES_REVIEW
    }

    // ✅ Fetch Sites
    const fetchSites = async (accountId: string) => {
        setLoadingSites(true);
        try {
            const res = await api.get("/adsense/sites", {
                params: { accountId },
                withCredentials: true,
            });
            setSites(res.data.sites || []);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch sites");
        } finally {
            setLoadingSites(false);
        }
    };

    // ✅ Fetch Report
    const fetchReport = async () => {
        try {
            const res = await api.get(`/adsense/report`, {
                params: {
                    accountId,
                    dateRange,
                    dimensions: ["DATE"],
                    metrics: ["ESTIMATED_EARNINGS", "CLICKS", "PAGE_VIEWS", "IMPRESSIONS"],
                    filters: [
                        selectedSite ? `DOMAIN_NAME==${selectedSite}` : null,
                        country ? `COUNTRY_NAME==${country}` : null,
                    ].filter(Boolean),
                    startDate: dateRange === "CUSTOM" ? startDate?.toISOString().split("T")[0] : undefined,
                    endDate: dateRange === "CUSTOM" ? endDate?.toISOString().split("T")[0] : undefined,
                },
                withCredentials: true,
            });

            const { headers, rows, totals, averages, totalMatchedRows } = res.data;
            setReport({
                headers,
                rows,
                totals,
                averages,
                totalMatchedRows,
            });
        } catch (err: any) {
            console.error("Error fetching filtered report", err);
        }
    };

    // ✅ On load → get sites + report
    useEffect(() => {
        if (accountId) {
            fetchSites(accountId);
            fetchReport();
        }
    }, [accountId]);

    // ✅ Refetch report on filters
    useEffect(() => {
        if (accountId) {
            fetchReport();
        }
    }, [dateRange, startDate, endDate, country, selectedSite]);

    return (
        <div className="p-4 border rounded-lg shadow-md bg-white">
            <h2 className="text-xl font-semibold mb-4">AdSense Report</h2>

            {/* Filters */}
            <div className="space-y-4 md:flex md:space-y-0 md:space-x-4">
                {/* Date Range Dropdown */}
                <div className="flex-1">
                    <label className="block text-sm font-medium">Date Range</label>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="border p-2 rounded w-full"
                    >
                        <option value="TODAY">Today</option>
                        <option value="YESTERDAY">Yesterday</option>
                        <option value="LAST_7_DAYS">Last 7 days</option>
                        <option value="LAST_30_DAYS">Last 30 days</option>
                        <option value="THIS_MONTH">This month</option>
                        <option value="LAST_MONTH">Last month</option>
                        <option value="CUSTOM">Custom</option>
                    </select>
                </div>

                {/* Custom Date Picker */}
                {dateRange === "CUSTOM" && (
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Select Range</label>
                        <DatePicker
                            selectsRange
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => setRange(update as [Date | null, Date | null])}
                            isClearable
                            className="border p-2 rounded w-full"
                        />
                    </div>
                )}

                {/* Country Dropdown */}
                <div className="flex-1">
                    <label className="block text-sm font-medium">Country</label>
                    <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="border p-2 rounded w-full"
                    >
                        <option value="">All</option>
                        <option value="IN">India</option>
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                    </select>
                </div>
            </div>

            {/* ✅ Sites List */}
            <div className="mt-6">
                <h3 className="font-semibold">Registered Sites</h3>
                {loadingSites ? (
                    <p>Loading sites...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : sites.length === 0 ? (
                    <p className="text-gray-500">No sites found in AdSense</p>
                ) : (
                    <table className="w-full border border-gray-300 rounded-lg mt-2">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-2 border">Domain</th>
                                <th className="p-2 border">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sites.map((site) => (
                                <tr
                                    key={site.name}
                                    className={`cursor-pointer hover:bg-blue-50 ${selectedSite === site.domain ? "bg-blue-100" : ""
                                        }`}
                                    onClick={() => setSelectedSite(site.domain)}
                                >
                                    <td className="p-2 border">{site.domain}</td>
                                    <td className="p-2 border">{site.state}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ✅ Report Table */}
            {report ? (
                <div className="mt-6 overflow-x-auto">
                    <h4 className="mb-2 font-semibold">
                        {selectedSite ? `Report for ${selectedSite}` : "Overall Report"}
                    </h4>
                    <table className="min-w-full border">
                        <thead className="bg-gray-100">
                            <tr>
                                {report.headers.map((h: string, i: number) => (
                                    <th key={i} className="px-4 py-2 border text-left">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {report.rows.map((row: string[], i: number) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    {row.map((cell: string, j: number) => (
                                        <td key={j} className="px-4 py-2 border">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            {/* ✅ Totals Row */}
                            {report.totals && (
                                <tr className="bg-blue-100 font-semibold">
                                    {report.totals.map((total: string, i: number) => (
                                        <td key={i} className="px-4 py-2 border">
                                            {i === 0 ? "TOTAL" : total}
                                        </td>
                                    ))}
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="mt-4 text-gray-600">Loading report...</p>
            )}

        </div>
    );
}

import React, { useState, useEffect, useMemo } from "react";
import {
    ArrowDownIcon,
    ArrowUpIcon,
    DollarLineIcon,
    EyeIcon,
    MailIcon,
    TableIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchReport } from "../../features/adManager/reportAdManagerSlice";
import { useSearchParams } from "react-router-dom";
import ReportListManager from "./ReportListManager";

// Date formatting helper
function formatDate(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
    ).padStart(2, "0")}`;
}

// Date range label helper
function getDateRangeLabel(range: string, start: Date | null, end: Date | null) {
    if (range === "CUSTOM" && start && end) return `${formatDate(start)} → ${formatDate(end)}`;
    const map: Record<string, string> = {
        ALL: "All Dates",
        TODAY: "Today",
        YESTERDAY: "Yesterday",
        LAST_7_DAYS: "Last 7 Days",
        LAST_30_DAYS: "Last 30 Days",
    };
    return map[range] ?? range;
}

// Metric display card
function MetricCard({
    title,
    value,
    Icon,
    trend,
}: {
    title: string;
    value: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    trend: "up" | "down";
}) {
    return (
        <div className="rounded-2xl border p-5 bg-white dark:bg-gray-800">
            <Icon className="w-6 h-6 text-gray-700 dark:text-white" />
            <div className="mt-2 flex justify-between items-end">
                <div>
                    <div className="text-sm text-gray-500">{title}</div>
                    <div className="font-bold text-lg">{value}</div>
                </div>
                <Badge color={trend === "up" ? "success" : "error"}>
                    {trend === "up" ? <ArrowUpIcon /> : <ArrowDownIcon />}
                </Badge>
            </div>
        </div>
    );
}

export default function MainLayoutManager() {
    const [searchParams] = useSearchParams();
    const networkId = searchParams.get("networkId") || "";
    const dispatch = useDispatch<AppDispatch>();
    const { data, error } = useSelector((state: RootState) => state.admanagerReport);

    const [dateRange, setDateRange] = useState("TODAY");
    const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
    const [country, setCountry] = useState("");
    const [showCountry, setShowCountry] = useState(false);
    const [site, setSite] = useState("");
    const [showSite, setShowSite] = useState(false);

    const [start, end] = range;

    useEffect(() => {
        if (networkId) {
            dispatch(fetchReport({ networkId, dateRange }));
        }
    }, [dispatch, networkId, dateRange]);

    const rows = data?.rows || [];
    const uniqueCountries = Array.from(new Set(rows.map((r) => r.country))).filter(Boolean);
    const uniqueSites = Array.from(new Set(rows.map((r) => r.site))).filter(Boolean);

    const normalize = (d: Date) => new Date(d.setHours(0, 0, 0, 0));
    const today = normalize(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const last7 = new Date(today);
    last7.setDate(today.getDate() - 6);
    const last30 = new Date(today);
    last30.setDate(today.getDate() - 29);

    const filtered = useMemo(() => {
        if (dateRange === "ALL" || dateRange === "CUSTOM") {
            return rows.filter((r) => {
                const d = normalize(new Date(r.reportDate));
                let inRange = true;
                if (dateRange === "CUSTOM" && start && end) {
                    inRange = d >= normalize(start) && d <= normalize(end);
                }
                const matchCountry = country
                    ? r.country?.toLowerCase() === country.toLowerCase()
                    : true;
                const matchSite = site ? r.site?.toLowerCase() === site.toLowerCase() : true;
                return inRange && matchCountry && matchSite;
            });
        }

        // For fixed dateRange values, backend returns filtered data by date; only filter country/site here
        return rows.filter((r) => {
            const matchCountry = country
                ? r.country?.toLowerCase() === country.toLowerCase()
                : true;
            const matchSite = site ? r.site?.toLowerCase() === site.toLowerCase() : true;
            return matchCountry && matchSite;
        });
    }, [rows, dateRange, start, end, country, site]);

    // Calculate totals from filtered data
    const totals = filtered.reduce(
        (acc, r) => {
            const impressions = r.adxExchangeLineItemLevelImpressions ?? 0;
            const clicks = r.adxExchangeLineItemLevelClicks ?? 0;
            const revenue = r.adxExchangeLineItemLevelRevenue ?? 0;

            acc.impressions += impressions;
            acc.clicks += clicks;
            acc.revenue += revenue;
            return acc;
        },
        {
            impressions: 0,
            clicks: 0,
            revenue: 0,
        }
    );

    // Derived totals with calculated metrics
    const derivedTotals = {
        impressions: totals.impressions,
        clicks: totals.clicks,
        revenue: totals.revenue,
        ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
        averageECPM:
            totals.impressions > 0
                ? (totals.revenue / totals.impressions) * 1000
                : 0,
        costPerClick:
            totals.clicks > 0 ? totals.revenue / totals.clicks : 0,
    };

    function formatNumber(num: number) {
        if (num >= 1e9) return (num / 1e9).toFixed(2);
        if (num >= 1e6) return (num / 1e6).toFixed(2);
        if (num >= 1e3) return (num / 1e3).toFixed(2);
        return num.toFixed(2);
    }
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                    Ad Manager Performance Report ({getDateRangeLabel(dateRange, start, end)})
                </h3>
                <div className="space-y-4 md:flex md:space-y-0 md:space-x-4">
                    {/* Date Range Selector */}
                    <div className="flex-1">
                        <label className="block text-sm">Date Range</label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="border p-2 rounded w-full"
                        >
                            {["ALL", "TODAY", "YESTERDAY", "LAST_7_DAYS", "LAST_30_DAYS", "CUSTOM"].map(
                                (opt) => (
                                    <option key={opt} value={opt}>
                                        {getDateRangeLabel(opt, start, end)}
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                    {dateRange === "CUSTOM" && (
                        <div className="flex-1">
                            <label className="block text-sm ">Select Range</label>
                            <DatePicker
                                selectsRange
                                startDate={start}
                                endDate={end}
                                onChange={(u) => setRange(u as [Date | null, Date | null])}
                                isClearable
                                placeholderText="Choose date range"
                                className="border p-2 rounded w-full"
                            />
                        </div>
                    )}

                    {/* Country Search */}
                    <div className="flex-1 relative">
                        <label className="block text-sm ">Country</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                placeholder="Search country"
                                className="border p-2 pr-10 rounded w-full"
                                onFocus={() => setShowCountry(true)}
                                onBlur={() => setTimeout(() => setShowCountry(false), 150)}
                            />
                            {country && (
                                <button
                                    onClick={() => setCountry("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
                                    type="button"
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                        {showCountry && (
                            <ul className="absolute z-10 w-full max-h-40 overflow-y-auto bg-white border mt-1 rounded shadow">
                                {uniqueCountries
                                    .filter((c) => c.toLowerCase().includes(country.toLowerCase()))
                                    .map((c) => (
                                        <li
                                            key={c}
                                            className="px-3 py-1 hover:bg-blue-100 cursor-pointer"
                                            onClick={() => {
                                                setCountry(c);
                                                setShowCountry(false);
                                            }}
                                        >
                                            {c}
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>

                    {/* Site Search */}
                    <div className="flex-1 relative">
                        <label className="block text-sm ">Site</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={site}
                                onChange={(e) => setSite(e.target.value)}
                                placeholder="Search site"
                                className="border p-2 pr-10 rounded w-full"
                                onFocus={() => setShowSite(true)}
                                onBlur={() => setTimeout(() => setShowSite(false), 150)}
                            />
                            {site && (
                                <button
                                    onClick={() => setSite("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
                                    type="button"
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                        {showSite && (
                            <ul className="absolute z-10 w-full max-h-40 overflow-y-auto bg-white border mt-1 rounded shadow">
                                {uniqueSites
                                    .filter((s) => s.toLowerCase().includes(site.toLowerCase()))
                                    .map((s) => (
                                        <li
                                            key={s}
                                            className="px-3 py-1 hover:bg-blue-100 cursor-pointer"
                                            onClick={() => {
                                                setSite(s);
                                                setShowSite(false);
                                            }}
                                        >
                                            {s}
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Revenue"
                    value={`$${formatNumber(derivedTotals.revenue)}`}
                    Icon={DollarLineIcon}
                    trend="up"
                />
                <MetricCard
                    title="Clicks"
                    value={formatNumber(derivedTotals.clicks)}
                    Icon={MailIcon}
                    trend="up"
                />
                <MetricCard
                    title="Impressions"
                    value={formatNumber(derivedTotals.impressions)}
                    Icon={EyeIcon}
                    trend="down"
                />
                <MetricCard
                    title="CTR"
                    value={`${derivedTotals.ctr.toFixed(2)}%`}
                    Icon={TableIcon}
                    trend="up"
                />
            </div>

            <ReportListManager
                rows={filtered}
                headers={[
                    "Date",
                    "Site",
                    "Ad Exchange Impressions",
                    "Ad Exchange Clicks",
                    "Ad Exchange Revenue ($)",
                    "Ad Exchange eCPM ($)",
                    "Ad Exchange CTR (%)",
                    "Ad Exchange CPC ($)",
                ]}
                dateRange={getDateRangeLabel(dateRange, start, end)}
                totals={{
                    adxExchangeLineItemLevelImpressions: derivedTotals.impressions,
                    adxExchangeLineItemLevelClicks: derivedTotals.clicks,
                    adxExchangeLineItemLevelRevenue: derivedTotals.revenue,
                    adxExchangeLineItemLevelCtr: derivedTotals.ctr,
                    adxExchangeLineItemLevelAverageECPM: derivedTotals.averageECPM,
                    adxExchangeCostPerClick: derivedTotals.costPerClick,
                }}
            />
        </div>
    );
}

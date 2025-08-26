import React, { useState, useEffect } from "react";
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
import AdManagerSites from "./AdManagerSites";
import ReportListManager from "./ReportListManager";

// Helper: Format date to YYYY-MM-DD
function formatDate(d: Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Label helper
function getDateRangeLabel(dateRange: string, start: Date | null, end: Date | null) {
    if (dateRange === "CUSTOM" && start && end) {
        return `${formatDate(start)} → ${formatDate(end)}`;
    }
    const labels: Record<string, string> = {
        ALL: "All Dates",
        TODAY: "Today",
        YESTERDAY: "Yesterday",
        LAST_7_DAYS: "Last 7 Days",
        LAST_30_DAYS: "Last 30 Days",
    };
    return labels[dateRange] || dateRange;
}

interface MetricCardProps {
    title: string;
    value: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    trend: "up" | "down";
    change: string;
}

export default function MainLayoutManager() {
    const [searchParams] = useSearchParams();
    const networkId = searchParams.get("networkId") || "";
    const dispatch = useDispatch<AppDispatch>();

    const { data, loading, error } = useSelector(
        (state: RootState) => state.admanagerReport
    );
    const { items: sites, loading: sitesLoading, error: sitesError } =
        useSelector((state: RootState) => state.sites);

    useEffect(() => {
        if (networkId) dispatch(fetchReport(networkId));
    }, [dispatch, networkId]);

    const [dateRange, setDateRange] = useState("ALL"); // default ALL
    const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
    const [country, setCountry] = useState("");
    const [startDate, endDate] = range;

    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    const last7Start = new Date();
    last7Start.setDate(today.getDate() - 6);
    const last30Start = new Date();
    last30Start.setDate(today.getDate() - 29);

    const rows = data?.rows || [];
    const uniqueCountries = Array.from(new Set(rows.map((r) => r.country))).filter(Boolean);

    const normalizeDate = (d: Date) => {
        const dt = new Date(d);
        dt.setHours(0, 0, 0, 0); // normalize to midnight
        return dt;
    };

    const filteredRows = rows.filter((row) => {
        if (!row.reportDate) return false;

        const reportDate = normalizeDate(new Date(row.reportDate));
        const today = normalizeDate(new Date());
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const last7Start = new Date(today);
        last7Start.setDate(today.getDate() - 6); // last 7 days includes today and 6 previous days

        const last30Start = new Date(today);
        last30Start.setDate(today.getDate() - 29);

        const start = startDate ? normalizeDate(startDate) : null;
        const end = endDate ? normalizeDate(endDate) : null;

        let isInRange = false;

        switch (dateRange) {
            case "ALL":
                isInRange = true; // show all dates
                break;
            case "TODAY":
                isInRange = reportDate.getTime() === today.getTime();
                break;
            case "YESTERDAY":
                isInRange = reportDate.getTime() === yesterday.getTime();
                break;
            case "LAST_7_DAYS":
                isInRange = reportDate >= last7Start && reportDate <= today;
                break;
            case "LAST_30_DAYS":
                isInRange = reportDate >= last30Start && reportDate <= today;
                break;
            case "CUSTOM":
                if (start && end) {
                    isInRange = reportDate >= start && reportDate <= end;
                }
                break;
            default:
                isInRange = true;
        }

        // filter by country if selected
        const matchesCountry = country
            ? row.country?.toLowerCase() === country.toLowerCase()
            : true;

        return isInRange && matchesCountry;
    });
    const totals = filteredRows.reduce(
        (acc, row) => {
            acc.adxCostPerClick += Number(row.adxCostPerClick ?? 0);
            acc.adxLineItemClicks += Number(row.adxLineItemClicks ?? 0);
            acc.adxLineItemImpressions += Number(row.adxLineItemImpressions ?? 0);
            acc.adxLineItemCtr += Number(row.adxLineItemCtr ?? 0);
            acc.adServerAllRevenueGross += Number(row.adServerAllRevenueGross ?? 0);
            acc.activeViewViewableRate += Number(row.activeViewViewableRate ?? 0);
            acc.totalLineItemClicks += Number(row.totalLineItemClicks ?? 0);
            return acc;
        },
        {
            adxCostPerClick: 0,
            adxLineItemClicks: 0,
            adxLineItemImpressions: 0,
            adxLineItemCtr: 0,
            adServerAllRevenueGross: 0,
            activeViewViewableRate: 0,
            totalLineItemClicks: 0,
        }
    );


    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Ad Manager Performance Report ({getDateRangeLabel(dateRange, startDate, endDate)})
                </h3>
                <div className="space-y-4 md:flex md:space-y-0 md:space-x-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium">Date Range</label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="border p-2 rounded w-full"
                        >
                            <option value="ALL">All Dates</option>
                            <option value="TODAY">Today</option>
                            <option value="YESTERDAY">Yesterday</option>
                            <option value="LAST_7_DAYS">Last 7 days</option>
                            <option value="LAST_30_DAYS">Last 30 days</option>
                            <option value="CUSTOM">Custom</option>
                        </select>
                    </div>
                    {dateRange === "CUSTOM" && (
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Select Range</label>
                            <DatePicker
                                selectsRange
                                startDate={startDate}
                                endDate={endDate}
                                onChange={(update) => setRange(update as [Date | null, Date | null])}
                                isClearable
                                placeholderText="Select a date range"
                                className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <label className="block text-sm font-medium">Country</label>
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="border p-2 rounded w-full"
                        >
                            <option value="">All</option>
                            {uniqueCountries.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                <MetricCard
                    title="Gross Revenue"
                    value={`$${totals.adServerAllRevenueGross.toFixed(2)}`}
                    Icon={DollarLineIcon}
                    trend="up"
                    change="–"
                />
                <MetricCard
                    title="Total AdX Clicks"
                    value={totals.adxLineItemClicks.toLocaleString()}
                    Icon={MailIcon}
                    trend="up"
                    change="–"
                />
                <MetricCard
                    title="AdX Impressions"
                    value={totals.adxLineItemImpressions.toLocaleString()}
                    Icon={EyeIcon}
                    trend="down"
                    change="–"
                />
                <MetricCard
                    title="CTR"
                    value={`${totals.adxLineItemCtr.toFixed(2)}%`}
                    Icon={TableIcon}
                    trend="up"
                    change="–"
                />
            </div>


            <AdManagerSites sites={sites} loading={sitesLoading} error={sitesError} />

            <ReportListManager
                rows={filteredRows}
                headers={[
                    "Date",
                    // "Ad Unit",
                    "Site",
                    "Country",
                    "adxCostPerClick",
                    "adxLineItemClicks",
                    "adxLineItemImpressions",
                    "adxLineItemCtr",
                    "adServerAllRevenueGross",
                    "activeViewViewableRate",
                    "totalLineItemClicks"
                ]}
                dateRange={getDateRangeLabel(dateRange, startDate, endDate)}
                totals={totals}
            />

        </div>
    );
}

function MetricCard({ title, value, Icon, trend, change }: MetricCardProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Icon className="text-gray-800 size-6 dark:text-white/90" />
            </div>
            <div className="flex items-end justify-between mt-5">
                <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{value}</h4>
                </div>
                <Badge color={trend === "up" ? "success" : "error"}>
                    {trend === "up" ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    {change}
                </Badge>
            </div>
        </div>
    );
}

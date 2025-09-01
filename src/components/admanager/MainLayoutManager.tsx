import React, { useState, useEffect, useMemo } from "react";
import {
    DollarLineIcon,
    MailIcon,
    TableIcon,
} from "../../icons";
import ExportPdfButton from "./ExportToPdf"
import { CircleFadingArrowUp, Camera } from 'lucide-react';

import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchReport } from "../../features/adManager/reportAdManagerSlice";
import { useSearchParams } from "react-router-dom";
import ReportListManager from "./ReportListManager";
import DateRangeFilter from "../common/adManager/DateRangeFilter";
import WebsiteFilter from "../common/adManager/WebsiteFilter";
import SelectedSites from "../common/adManager/SelectedSites";
import CountryMultiSelect from "../common/adManager/CountryMultiSelect";

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

// Enhanced Metric display card
function MetricCard({
    title,
    value,
    Icon,
    gradient,
}: {
    title: string;
    value: string | number;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    trend: "up" | "down";
    gradient: string;
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-1 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 w-full sm:w-auto">
            {/* Background gradient effect */}
            <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${gradient}`}
            ></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex flex-col items-end sm:items-start">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1">
                            {title}
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {value}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function MainLayoutManager() {
    const [searchParams] = useSearchParams();
    const networkId = searchParams.get("networkId") || "";
    const dispatch = useDispatch<AppDispatch>();
    const { data, error, loading } = useSelector((state: RootState) => state.admanagerReport);

    const [dateRange, setDateRange] = useState("TODAY");
    const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);

    const [selectedSites, setSelectedSites] = useState<string[]>([]);
    const [siteQuery, setSiteQuery] = useState("");
    const [showSite, setShowSite] = useState(false);

    const [start, end] = range;
    const [country, setCountry] = useState<string[]>([]);

    const [isCountryOpen, setIsCountryOpen] = useState(false);

    const toggleCountry = (countryName: string) => {
        const newCountries = country.includes(countryName)
            ? country.filter(c => c !== countryName)
            : [...country, countryName];
        setCountry(newCountries);
    };

    const removeCountry = (countryName: string) => {
        const newCountries = country.filter(c => c !== countryName);
        setCountry(newCountries);
    };

    const clearAllCountries = () => {
        setCountry([]);
    };
    useEffect(() => {
        if (!networkId) return;

        if (dateRange === "CUSTOM" && start && end) {
            dispatch(fetchReport({
                networkId,
                dateRange,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
            }));
        } else {
            dispatch(fetchReport({ networkId, dateRange }));
        }
    }, [dispatch, networkId, dateRange, start, end]);


    const rows = data?.rows || [];
    const uniqueSites = Array.from(new Set(rows.map((r) => r.site?.toLowerCase()))).filter(Boolean);
    const normalize = (d: Date) => new Date(d.setHours(0, 0, 0, 0));
    const today = normalize(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const last7 = new Date(today);
    last7.setDate(today.getDate() - 6);
    const last30 = new Date(today);
    last30.setDate(today.getDate() - 29);

    const filtered = useMemo(() => {
        const matchSite = (r: typeof rows[number]) =>
            selectedSites.length > 0
                ? selectedSites.includes(r.site?.toLowerCase() || "")
                : true;
        const matchCountry = (r: typeof rows[number]) =>
            country.length > 0
                ? country.includes(r.country)
                : true;

        const matchDate = (r: typeof rows[number]) => {
            const d = normalize(new Date(r.reportDate));
            if (dateRange === "CUSTOM_DATE" && start && end) {
                return d >= normalize(start) && d <= normalize(end);
            }
            return true; // For ALL or pre-set ranges
        };

        return rows.filter((r) => matchSite(r) && matchCountry(r) && matchDate(r));
    }, [rows, dateRange, start, end, selectedSites, country]);


    // Calculate totals from filtered data
    const totals = filtered.reduce(
        (acc, r) => {
            const impressions = r.adxExchangeLineItemLevelImpressions ?? 0;
            const clicks = r.adxExchangeLineItemLevelClicks ?? 0;
            const revenue = r.adxExchangeLineItemLevelRevenue ?? 0;
            const reportDate = r.reportDate ? new Date(r.reportDate) : null;
            acc.impressions += impressions;
            acc.clicks += clicks;
            acc.revenue += revenue;

            if (reportDate && (!acc.reportDate || reportDate > acc.reportDate)) {
                acc.reportDate = reportDate;
            }

            return acc;
        },
        {
            impressions: 0,
            clicks: 0,
            revenue: 0,
            reportDate: null as Date | null,
        }
    );

    // Derived totals with calculated metrics
    const derivedTotals = {
        impressions: totals.impressions,
        clicks: totals.clicks,
        revenue: totals.revenue,
        reportDate: totals.reportDate,
        ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
        averageECPM:
            totals.impressions > 0
                ? (totals.revenue / totals.impressions) * 1000
                : 0,
        costPerClick:
            totals.clicks > 0 ? totals.revenue / totals.clicks : 0,
    };

    function formatNumber(num: number) {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
        if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
        if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
        return num.toFixed(2);
    }

    const refreshData = () => {
        if (networkId) {
            dispatch(fetchReport({ networkId, dateRange }));
        }
    };
    const countries = useMemo(() => {
        return Array.from(new Set(rows.map((r) => r.country).filter(Boolean)));
    }, [rows]);

    return (
        <div>
            <div className="max-w-7xl mx-auto space-y-2">
                {/* Enhanced Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        {/* Icon */}
                        <div className="self-start sm:self-auto p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <TableIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                        </div>
                        {/* Title and Subtitle */}
                        <div>
                            <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                                Ad Manager Performance
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                                {getDateRangeLabel(dateRange, start, end)} • Real-time Analytics
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={refreshData}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="text-sm font-medium">{loading ? 'Refreshing...' : 'Refresh'}</span>
                        </button>
                        <div>
                            <ExportPdfButton
                                headers={[
                                    "Date",
                                    "Site",
                                    "Ad Exchange Impressions",
                                    "Ad Exchange Clicks",
                                    "Ad Exchange Revenue ($)",
                                    "Ad Exchange Average eCPM ($)",
                                    "Ad Exchange CTR (%)",
                                    "Ad Exchange CPC ($)",
                                ]}
                                rows={filtered}
                                totals={{
                                    adxExchangeLineItemLevelImpressions: derivedTotals.impressions,
                                    adxExchangeLineItemLevelClicks: derivedTotals.clicks,
                                    adxExchangeLineItemLevelRevenue: derivedTotals.revenue,
                                    adxExchangeLineItemLevelCtr: derivedTotals.ctr,
                                    adxExchangeLineItemLevelAverageECPM: derivedTotals.averageECPM,
                                    adxExchangeCostPerClick: derivedTotals.costPerClick,
                                    reportDate: derivedTotals.reportDate ?? null,
                                }}
                                title="Ad Manager Report"
                                dateRangeLabel={getDateRangeLabel(dateRange, start, end)}
                                fileName={`admanager_${dateRange.toLowerCase()}.pdf`}
                            />
                        </div>
                    </div>
                </div>
                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-1">
                        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                    </div>
                )}
                {/* Enhanced Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 p-2 sm:p-4">
                    <MetricCard
                        title="Revenue"
                        value={`$${formatNumber(derivedTotals.revenue / 1_000_000)}`}
                        Icon={DollarLineIcon}
                        trend="up"
                        gradient="from-emerald-500 to-green-600"
                    />
                    <MetricCard
                        title="Average eCPM"
                        value={`$${formatNumber(derivedTotals.averageECPM / 1_000_000)}`}
                        Icon={Camera}
                        trend="up"
                        gradient="from-pink-500 to-yellow-600"
                    />
                    <MetricCard
                        title="Clicks"
                        value={formatNumber(derivedTotals.clicks)}
                        Icon={MailIcon}
                        trend="up"
                        gradient="from-blue-500 to-cyan-600"
                    />
                    <MetricCard
                        title="Impressions"
                        value={formatNumber(derivedTotals.impressions)}
                        Icon={CircleFadingArrowUp}
                        trend="down"
                        gradient="from-purple-500 to-pink-600"
                    />
                    <MetricCard
                        title="CTR"
                        value={`${derivedTotals.ctr.toFixed(2)}%`}
                        Icon={TableIcon}
                        trend="up"
                        gradient="from-orange-500 to-red-600"
                    />
                </div>

                {/* Enhanced Filter Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                        {/* Date Range Section */}
                        <div>
                            <DateRangeFilter {...{ dateRange, setDateRange, start, end, setRange, getDateRangeLabel }} />
                        </div>
                        {/* Country Filter Section */}
                        <CountryMultiSelect
                            countries={countries}
                            selectedCountries={country}
                            isOpen={isCountryOpen}
                            toggleOpen={() => setIsCountryOpen(!isCountryOpen)}
                            toggleCountry={toggleCountry}
                            removeCountry={removeCountry}
                            clearAll={clearAllCountries}
                            closeDropdown={() => setIsCountryOpen(false)}
                        />
                        {/* Site Search Section */}
                        <div>
                            <WebsiteFilter
                                {...{
                                    siteQuery,
                                    setSiteQuery,
                                    uniqueSites,
                                    selectedSites,
                                    setSelectedSites,
                                    showSite,
                                    setShowSite,
                                }}
                                onReset={() => {
                                    setDateRange("TODAY");
                                    setRange([null, null]);
                                    setSelectedSites([]);
                                    setSiteQuery("");
                                    setCountry([]);
                                }}
                            />

                        </div>

                        {/* Enhanced Selected Sites Section */}
                    </div>
                    <SelectedSites {...{ selectedSites, setSelectedSites }} />
                </div>

                {/* Report List Manager */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4">
                    <ReportListManager
                        rows={filtered}
                        headers={[
                            "Date",
                            "Site",
                            "Country",
                            "Ad Exchange Impressions",
                            "Ad Exchange Clicks",
                            "Ad Exchange Revenue ($)",
                            "Ad Exchange Average eCPM ($)",
                            "Ad Exchange CTR (%)",
                            "Ad Exchange CPC ($)",
                        ]}
                        dateRange={getDateRangeLabel(dateRange, start, end)}
                        totals={{
                            reportDate: derivedTotals.reportDate,
                            adxExchangeLineItemLevelImpressions: derivedTotals.impressions,
                            adxExchangeLineItemLevelClicks: derivedTotals.clicks,
                            adxExchangeLineItemLevelRevenue: derivedTotals.revenue,
                            adxExchangeLineItemLevelCtr: derivedTotals.ctr,
                            adxExchangeLineItemLevelAverageECPM: derivedTotals.averageECPM,
                            adxExchangeCostPerClick: derivedTotals.costPerClick,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
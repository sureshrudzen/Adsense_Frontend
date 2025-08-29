import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Calendar, Globe, Monitor, Filter } from "lucide-react";
import SelectedSites from "../adManager/SelectedSites";

interface FilterPanelProps {
    dateRange: string;
    setDateRange: (value: string) => void;
    range: [Date | null, Date | null];
    setRange: (value: [Date | null, Date | null]) => void;
    country: string;
    setCountry: (value: string) => void;
    domainSearch: string;
    setDomainSearch: (value: string) => void;
    allColumns: string[];
    siteQuery: string;
    setSiteQuery: (val: string) => void;
    uniqueSites: string[];
    selectedSites: string[];
    setSelectedSites: (val: string[]) => void;
    showSite: boolean;
    setShowSite: (val: boolean) => void;
    visibleColumns: string[];
    setVisibleColumns: (cols: string[]) => void;
    toggleColumn: (col: string) => void;
}

export default function FilterPanel({
    dateRange,
    setDateRange,
    range,
    setRange,
    country,
    setCountry,
    visibleColumns,
    setVisibleColumns,
    toggleColumn,
    allColumns,
    siteQuery,
    setSiteQuery,
    uniqueSites,
    selectedSites,
    setSelectedSites,
    showSite,
    setShowSite,
}: FilterPanelProps) {
    const [startDate, endDate] = range;
    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Time Period & Custom Range */}
                    <div className="flex ">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1">
                                ⏰ Time Period
                            </label>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            >
                                <option value="TODAY">Today</option>
                                <option value="YESTERDAY">Yesterday</option>
                                <option value="LAST_7_DAYS">Last 7 Days</option>
                                <option value="LAST_30_DAYS">Last 30 Days</option>
                                <option value="CUSTOM">Custom Range</option>
                            </select>
                        </div>

                        {dateRange === "CUSTOM" && (
                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1 block">
                                    📅 Custom Range
                                </label>
                                <DatePicker
                                    selectsRange
                                    startDate={startDate}
                                    endDate={endDate}
                                    onChange={(update) => setRange(update as [Date | null, Date | null])}
                                    isClearable
                                    placeholderText="Choose date range"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                                />
                            </div>
                        )}
                    </div>

                    {/* Country Selector */}
                    <div className="flex flex-col space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1">
                                🌍 Country
                            </label>
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                            >
                                <option value="">Select Country</option>
                                <option value="IN">India</option>
                                <option value="US">United States</option>
                                <option value="UK">United Kingdom</option>
                                <option value="CA">Canada</option>
                                {/* Add more countries as needed */}
                            </select>
                        </div>
                    </div>

                    {/* Website Filter */}
                    <div className="space-y-2 relative">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            🌐 Website Filter
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={siteQuery}
                                onChange={(e) => setSiteQuery(e.target.value)}
                                placeholder="Search websites..."
                                className="w-full pl-10 p-2 border rounded-xl dark:bg-gray-700 dark:text-white"
                                onFocus={() => setShowSite(true)}
                                onBlur={() => setTimeout(() => setShowSite(false), 150)}
                            />
                            {siteQuery && (
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    onClick={() => setSiteQuery("")}
                                >
                                    ✖
                                </button>
                            )}
                        </div>

                        {showSite && uniqueSites.length > 0 && (
                            <div className="absolute w-full z-20 bg-white dark:bg-gray-800 border rounded-xl shadow-md max-h-48 overflow-y-auto">
                                {uniqueSites
                                    .filter(
                                        (s) =>
                                            s.toLowerCase().includes(siteQuery.toLowerCase()) &&
                                            !selectedSites.includes(s.toLowerCase())
                                    )
                                    .map((s) => (
                                        <button
                                            key={s}
                                            onMouseDown={() => {
                                                setSelectedSites([...selectedSites, s.toLowerCase()]);
                                                setSiteQuery("");
                                                setShowSite(false);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            {s}
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                <SelectedSites {...{ selectedSites, setSelectedSites }} />
                <div className=" p-2 m-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            📊 Visible Metrics
                        </h3>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setVisibleColumns([...allColumns])}
                                className="text-sm px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700 transition"
                            >
                                Select All
                            </button>
                            <button
                                type="button"
                                onClick={() => setVisibleColumns([])}
                                className="text-sm px-3 py-1 rounded bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>


                    {/* Checkboxes in a horizontal flex wrap */}
                    <div className="flex flex-wrap gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-3 shadow-inner">
                        {allColumns.map((col) => (
                            <label
                                key={col}
                                className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-650 cursor-pointer transition-all duration-200 group"
                            >
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.includes(col)}
                                    onChange={() => toggleColumn(col)}
                                    className="w-4 h-4 text-purple-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-purple-500 focus:ring-2 transition-colors"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                    {col}
                                </span>
                                <div className="ml-auto">
                                    <div
                                        className={`w-2 h-2 rounded-full transition-all duration-200 ${visibleColumns.includes(col)
                                            ? "bg-green-500 shadow-lg shadow-green-200"
                                            : "bg-gray-300"
                                            }`}
                                    />

                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
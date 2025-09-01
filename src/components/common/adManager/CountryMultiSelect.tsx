import React, { useState, useMemo } from "react";
import { ChevronDown, X, Globe } from "lucide-react";

interface Props {
    countries: string[];
    selectedCountries: string[];
    isOpen: boolean;
    toggleOpen: () => void;
    toggleCountry: (c: string) => void;
    removeCountry: (c: string) => void;
    clearAll: () => void;
    closeDropdown: () => void;
}

const CountryMultiSelect: React.FC<Props> = ({
    countries,
    selectedCountries,
    isOpen,
    toggleOpen,
    toggleCountry,
    removeCountry,
    clearAll,
    closeDropdown,
}) => {
    const [search, setSearch] = useState("");

    // Filtered countries based on search
    const filteredCountries = useMemo(() => {
        if (!search) return countries;
        return countries.filter(c =>
            c.toLowerCase().includes(search.toLowerCase())
        );
    }, [countries, search]);

    const clearSearch = () => setSearch("");

    return (
        <div className="space-y-2 relative">
            <label
                htmlFor="country-select"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Country
            </label>

            <div className="relative">
                {/* Display Area */}
                <div
                    onClick={toggleOpen}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 cursor-pointer transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20 focus-within:border-blue-500"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            {selectedCountries.length === 0 ? (
                                <span className="text-gray-500 dark:text-gray-400">
                                    Select countries...
                                </span>
                            ) : (
                                <div className="flex flex-wrap gap-1">
                                    {selectedCountries.map((c) => (
                                        <span
                                            key={c}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-md"
                                        >
                                            {c}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeCountry(c);
                                                }}
                                                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                            {selectedCountries.length > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearAll();
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                                    title="Clear all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <ChevronDown
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                    isOpen ? "transform rotate-180" : ""
                                }`}
                            />
                        </div>
                    </div>
                </div>

                {/* Dropdown Options */}
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                        {/* Sticky Search Input */}
                        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-600 flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {search && (
                                <button
                                    onClick={clearSearch}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="p-2">
                            {filteredCountries.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center">
                                    No countries found
                                </p>
                            ) : (
                                filteredCountries.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => toggleCountry(c)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-150 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                            selectedCountries.includes(c)
                                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                                : "text-gray-700 dark:text-gray-300"
                                        }`}
                                    >
                                        <span>{c}</span>
                                        {selectedCountries.includes(c) && (
                                            <div className="w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-sm flex items-center justify-center">
                                                <svg
                                                    className="w-3 h-3 text-white dark:text-gray-900"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Backdrop to close */}
                {isOpen && <div className="fixed inset-0 z-40" onClick={closeDropdown} />}
            </div>
        </div>
    );
};

export default CountryMultiSelect;

interface WebsiteFilterProps {
  siteQuery: string;
  setSiteQuery: (val: string) => void;
  uniqueSites: string[];
  selectedSites: string[];
  setSelectedSites: (sites: string[]) => void;
  showSite: boolean;
  setShowSite: (val: boolean) => void;
  onReset?: () => void; // ✅ extra prop for reset
}

export default function WebsiteFilter({
  siteQuery,
  setSiteQuery,
  uniqueSites,
  selectedSites,
  setSelectedSites,
  showSite,
  setShowSite,
  onReset,
}: WebsiteFilterProps) {
  return (
    <div className="space-y-2 relative">
      {/* Label + Reset button inline */}
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          🌐 Website Filter
        </label>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs bg-red-500 text-white rounded px-2 py-0.5 hover:bg-red-600 transition-colors"
          >
            Reset All Filter
          </button>
        )}
      </div>

      {/* Input box */}
      <div className="relative">
        <input
          type="text"
          value={siteQuery}
          onChange={(e) => setSiteQuery(e.target.value)}
          placeholder="Search websites..."
          className="w-full pl-10 px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
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

      {/* Dropdown list */}
      {showSite && uniqueSites.length > 0 && (
        <div className="absolute w-90 z-20 bg-white dark:bg-gray-800 border rounded-xl shadow-md max-h-48 overflow-y-auto">
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
  );
}

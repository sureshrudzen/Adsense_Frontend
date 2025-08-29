

interface WebsiteFilterProps {
  siteQuery: string;
  setSiteQuery: (val: string) => void;
  uniqueSites: string[];
  selectedSites: string[];
  setSelectedSites: (sites: string[]) => void;
  showSite: boolean;
  setShowSite: (val: boolean) => void;
}

export default function WebsiteFilter({
  siteQuery,
  setSiteQuery,
  uniqueSites,
  selectedSites,
  setSelectedSites,
  showSite,
  setShowSite,
}: WebsiteFilterProps) {
  return (
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
          onBlur={() => setTimeout(() => setShowSite(false), 150)} // delay so click can register
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

      {/* Dropdown suggestions */}
      {showSite && uniqueSites.length > 0 && (
        <div className="absolute w-full z-20 bg-white dark:bg-gray-800 border rounded-xl shadow-md max-h-48 overflow-y-auto">
          {uniqueSites
            .filter(
              (site) =>
                site.toLowerCase().includes(siteQuery.toLowerCase()) &&
                !selectedSites.includes(site.toLowerCase())
            )
            .map((site) => (
              <button
                key={site}
                onMouseDown={() => {
                  setSelectedSites([...selectedSites, site.toLowerCase()]);
                  setSiteQuery("");
                  setShowSite(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {site}
              </button>
            ))}
          {uniqueSites.filter(
            (site) =>
              site.toLowerCase().includes(siteQuery.toLowerCase()) &&
              !selectedSites.includes(site.toLowerCase())
          ).length === 0 && (
            <div className="px-4 py-2 text-gray-500">No matching sites</div>
          )}
        </div>
      )}

      {/* Selected Sites Display */}
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedSites?.map((site) => (
          <div
            key={site}
            className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full px-3 py-1 text-sm"
          >
            <span>{site}</span>
            <button
              type="button"
              onClick={() =>
                setSelectedSites(selectedSites.filter((s) => s !== site))
              }
              className="text-blue-600 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-bold"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

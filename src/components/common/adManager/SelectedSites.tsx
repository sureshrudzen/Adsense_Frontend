interface SelectedSitesProps {
    selectedSites: string[];
    setSelectedSites: (sites: string[]) => void;
}

export default function SelectedSites({ selectedSites, setSelectedSites }: SelectedSitesProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Selected Sites ({selectedSites.length})
                </label>
                {selectedSites.length > 0 && (
                    <button
                        onClick={() => setSelectedSites([])}
                        className="text-xs text-red-500 hover:text-red-700"
                    >
                        Clear All
                    </button>
                )}
            </div>

            <div className="border-2 border-dashed rounded-xl">
                {selectedSites.length === 0 ? (
                    <p className="text-gray-400 p-1 text-sm">No sites selected</p>
                ) : (
                    <div className="flex gap-2 flex-wrap">
                        {selectedSites.map((s) => (
                            <div
                                key={s}
                                className="flex items-center gap-2 bg-green-100 px-2 py-1 rounded-full text-sm"
                            >
                                {s}
                                <button onClick={() => setSelectedSites(selectedSites.filter((x) => x !== s))}
                                    className="ml-1 text-green-600 hover:text-red-500 transition-colors group-hover:text-red-500"

                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

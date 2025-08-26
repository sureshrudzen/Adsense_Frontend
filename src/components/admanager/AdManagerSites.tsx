import React, { useState } from "react";

interface Site {
  name: string;
  domain: string;
  state: string;
}

interface ReportViewerProps {
  sites: Site[];
  loading: boolean;
  error: string | null;
}

export default function AdManagerSites({ sites, loading, error }: ReportViewerProps) {
  const [selectedSite, setSelectedSite] = useState<string>("");

  if (loading) {
    return <p className="p-4">Loading sites...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">Error: {error}</p>;
  }

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      {/* ✅ Sites List */}
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-white/90">Registered Sites (subdomain name)</h3>
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm mt-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-left">
                <th className="px-4 py-2 text-left border text-sm font-semibold  border-b">
                  Domain
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold  border-b">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sites.map((site) => (
                <tr
                  key={site.name}
                  className={`cursor-pointer transition-colors ${selectedSite === site.domain
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "hover:bg-blue-50 dark:hover:bg-gray-700"
                    }`}
                  onClick={() => setSelectedSite(site.domain)}
                >
                  <td className="px-4 py-2 text-sm border text-gray-700 dark:text-gray-300">
                    {site.domain}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${site?.state === "READY"
                          ? "bg-green-100 text-green-700"
                          : site?.state === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : site?.state === "REQUIRES_REVIEW"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                        }`}
                    >
                      {site?.state || "Unknown"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchSites } from "../../features/adsense/adsenseSlice";

export default function ReportViewer({ accountId }: { accountId: string }) {
    const dispatch = useDispatch<AppDispatch>();
    const { sites, report, loadingSites, loadingReport, error } = useSelector(
        (state: RootState) => state.adsense
    );
    const [selectedSite, setSelectedSite] = useState<string>("");
    // ✅ Fetch sites when accountId changes
    useEffect(() => {
        if (accountId) {
            dispatch(fetchSites(accountId));
        }
    }, [accountId, dispatch]);

    // ✅ Fetch report whenever filters change


    return (
        <div className="p-4 border rounded-lg shadow-md bg-white">
            {/* ✅ Sites List */}
            <div>
                <h3 className="font-semibold text-gray-800 dark:text-white/90">Registered Sites</h3>

                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm mt-2">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 py-2 text-left border text-sm font-semibold text-gray-700 dark:text-gray-200 border-b">
                                    Domain
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b">
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
                                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${site?.state === "APPROVED"
                                                ? "bg-green-100 text-green-700"
                                                : site?.state === "PENDING"
                                                    ? "bg-yellow-100 text-yellow-700"
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

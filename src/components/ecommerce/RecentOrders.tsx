import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// ✅ Define ad type
interface AdCampaign {
  id: number;
  name: string;
  platform: string;
  type: string;
  impressions: number;
  clicks: number;
  ctr: number;
  status: "Active" | "Paused" | "Ended";
  date: string; // YYYY-MM-DD format
}

// ✅ Sample data (all with dates)
const adsData: AdCampaign[] = [
  {
    id: 1,
    name: "Summer Sale 2025",
    platform: "Facebook",
    type: "Banner",
    impressions: 120000,
    clicks: 3400,
    ctr: 2.83,
    status: "Active",
    date: "2025-08-01",
  },
  {
    id: 2,
    name: "Back to School",
    platform: "Instagram",
    type: "Video",
    impressions: 95000,
    clicks: 2200,
    ctr: 2.31,
    status: "Paused",
    date: "2025-08-05",
  },
  {
    id: 3,
    name: "Holiday Promo",
    platform: "Google Ads",
    type: "Search",
    impressions: 300000,
    clicks: 18000,
    ctr: 6.0,
    status: "Ended",
    date: "2025-07-15",
  },
  {
    id: 1,
    name: "Summer Sale 2025",
    platform: "Facebook",
    type: "Banner",
    impressions: 120000,
    clicks: 3400,
    ctr: 2.83,
    status: "Active",
    date: "2025-08-01",
  },
  {
    id: 2,
    name: "Back to School",
    platform: "Instagram",
    type: "Video",
    impressions: 95000,
    clicks: 2200,
    ctr: 2.31,
    status: "Paused",
    date: "2025-08-05",
  },
  {
    id: 3,
    name: "Holiday Promo",
    platform: "Google Ads",
    type: "Search",
    impressions: 300000,
    clicks: 18000,
    ctr: 6.0,
    status: "Ended",
    date: "2025-07-15",
  },
  {
    id: 1,
    name: "Summer Sale 2025",
    platform: "Facebook",
    type: "Banner",
    impressions: 120000,
    clicks: 3400,
    ctr: 2.83,
    status: "Active",
    date: "2025-08-01",
  },
  {
    id: 2,
    name: "Back to School",
    platform: "Instagram",
    type: "Video",
    impressions: 95000,
    clicks: 2200,
    ctr: 2.31,
    status: "Paused",
    date: "2025-08-05",
  },
  {
    id: 3,
    name: "Holiday Promo",
    platform: "Google Ads",
    type: "Search",
    impressions: 300000,
    clicks: 18000,
    ctr: 6.0,
    status: "Ended",
    date: "2025-07-15",
  },
];

export default function AdsManagerTable() {
  const [selectedPlatform, setSelectedPlatform] = useState("All");

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const filteredAds = adsData.filter((ad) => {
    const platformMatch =
      selectedPlatform === "All" || ad.platform === selectedPlatform;

    const adDate = new Date(ad.date);
    const isAfterStart = startDate ? adDate >= new Date(startDate) : true;
    const isBeforeEnd = endDate ? adDate <= new Date(endDate) : true;

    return platformMatch && isAfterStart && isBeforeEnd;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Platform Select */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-40 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition duration-150 ease-in-out focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="All">All Platforms</option>
            <option value="Facebook">Facebook</option>
            <option value="Instagram">Instagram</option>
            <option value="Google Ads">Google Ads</option>
          </select>

          <div className="flex items-center gap-2">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="Start Date"
              className="w-36 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              dateFormat="yyyy-MM-dd"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">to</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              placeholderText="End Date"
              className="w-36 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              dateFormat="yyyy-MM-dd"
            />
          </div>
        </div>

        {/* Reset Filters Button */}
        <button
          onClick={() => {
            setStartDate("");
            setEndDate("");
            setSelectedPlatform("All");
          }}
          className="rounded border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Reset Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <TableHeader className="bg-gray-50 dark:bg-gray-800">
            <TableRow>
              {["Campaign", "Type", "Impressions", "Clicks", "CTR", "Status", "Date"].map((header) => (
                <TableCell
                  key={header}
                  isHeader
                  className="whitespace-nowrap py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300"
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredAds.length === 0 ? (
              <TableRow>
                <TableCell className="py-6 text-center text-gray-500 dark:text-gray-400">
                  No ads found matching the filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredAds.map((ad) => (
                <TableRow key={`${ad.id}-${ad.date}`} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <TableCell className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{ad.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{ad.platform}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-gray-700 dark:text-gray-300">{ad.type}</TableCell>
                  <TableCell className="py-3 px-4 text-gray-700 dark:text-gray-300">{ad.impressions.toLocaleString()}</TableCell>
                  <TableCell className="py-3 px-4 text-gray-700 dark:text-gray-300">{ad.clicks.toLocaleString()}</TableCell>
                  <TableCell className="py-3 px-4 text-gray-700 dark:text-gray-300">{ad.ctr}%</TableCell>
                  <TableCell className="py-3 px-4">
                    <Badge
                      size="sm"
                      color={
                        ad.status === "Active"
                          ? "success"
                          : ad.status === "Paused"
                            ? "warning"
                            : "error"
                      }
                    >
                      {ad.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-gray-700 dark:text-gray-300">{formatDate(ad.date)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>

  );
}

import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarLineIcon,
  EyeIcon,
  MailIcon,
  TableIcon,
  TrashBinIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect } from "react";
type FilterOption = "Last 7 Days" | "Last 30 Days" | "This Year" | "Custom Range";

interface AdRecord {
  date: string; // ISO date string
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
}

interface AggregatedMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
}

interface MetricCardProps {
  title: string;
  value: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend: "up" | "down";
  change: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  "Last 7 Days",
  "Last 30 Days",
  "This Year",
  "Custom Range",
];

// Example dataset (daily metrics)
const adsData: AdRecord[] = [
  { date: "2025-08-01", spend: 450, impressions: 8000, clicks: 320, conversions: 60, roas: 3.5 },
  { date: "2025-08-05", spend: 620, impressions: 9500, clicks: 400, conversions: 85, roas: 4.0 },
  { date: "2025-07-20", spend: 700, impressions: 10000, clicks: 500, conversions: 100, roas: 3.7 },
  { date: "2025-01-12", spend: 350, impressions: 6000, clicks: 200, conversions: 30, roas: 2.9 },
];

export default function AdsMetrics() {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("Last 7 Days");
  const [customRange, setCustomRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = customRange;
  const [msg, setMsg] = useState("");
  console.log(msg,"message from frontend");
  const metrics: AggregatedMetrics = useMemo(() => {
    const today = new Date();
    let start: Date | null = null;
    let end: Date = today;

    switch (selectedFilter) {
      case "Last 7 Days":
        start = new Date();
        start.setDate(today.getDate() - 7);
        break;
      case "Last 30 Days":
        start = new Date();
        start.setDate(today.getDate() - 30);
        break;
      case "This Year":
        start = new Date(today.getFullYear(), 0, 1);
        break;
      case "Custom Range":
        if (startDate && endDate) {
          start = startDate;
          end = endDate;
        }
        break;
    }

    const filtered = adsData.filter((ad) => {
      const adDate = new Date(ad.date);
      return start !== null && adDate >= start && adDate <= end;
    });

    if (filtered.length === 0) {
      return { spend: 0, impressions: 0, clicks: 0, conversions: 0, roas: 0 };
    }

    const totals = filtered.reduce(
      (acc, ad) => {
        acc.spend += ad.spend;
        acc.impressions += ad.impressions;
        acc.clicks += ad.clicks;
        acc.conversions += ad.conversions;
        acc.roas += ad.roas;
        return acc;
      },
      { spend: 0, impressions: 0, clicks: 0, conversions: 0, roas: 0 }
    );

    // Average ROAS instead of sum
    totals.roas = totals.roas / filtered.length;
    return totals;
  }, [selectedFilter, startDate, endDate]);


  useEffect(() => {
    fetch("http://localhost:5000/")  // ✅ backend API call
      .then(res => res.text())       // res.json() nahi, kyunki backend `res.send` kar raha hai
      .then(data => setMsg(data))
      .catch(err => console.error(err));
  }, []);
  return (
    <div className="space-y-4">
      {/* Filter Dropdown */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Ads Performance Report
        </h2>
        <div className="flex gap-3">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as FilterOption)}
            className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          {selectedFilter === "Custom Range" && (
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update: [Date | null, Date | null]) => setCustomRange(update)}
              isClearable
              className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 md:gap-6">
        <MetricCard
          title="Total Spend"
          value={`$${metrics.spend.toLocaleString()}`}
          Icon={DollarLineIcon}
          trend="up"
          change="8.2%"
        />
        <MetricCard
          title="Impressions"
          value={metrics.impressions.toLocaleString()}
          Icon={EyeIcon}
          trend="up"
          change="5.6%"
        />
        <MetricCard
          title="Clicks"
          value={metrics.clicks.toLocaleString()}
          Icon={MailIcon}
          trend="down"
          change="2.9%"
        />
        <MetricCard
          title="Conversions"
          value={metrics.conversions.toLocaleString()}
          Icon={TableIcon}
          trend="up"
          change="6.3%"
        />
        <MetricCard
          title="ROAS"
          value={`${metrics.roas.toFixed(1)}x`}
          Icon={TrashBinIcon}
          trend="up"
          change="4.1%"
        />
      </div>
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

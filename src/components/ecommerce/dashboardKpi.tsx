import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarLineIcon,
  EyeIcon,
  MailIcon,
  TableIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";


interface MetricCardProps {
  title: string;
  value: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend: "up" | "down";
  change: string;
}
interface Totals {
  earnings: number;
  clicks: number;
  pageViews: number;
  impressions: number;
}

interface DashboardKpiProps {
  totals: Totals;
}
// 🔹 Helper: format Date → "YYYY-MM-DD"
export default function DashboardKpi({ totals }: DashboardKpiProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Adsense Performance Report
        </h3>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        <MetricCard
          title="Total Earnings"
          value={`$${totals.earnings.toFixed(2)}`}
          Icon={DollarLineIcon}
          trend="up"
          change="8.2%"
        />
        <MetricCard
          title="Clicks"
          value={totals.clicks.toString()}
          Icon={MailIcon}
          trend="down"
          change="2.9%"
        />
        <MetricCard
          title="Page Views"
          value={totals.pageViews.toString()}
          Icon={TableIcon}
          trend="up"
          change="6.3%"
        />
        <MetricCard
          title="Impressions"
          value={totals.impressions.toString()}
          Icon={EyeIcon}
          trend="up"
          change="5.6%"
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
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {value}
          </h4>
        </div>
        <Badge color={trend === "up" ? "success" : "error"}>
          {trend === "up" ? <ArrowUpIcon /> : <ArrowDownIcon />}
          {change}
        </Badge>
      </div>
    </div>
  );
}



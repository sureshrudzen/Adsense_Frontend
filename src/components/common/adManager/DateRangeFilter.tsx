import DatePicker from "react-datepicker";
import { useState } from "react";

interface DateRangeFilterProps {
  dateRange: string;
  setDateRange: (val: string) => void;
  start: Date | null;
  end: Date | null;
  setRange: (range: [Date | null, Date | null]) => void;
  getDateRangeLabel: (opt: string, start: Date | null, end: Date | null) => string;
}

export default function DateRangeFilter({
  dateRange,
  setDateRange,
  start,
  end,
  setRange,
  getDateRangeLabel,
}: DateRangeFilterProps) {
  // 🟢 Local state for temp selection
  const [tempRange, setTempRange] = useState<[Date | null, Date | null]>([start, end]);

  const handleApply = () => {
    setRange(tempRange); // ✅ send to parent
  };
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
        ⏰ Time Period
      </label>
      <div className="flex gap-2">
        <div className="relative">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-2 py-1 pr-12 border rounded dark:bg-gray-700 dark:text-white"
          >
            {["ALL", "TODAY", "YESTERDAY", "LAST_7_DAYS", "LAST_30_DAYS", "CUSTOM"].map((opt) => (
              <option key={opt} value={opt}>
                {opt === "CUSTOM" ? "Custom" : getDateRangeLabel(opt, start, end)}
              </option>
            ))}
          </select>

        </div>

        {dateRange === "CUSTOM" && (
          <div className="flex">
            <DatePicker
              selectsRange
              startDate={tempRange[0]}
              endDate={tempRange[1]}
              onChange={(u) => setTempRange(u as [Date | null, Date | null])}
              isClearable
              placeholderText="Choose date range"
              className="w-full px-2 py-1 border rounded dark:bg-gray-800 dark:text-white"
            />

            <button
              onClick={handleApply}
              disabled={!tempRange[0] || !tempRange[1]}
              className="px-3  text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Apply
            </button>

          </div>
        )}
      </div>

    </div>
  );
}

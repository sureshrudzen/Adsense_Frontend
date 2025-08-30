import DatePicker from "react-datepicker";

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
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
        ⏰ Time Period
      </label>
      <div className="relative">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="w-full px-2 py-1 pr-12 border rounded dark:bg-gray-700 dark:text-white"
        >
          {["ALL", "TODAY", "YESTERDAY", "LAST_7_DAYS", "LAST_30_DAYS", "CUSTOM"].map((opt) => (
            <option key={opt} value={opt}>
              {getDateRangeLabel(opt, start, end)}
            </option>
          ))}
        </select>
      </div>

      {dateRange === "CUSTOM" && (
        <div className="mt-3 p-2 border rounded bg-blue-50 dark:bg-blue-900/20">
          <DatePicker
            selectsRange
            startDate={start}
            endDate={end}
            onChange={(u) => setRange(u as [Date | null, Date | null])}
            isClearable
            placeholderText="Choose date range"
            className="w-full px-2 py- border rounded dark:bg-gray-800 dark:text-white"
          />
        </div>
      )}
    </div>
  );
}

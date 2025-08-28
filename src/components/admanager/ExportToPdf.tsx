import React, { useCallback, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

type Totals = {
  adxExchangeLineItemLevelImpressions: number;
  adxExchangeLineItemLevelClicks: number;
  adxExchangeLineItemLevelRevenue: number;
  adxExchangeLineItemLevelCtr: number; // %
  adxExchangeLineItemLevelAverageECPM: number;
  adxExchangeCostPerClick: number;
  reportDate?: Date | null;
};

type ExportPdfButtonProps<RowT = any> = {
  headers: string[];
  rows: RowT[];
  totals: Totals;
  title?: string;
  dateRangeLabel?: string;
  fileName?: string;
  className?: string;
  disabled?: boolean;
  mapRow?: (row: RowT) => (string | number)[]; 
};

function formatNumber(num: number) {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return (Number.isFinite(num) ? num : 0).toFixed(2);
}

function fromMicros(micros?: number, decimals = 2) {
  return `$${((micros ?? 0) / 1_000_000).toFixed(decimals)}`;
}

function defaultMapRow(r: any) {
  return [
    r.reportDate ? new Date(r.reportDate).toLocaleDateString() : "-",
    r.site || "-",
    r.adxExchangeLineItemLevelImpressions ?? 0,
    r.adxExchangeLineItemLevelClicks ?? 0,
    fromMicros(r.adxExchangeLineItemLevelRevenue),
    fromMicros(r.adxExchangeLineItemLevelAverageECPM),
    ((r.adxExchangeLineItemLevelCtr ?? 0) as number).toFixed(2) + "%",
    fromMicros(r.adxExchangeCostPerClick),
  ];
}

export default function ExportPdfButton<RowT = any>({
  headers,
  rows,
  totals,
  title = "Ad Manager Report",
  dateRangeLabel,
  fileName = "admanager_report.pdf",
  className = "",
  disabled = false,
  mapRow,
}: ExportPdfButtonProps<RowT>) {
  const body: RowInput[] = useMemo(
    () => rows.map((r) => (mapRow ? mapRow(r) : defaultMapRow(r))),
    [rows, mapRow]
  );

  const handleExport = useCallback(() => {
    const orientation = headers.length > 6 ? "landscape" : "portrait";
    const doc = new jsPDF({ orientation });

    // Header
    doc.setFontSize(16);
    doc.text(title, 14, 18);
    if (dateRangeLabel) {
      doc.setFontSize(11);
      doc.text(`Date Range: ${dateRangeLabel}`, 14, 26);
    }

    // Data table
    autoTable(doc, {
      head: [headers],
      body,
      startY: 32,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fontStyle: "bold" },
    });

    const y = (doc as any).lastAutoTable?.finalY ?? 32;
    doc.setFontSize(12);
    doc.text("Totals", 14, y + 10);

    // Totals table
    autoTable(doc, {
      head: [["Impressions", "Clicks", "Revenue", "CTR (%)", "Avg eCPM", "CPC"]],
      body: [[
        formatNumber(totals.adxExchangeLineItemLevelImpressions),
        formatNumber(totals.adxExchangeLineItemLevelClicks),
        fromMicros(totals.adxExchangeLineItemLevelRevenue),
        (totals.adxExchangeLineItemLevelCtr ?? 0).toFixed(2) + "%",
        fromMicros(totals.adxExchangeLineItemLevelAverageECPM),
        fromMicros(totals.adxExchangeCostPerClick),
      ]],
      startY: y + 14,
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fontStyle: "bold" },
    });

    doc.save(fileName);
  }, [headers, body, totals, title, dateRangeLabel, fileName]);

  return (
    <button
      onClick={handleExport}
      disabled={disabled}
      className={[
        "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl",
        "hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl",
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className,
      ].join(" ")}
      title={disabled ? "Export unavailable" : "Export PDF"}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="text-sm font-medium">Export All</span>
    </button>
  );
}

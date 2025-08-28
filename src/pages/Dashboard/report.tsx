import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import PageMeta from "../../components/common/PageMeta";
import { useState } from "react";
import LineChartOne from "../../components/charts/line/LineChartOne";
import AdSenseDashboard from "../AddWebsite/Adsense";
export default function Report() {
  const [adsenseData, setAdsenseData] = useState<any>(null);
  return (
    <>
      <PageMeta
        title="Report Analytics| rudzen tech pvt.ltd"
description="Monitor your AdSense and Google Ad Manager performance in Rudzen’s unified dashboard with real-time analytics, revenue, impressions, CTR, and more."      />
      <div className="space-y-6 grid-cols-12 md:gap-6">
        <div className="col-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics onData={setAdsenseData} />

          {/* <LineChartOne /> */}
        </div>
      </div>
      {/* {adsenseData && (
        <AdSenseDashboard
          rows={adsenseData.rows}
          headers={adsenseData.headers}
          dateRange={adsenseData.dateRange}
          totals={adsenseData.totals}
        />
      )} */}
    </>
  );
}

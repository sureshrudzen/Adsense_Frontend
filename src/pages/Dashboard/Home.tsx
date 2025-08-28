import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import AdSenseDashboard from "../AddWebsite/Adsense";
import DashboardKpi from "../../components/ecommerce/dashboardKpi";
import ConnectAdSenseAccount from "../Adsense/ConnectAdSenseAccount";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Adsens Dashboard"
        description="Monitor your AdSense and Google Ad Manager performance in Rudzen’s unified dashboard with real-time analytics, revenue, impressions, CTR, and more." />
      <div className="">
        <div className="">
          <DashboardKpi />
          {/* <AdSenseDashboard /> */}
          {/* <MonthlySalesChart /> */}
        </div>
        <div>
          <ConnectAdSenseAccount />
        </div>

        {/* <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div> */}
      </div>
    </>
  );
}

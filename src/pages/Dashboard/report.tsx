import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import PageMeta from "../../components/common/PageMeta";
import LineChartOne from "../../components/charts/line/LineChartOne";
export default function Report() {
  return (
    <>
      <PageMeta
        title="Report Analytics| rudzen tech pvt.ltd"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="space-y-6 grid-cols-12 md:gap-6">
        <div className="col-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <LineChartOne />
        </div>
        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}

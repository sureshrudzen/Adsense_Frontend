
import PageMeta from "../../../components/common/PageMeta";
import MainLayoutManager from "../../../components/admanager/MainLayoutManager";

export default function Report() {
    return (
        <>
            <PageMeta
                title="Report Analytics| rudzen tech pvt.ltd"
                description="Monitor your AdSense and Google Ad Manager performance in Rudzen’s unified dashboard with real-time analytics, revenue, impressions, CTR, and more." />
            <div className="space-y-6 grid-cols-12 md:gap-6">
                <div className="col-12 space-y-6 xl:col-span-7">
                    <MainLayoutManager />

                    {/* <LineChartOne /> */}
                </div>
            </div>
        </>
    );
}

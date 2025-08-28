import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import PageMeta from "../components/common/PageMeta";
import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  id: string;
  fname: string;
  lname: string;
  email: string;
  iat: number;
  exp: number;
}

export default function UserProfiles() {
  const [data, setData] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setData(decoded);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    } else {
      console.warn("⚠️ No token found in localStorage!");
    }
  }, []);

  return (
    <>
      <PageMeta
    title="Rudzen Ads Dashboard | AdSense & Ad Manager Insights"
    description="Monitor your AdSense and Google Ad Manager performance in Rudzen’s unified dashboard with real-time analytics, revenue, impressions, CTR, and more."
  />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          {data && (
            <>
              <UserMetaCard data={data} />
              <UserInfoCard data={data} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

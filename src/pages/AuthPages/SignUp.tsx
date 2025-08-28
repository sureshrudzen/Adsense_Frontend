import PageMeta from "../../components/common/PageMeta";

import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
    title="Rudzen Ads Dashboard | AdSense & Ad Manager Insights"
    description="Monitor your AdSense and Google Ad Manager performance in Rudzen’s unified dashboard with real-time analytics, revenue, impressions, CTR, and more."
  />
        <SignUpForm />
    </>
  );
}

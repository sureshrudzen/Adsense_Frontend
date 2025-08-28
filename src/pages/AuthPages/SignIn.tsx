import PageMeta from "../../components/common/PageMeta";
// import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
    title="Rudzen Ads Dashboard | AdSense & Ad Manager Insights"
    description="Monitor your AdSense and Google Ad Manager performance in Rudzen’s unified dashboard with real-time analytics, revenue, impressions, CTR, and more."
  />
   
        <SignInForm />
    </>
  );
}

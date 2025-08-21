
import "react-datepicker/dist/react-datepicker.css";
import ReportViewer from "./ReportViewer";
import { useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}


export default function AdSenseDashboard() {
  const query = useQuery();
  const accountId = query.get("account");


  return (
    <div >
      <div>
        {/* ReportViewer */}
        {accountId ? (
          <ReportViewer accountId={accountId} />
        ) : (
          <p>Loading accounts...</p>
        )}
      </div>
      {/* )} */}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";


interface AdsenseAccount {
  _id?: string;
  accountId: string;
  displayName?: string;
}

interface Props {
  title?: string;
  onConnected?: () => void;
  showIds?: boolean;
}

const ConnectAdSenseAccount: React.FC<Props> = ({
  title = "AdSense Accounts",
  onConnected,
  showIds = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accounts, setAccounts] = useState<AdsenseAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>(""); 
  const qs = useMemo(() => new URLSearchParams(window.location.search), []);

  const fetchAccounts = async () => {
    try {
      const res = await api.get<{ accounts: AdsenseAccount[] }>("/adsense/accounts", {
        withCredentials: true,
      });
      const accs = res.data.accounts || [];
      setAccounts(accs);
      if (accs.length > 0) {
        setSelectedAccount(accs[0].name); // default select first
      }
    } catch (err) {
      console.error("Error fetching accounts", err);
    }
  };

  const connectAdSense = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (qs.get("connected") === "1") {
      fetchAccounts();
      const url = new URL(window.location.href);
      url.searchParams.delete("connected");
      window.history.replaceState({}, "", url);
      onConnected?.();
    }
  }, [qs, onConnected]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-lg border shadow-sm disabled:opacity-50"
            onClick={connectAdSense}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Connect New AdSense"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {accounts?.length > 0 ? (
          accounts.map((a) => (
            <div
              key={a._id || a.accountId}
              className="p-4 rounded-2xl border shadow-sm bg-white"
            >
              <div className="font-medium truncate" title={a.displayName || a.accountId}>
                {a.displayName || "AdSense Account"}
              </div>
              {showIds && (
                <div className="text-xs text-gray-500 mt-1 break-all">{a.accountId}</div>
              )}
              <div className="mt-3 flex gap-2">
                <a
                  href={`#/report?account=${encodeURIComponent(a.accountId)}`}
                  className="text-sm underline"
                >
                  View Report
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-600">
            No accounts connected yet. Click “Connect New AdSense”.
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectAdSenseAccount;

import React, { useState, useEffect } from "react";
import api from "../../utils/api"; 
import "react-datepicker/dist/react-datepicker.css";
import ReportViewer from "./ReportViewer";

interface AdsenseAccount {
  name: string;  // format: "accounts/xxx"
  displayName?: string;
  id?: string;
}

interface User {
  email: string;
  name?: string;
  picture?: string;
}

export default function AdSenseDashboard() {
  const [connected, setConnected] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<AdsenseAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>(""); // ✅ Selected Account
  const [user, setUser] = useState<User | null>(null);

  // ✅ On mount
  useEffect(() => {
    const storedUser = localStorage.getItem("adsense_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser) as User);
      setConnected(true);
    }
  }, []);

  // ✅ Fetch AdSense Accounts
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

  // ✅ Auto fetch when connected
  useEffect(() => {
    if (connected) {
      fetchAccounts();
    }
  }, [connected]);

  return (
    <div className="p-6">
      {!connected ? (
        <a
          href="http://localhost:5000/api/auth/google"
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Connect AdSense
        </a>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">AdSense Connected ✅</h2>
          <p className="mb-4">
            Logged in as: <span className="font-semibold">{user?.email}</span>
          </p>

          {/* 🔽 Account Dropdown */}
          {accounts.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Account</label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="border p-2 rounded w-full"
              >
                {accounts.map((acc) => (
                  <option key={acc.name} value={acc.name}>
                    {acc.displayName || acc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ReportViewer */}
          {selectedAccount ? (
            <ReportViewer accountId={selectedAccount} />
          ) : (
            <p>Loading accounts...</p>
          )}
        </div>
      )}
    </div>
  );
}

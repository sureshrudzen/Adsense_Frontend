import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import {
  fetchAccounts,
  deleteAccount,
  setPage,
  setSearch,
} from "../../features/adsense/adsenseSlice";
import Swal from "sweetalert2";
import Pagination from "../../components/common/Pagination";
const ConnectAdSenseAccount: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { accounts, loading, error, search, page, pageSize } = useSelector(
    (state: RootState) => state.adsense
  );

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  // ✅ Filter + Pagination
  const filteredAccounts = accounts.filter(
    (a) =>
      a.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      a.accountId.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAccounts.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedAccounts = filteredAccounts.slice(
    startIndex,
    startIndex + pageSize
  );

  // ✅ SweetAlert Delete
  const handleDelete = async (accountId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This AdSense account will be removed!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      dispatch(deleteAccount(accountId));
      Swal.fire("Deleted!", "AdSense account has been deleted.", "success");
    }
  };

  return (
    <div className="w-full">
      {/* ✅ Search + Connect */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
        <h3 className="text-lg font-semibold">AdSense Accounts</h3>
        <div className="flex flex-col sm:flex-row ml-auto gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            className="flex-1 px-3 py-2 border rounded-lg shadow-sm text-sm"
          />
          <button
            className="px-3 py-2 rounded-lg border shadow-sm disabled:opacity-50 whitespace-nowrap"
            onClick={() =>
            (window.location.href = `http://localhost:5000/api/auth/google?state=${localStorage.getItem(
              "token"
            )}`)
            }
          >
            Connect New AdSense
          </button>
        </div>
      </div>

      {/* ✅ Error */}
      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* ✅ Table */}
      <div className="overflow-x-auto rounded-2xl shadow-lg">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-left">
              <th className="px-4 py-3 text-xs sm:text-sm border">#</th>
              <th className="px-4 py-3 text-xs sm:text-sm border">Display Name</th>
              <th className="px-4 py-3 text-xs sm:text-sm border">Account Id</th>
              <th className="px-4 py-3 text-xs sm:text-sm border text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedAccounts.map((a, i) => (
              <tr key={a._id || a.accountId} className="hover:bg-gray-50">
                <td className="p-2 sm:p-3 border text-center">
                  {startIndex + i + 1}
                </td>
                <td className="p-2 sm:p-3 border">{a.displayName || "AdSense Account"}</td>
                <td className="p-2 sm:p-3 border">{a.accountId}</td>
                <td className="p-2 sm:p-3 border text-center space-x-2 sm:space-x-3">
                  <a
                    href={`/report?account=${encodeURIComponent(a.accountId)}`}
                    className="inline-block px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    View Report
                  </a>
                  <button
                    onClick={() => handleDelete(a.accountId)}
                    className="inline-block px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination */}
      <div className="mt-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => dispatch(setPage(p))}
        />
      </div>
    </div>
  );
};

export default ConnectAdSenseAccount;

interface Website {
  _id: string;
  name: string;
  url: string;
  description?: string;
}

export default function ShowWebsites({
  websites,
  error,
}: {
  websites: Website[];
  error: string;
}) {
  if (error) return <p className="text-red-600 text-center">{error}</p>;

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🌐 All Websites</h2>

      {websites.length === 0 ? (
        <p className="text-gray-600 text-center italic">
          No websites found. Please add one!
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-left">
                <th className="px-6 py-3 text-sm font-semibold w-16">#</th>
                <th className="px-6 py-3 text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-sm font-semibold">URL</th>
                <th className="px-6 py-3 text-sm font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {websites.map((site, idx) => (
                <tr
                  key={site._id}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition-colors`}
                >
                  <td className="px-6 py-3 text-gray-700 font-medium text-center">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-3 text-gray-800 font-medium">
                    {site.name}
                  </td>
                  <td className="px-6 py-3">
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      {site.url.replace(/^https?:\/\/(www\.)?/, "")}
                    </a>
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {site.description || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

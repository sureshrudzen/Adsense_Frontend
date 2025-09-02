interface Website {
  _id: string;
  url: string;
}

interface ShowWebsitesProps {
  websites: Website[];
  error: string;
  onDelete: (id: string) => void;
}

export default function ShowWebsites({
  websites,
  error,
  onDelete,
}: ShowWebsitesProps) {
  return (
    <div className="md:px-0 max-w-5xl mx-auto">
      {error && (
        <p className="text-red-600 text-center text-lg mt-4 font-medium">{error}</p>
      )}

      {/* List of all websites */}
      <div className="flex flex-col gap-2 mt-4">
        {websites.length === 0 ? (
          <p className="text-gray-500 text-center italic">No websites found.</p>
        ) : (
          websites.map(site => (
            <div
              key={site._id}
              className="flex items-center justify-between border rounded-lg p-2 bg-white hover:shadow"
            >
              <span>{site.url.replace(/^https?:\/\/(www\.)?/, "")}</span>
              <button
                onClick={() => onDelete(site._id)}
                className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

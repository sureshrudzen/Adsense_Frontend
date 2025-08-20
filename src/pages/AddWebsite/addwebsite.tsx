import { useEffect, useState } from "react";
import api from "../../utils/api";
import ShowWebsites from "./ShowWebsites";

interface Website {
    _id: string;
    name: string;
    url: string;
    description?: string;
}

interface WebsiteFormData {
    name: string;
    url: string;
    description: string;
}

export default function AddWebsite() {
    const [websites, setWebsites] = useState<Website[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState<WebsiteFormData>({
        name: "",
        url: "",
        description: "",
    });

    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const fetchWebsites = async () => {
        try {
            const res = await api.get("/web/websites");
            setWebsites(res.data);
        } catch (err: any) {
            setError("❌ Failed to fetch websites");
        }
    };
    useEffect(() => {
        fetchWebsites();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await api.post("/web/websites", formData);

            if (res.status === 200 || res.status === 201) {
                setMessage({ type: "success", text: "✅ Website added successfully!" });
                // Clear form
                setFormData({ name: "", url: "", description: "" });

                fetchWebsites()
            } else {
                setMessage({
                    type: "error",
                    text: `⚠️ Unexpected response: ${res.status}`,
                });
            }
        } catch (err: any) {
            if (err.response) {
                setMessage({
                    type: "error",
                    text: err.response.data.message || `❌ Error: ${err.response.status}`,
                });
            } else {
                setMessage({
                    type: "error",
                    text: "❌ Server not reachable!",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div>
                <h2 className="text-2xl font-semibold mb-4">Add New Website</h2>
                <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
                    {/* Website Name */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-gray-700 font-medium mb-1">Website Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter website name"
                            required
                            className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
                        />
                    </div>

                    {/* Website URL */}
                    <div className="flex-1 min-w-[250px]">
                        <label className="block text-gray-700 font-medium mb-1">Website URL</label>
                        <input
                            type="url"
                            name="url"
                            value={formData.url}
                            onChange={handleChange}
                            required
                            placeholder="https://example.com"
                            className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
                        />
                    </div>

                    {/* Description */}
                    <div className="flex-1 min-w-[250px] mt-1">
                        <label className="block text-gray-700 font-medium mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter decscription (optional)"
                            rows={1}
                            className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200 resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Adding..." : "Add"}
                        </button>
                    </div>
                </form>

                {message && (
                    <p
                        className={`mt-4 text-center text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {message.text}
                    </p>
                )}
            </div>

            {/* ✅ Websites ko props me bhej diya */}
            <div>
                <ShowWebsites websites={websites} error={error} />
            </div>
        </>
    );
}

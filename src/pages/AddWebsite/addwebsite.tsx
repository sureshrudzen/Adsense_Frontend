import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { addWebsite } from "../../features/Wbsite/websiteSlice";

interface AddWebsiteProps {
    websites: string[];
}

export default function AddWebsite({ websites }: AddWebsiteProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [url, setUrl] = useState("");
    const [filtered, setFiltered] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // 🔹 Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleChange = (value: string) => {
        setUrl(value);
        setDropdownOpen(true);

        if (value.trim().length > 0) {
            const filteredSites = websites.filter((site) =>
                site.toLowerCase().includes(value.toLowerCase())
            );
            setFiltered(filteredSites);
            setActiveIndex(0);
        } else {
            setFiltered(websites); // input empty → poora list
            setActiveIndex(0);
        }
    };

    const handleSelect = (site: string) => {
        setUrl(site);
        setDropdownOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!dropdownOpen || filtered.length === 0) return;

        if (e.key === "ArrowDown") {
            setActiveIndex((prev) => (prev + 1) % filtered.length);
        } else if (e.key === "ArrowUp") {
            setActiveIndex((prev) => (prev === 0 ? filtered.length - 1 : prev - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            handleSelect(filtered[activeIndex]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        dispatch(addWebsite(url));
        setUrl("");
        setFiltered([]);
        setDropdownOpen(false);
    };

    const handleFocus = () => {
        setDropdownOpen(true);
        setFiltered(websites); // click pe poora list show
    };

    return (
        <div ref={wrapperRef} className="mx-auto my-8 p-4 bg-white rounded shadow relative">
            <h2 className="text-2xl font-semibold mb-4">Add New Website</h2>

            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="example.com"
                        className="border rounded p-2 w-full z-20 relative"
                        value={url}
                        onChange={(e) => handleChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                    />

                    {/* Dropdown */}
                    {dropdownOpen && filtered.length > 0 && (
                        <ul className="absolute top-full left-0 w-full bg-white border rounded shadow max-h-40 overflow-auto z-10 mt-1">
                            {filtered.map((site, idx) => (
                                <li
                                    key={site}
                                    className={`px-3 py-2 cursor-pointer ${idx === activeIndex ? "bg-blue-100" : "hover:bg-blue-50"
                                        }`}
                                    onClick={() => handleSelect(site)}
                                >
                                    {site}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
                >
                    Add
                </button>
            </form>
        </div>

    );
}

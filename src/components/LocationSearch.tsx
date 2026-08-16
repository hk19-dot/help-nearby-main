import { useState, useRef, useEffect } from "react";
import { Search, MapPin, X } from "lucide-react";

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const LocationSearch = ({ onLocationSelect }: LocationSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchLocation = async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`
      );
      const data: SearchResult[] = await res.json();
      setResults(data);
      setIsOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocation(value), 400);
  };

  const handleSelect = (result: SearchResult) => {
    const name = result.display_name.split(",")[0];
    setQuery(result.display_name);
    setIsOpen(false);
    onLocationSelect(parseFloat(result.lat), parseFloat(result.lon), name);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Search any location (e.g., Hitech City, Mumbai, Delhi)..."
          className="w-full pl-12 pr-10 py-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {loading && (
        <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-xl p-3 text-sm text-muted-foreground z-50">
          Searching...
        </div>
      )}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-xl overflow-hidden shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.place_id}
              onClick={() => handleSelect(r)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0"
            >
              <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span className="text-sm text-foreground line-clamp-2">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}
      {isOpen && results.length === 0 && !loading && query.length >= 3 && (
        <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-xl p-3 text-sm text-muted-foreground z-50">
          No results found
        </div>
      )}
    </div>
  );
};

export default LocationSearch;

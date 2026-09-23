import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  ExternalLink, 
  Loader2, 
  X, 
  Navigation, 
  BookOpen, 
  Coffee, 
  Wifi, 
  Clock, 
  CheckCircle2
} from 'lucide-react';

interface StudySpotsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlaceItem {
  title: string;
  uri: string;
  address?: string;
  snippet?: string;
}

export const StudySpotsModal: React.FC<StudySpotsModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    'Quiet university STEM libraries with 24/7 study access',
    'Quiet coffee shops with fast WiFi and laptop power outlets',
    'Public libraries with private study cubicles and computer labs',
    'Campus engineering student lounges and maker spaces',
  ];

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        fetchSpots('Best quiet academic libraries and study spots near my location', pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setError('Could not retrieve current location. Please enter a city or campus above.');
      }
    );
  };

  const fetchSpots = async (searchQuery: string, lat?: number, lng?: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          latitude: lat ?? userCoords?.lat,
          longitude: lng ?? userCoords?.lng,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to search places with Google Maps');
      }

      const data = await res.json();
      setSummary(data.summary || '');
      setPlaces(data.places || []);
    } catch (err: any) {
      console.error('Maps error:', err);
      setError(err.message || 'Error querying Google Maps Grounding');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    fetchSpots(query.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Campus &amp; STEM Study Spots Finder</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold">
                  Google Maps Grounding
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Find quiet academic libraries, 24/7 study halls, and study cafes with verified Google Maps data.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Search Bar + Geo Location */}
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter university, city, or spot (e.g. UC Berkeley engineering library, Boston 24/7 study cafe)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUseLocation}
                  className="px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  title="Detect nearby libraries via GPS"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-500" />
                  <span>Near Me</span>
                </button>
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search</span>}
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(preset);
                    fetchSpots(preset);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </form>

          {/* Loading */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs text-stone-500 font-medium">
                Querying Google Maps Grounding with gemini-3.5-flash...
              </p>
            </div>
          )}

          {/* Places Results */}
          {!loading && places.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Found {places.length} Study Destinations on Google Maps</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {places.map((place, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-3 group shadow-xs"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {place.title}
                      </h4>
                      {place.address && (
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                          {place.address}
                        </p>
                      )}
                      {place.snippet && (
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 italic mt-2 bg-stone-50 dark:bg-stone-900/60 p-2 rounded-lg border border-stone-200/60 dark:border-stone-800">
                          &quot;{place.snippet}&quot;
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Location</span>
                      </div>
                      {place.uri ? (
                        <a
                          href={place.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>Open in Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-stone-400">Location listed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Guidance Summary */}
          {!loading && summary && (
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Study Recommendations &amp; Tips:
              </span>
              <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
                {summary}
              </div>
            </div>
          )}

          {/* Initial Blank State */}
          {!loading && !summary && places.length === 0 && (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                Discover Perfect Study Environments
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Click &quot;Near Me&quot; to locate academic libraries within minutes of your location, or search by university campus name.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

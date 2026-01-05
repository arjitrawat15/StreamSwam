import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Film, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchDropdownProps {
  onClose: () => void;
}

const suggestions = [
  { id: '1', title: 'Big Buck Bunny', type: 'video' },
  { id: '2', title: 'Sintel', type: 'video' },
  { id: '3', title: 'Tears of Steel', type: 'video' },
  { id: '4', title: 'Elephant Dream', type: 'video' },
];

const SearchDropdown: React.FC<SearchDropdownProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('streamswarm-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (term: string) => {
    if (!term.trim()) return;
    
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('streamswarm-recent-searches', JSON.stringify(updated));
    
    setQuery('');
    setIsFocused(false);
    // Navigate to watch page (since we only have one video)
    navigate('/watch');
  };

  const clearRecent = (term: string) => {
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem('streamswarm-recent-searches', JSON.stringify(updated));
  };

  const filteredSuggestions = query
    ? suggestions.filter(s => s.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div ref={dropdownRef} className="relative flex-1 max-w-lg">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch(query);
            if (e.key === 'Escape') setIsFocused(false);
          }}
          placeholder="Search videos..."
          className="w-full h-12 pl-12 pr-4 rounded-full bg-muted/50 border border-border/50 
                   text-foreground placeholder:text-muted-foreground
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                   transition-all duration-300"
        />
      </div>

      <AnimatePresence>
        {isFocused && (query || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 w-full glass-card overflow-hidden z-50"
          >
            {/* Suggestions */}
            {filteredSuggestions.length > 0 && (
              <div className="p-2 border-b border-border/30">
                <p className="px-3 py-1 text-xs text-muted-foreground uppercase tracking-wide">
                  Suggestions
                </p>
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSearch(suggestion.title)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                             hover:bg-muted/30 transition-colors text-left"
                  >
                    <Film className="w-4 h-4 text-muted-foreground" />
                    <span>{suggestion.title}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && !query && (
              <div className="p-2">
                <p className="px-3 py-1 text-xs text-muted-foreground uppercase tracking-wide">
                  Recent Searches
                </p>
                {recentSearches.map((search) => (
                  <div
                    key={search}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg
                             hover:bg-muted/30 transition-colors group"
                  >
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <button
                      onClick={() => handleSearch(search)}
                      className="flex-1 text-left"
                    >
                      {search}
                    </button>
                    <button
                      onClick={() => clearRecent(search)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 
                               hover:bg-muted/50 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {query && filteredSuggestions.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">
                <p>No results for "{query}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchDropdown;

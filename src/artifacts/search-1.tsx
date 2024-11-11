import React, { useState, useEffect } from 'react';

// Tunable parameters via URL
const params = new URLSearchParams(window.location.search);
const NUM_RESULTS = parseInt(params.get('numResults')) || 100;
const NUM_FILTERS = parseInt(params.get('numFilters')) || 20;
const SIDEBAR_CATEGORIES = parseInt(params.get('sidebarCategories')) || 15;

// Seeded RNG for consistent results
class SeededRNG {
  constructor(seed = 123) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }
}
const rng = new SeededRNG();

const generateResults = () => {
  const results = [];
  for (let i = 0; i < NUM_RESULTS; i++) {
    results.push({
      id: i,
      title: `Result ${i + 1}: ${Array(20).fill().map(() => String.fromCharCode(97 + rng.next() * 26)).join('')}`,
      description: Array(100).fill().map(() => String.fromCharCode(97 + rng.next() * 26)).join(''),
      category: Math.floor(rng.next() * SIDEBAR_CATEGORIES),
      score: rng.next()
    });
  }
  return results;
};

const generateFilters = () => {
  const filters = [];
  for (let i = 0; i < NUM_FILTERS; i++) {
    filters.push({
      id: i,
      name: `Filter ${i + 1}`,
      count: Math.floor(rng.next() * 1000)
    });
  }
  return filters;
};

export default function SearchResults() {
  const [results, setResults] = useState(generateResults());
  const [filters, setFilters] = useState(generateFilters());
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [viewType, setViewType] = useState('list');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const toggleFilter = (id) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(id)) {
      newFilters.delete(id);
    } else {
      newFilters.add(id);
    }
    setActiveFilters(newFilters);
  };

  const filteredResults = results
    .filter(r => selectedCategory === null || r.category === selectedCategory)
    .sort((a, b) => sortBy === 'relevance' ? b.score - a.score : a.title.localeCompare(b.title));

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.shiftKey) {
        if (e.keyCode === 49) window.TESTS[0].test();
        else if (e.keyCode === 50) window.TESTS[1].test();
        else if (e.keyCode === 51) window.TESTS[2].test();
        else if (e.keyCode === 52) window.TESTS[3].test();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  window.TESTS = [
    {
      name: 'ToggleAllFilters',
      test: () => {
        filters.forEach(f => toggleFilter(f.id));
      }
    },
    {
      name: 'CycleCategories',
      test: () => {
        for (let i = 0; i < SIDEBAR_CATEGORIES; i++) {
          setSelectedCategory(i);
        }
        setSelectedCategory(null);
      }
    },
    {
      name: 'ToggleViewsAndSort',
      test: () => {
        setViewType('grid');
        setSortBy('alpha');
        setViewType('list');
        setSortBy('relevance');
      }
    },
    {
      name: 'ToggleSidebarRepeatedly',
      test: () => {
        for (let i = 0; i < 10; i++) {
          setSidebarOpen(!sidebarOpen);
        }
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-blue-600">SearchApp</div>
            <input type="text" className="w-96 px-4 py-2 border rounded-full" defaultValue="example search" />
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setViewType(v => v === 'list' ? 'grid' : 'list')} 
                    className="p-2 rounded hover:bg-gray-100">
              {viewType === 'list' ? 'Grid View' : 'List View'}
            </button>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="p-2 border rounded">
              <option value="relevance">Sort by Relevance</option>
              <option value="alpha">Sort Alphabetically</option>
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex">
        <aside className={`w-64 flex-shrink-0 transition-all duration-200 ${sidebarOpen ? '' : '-ml-64'}`}>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Categories</h3>
              <div className="space-y-2">
                {Array(SIDEBAR_CATEGORIES).fill().map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedCategory(selectedCategory === i ? null : i)}
                    className={`block w-full text-left px-2 py-1 rounded ${
                      selectedCategory === i ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    Category {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Filters</h3>
              <div className="space-y-2">
                {filters.map(filter => (
                  <label key={filter.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={activeFilters.has(filter.id)}
                      onChange={() => toggleFilter(filter.id)}
                      className="rounded text-blue-600"
                    />
                    <span>{filter.name}</span>
                    <span className="text-sm text-gray-500">({filter.count})</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className={`flex-grow transition-all duration-200 ${sidebarOpen ? 'ml-6' : ''}`}>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setSidebarOpen(o => !o)} 
                      className="p-2 rounded hover:bg-gray-100">
                {sidebarOpen ? '← Hide Filters' : '→ Show Filters'}
              </button>
              <div>{filteredResults.length} results</div>
            </div>

            <div className={viewType === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredResults.map(result => (
                <div key={result.id} className={`${
                  viewType === 'grid' 
                    ? 'border rounded p-4 hover:shadow-md transition-shadow'
                    : 'border-b pb-4'
                }`}>
                  <h3 className="text-lg font-medium text-blue-600 hover:underline mb-2">
                    {result.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{result.description}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
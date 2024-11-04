import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Search, X, Filter, ChevronDown, Heart, Share2, BookmarkPlus } from 'lucide-react';

// URL Parameters
const params = new URLSearchParams(window.location.search);
const INITIAL_PINS = parseInt(params.get('initialPins')) || 100;
const COLUMNS = parseInt(params.get('columns')) || 4;
const CATEGORIES = ['All', 'Art', 'Food', 'Travel', 'Fashion', 'DIY', 'Photography'];

// Seeded random number generator
class Random {
  constructor(seed = 1) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }
}
const random = new Random(12345);

// Generate random pin data
const generatePin = (id) => {
  const aspectRatio = 0.8 + random.next() * 0.8;
  return {
    id,
    title: `Pin ${id}`,
    description: `Description for pin ${id} with some extra text to make it realistic`,
    category: CATEGORIES[Math.floor(random.next() * CATEGORIES.length)],
    height: Math.floor(200 + random.next() * 200),
    aspectRatio,
    color: `hsl(${Math.floor(random.next() * 360)}, 70%, 80%)`,
    likes: Math.floor(random.next() * 1000),
    saves: Math.floor(random.next() * 500)
  };
};

const App = () => {
  const [pins, setPins] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const initialPins = Array.from({ length: INITIAL_PINS }, (_, i) => generatePin(i));
    setPins(initialPins);
  }, []);

  // Filter pins based on category and search
  const filteredPins = pins.filter(pin => {
    const matchesCategory = selectedCategory === 'All' || pin.category === selectedCategory;
    const matchesSearch = pin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pin.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Test functions exposed to benchmark runner
  window.TESTS = [
    {
      name: "LoadInitialGrid",
      test: () => {
        setPins(Array.from({ length: INITIAL_PINS }, (_, i) => generatePin(i)));
      }
    },
    {
      name: "FilterByCategory",
      test: () => {
        for (const category of CATEGORIES) {
          setSelectedCategory(category);
        }
      }
    },
    {
      name: "OpenCloseModals",
      test: () => {
        const pinIds = Array.from({ length: 10 }, (_, i) => i);
        for (const id of pinIds) {
          setSelectedPin(pins[id]);
          setSelectedPin(null);
        }
      }
    },
    {
      name: "ToggleSidebarMenus",
      test: () => {
        setSidebarOpen(true);
        setSidebarOpen(false);
      }
    },
    {
      name: "SearchAndFilter",
      test: () => {
        setSearchQuery('pin');
        setSearchQuery('description');
        setSearchQuery('');
      }
    }
  ];

  // Keyboard shortcuts for debug mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key >= '1' && e.key <= '5') {
        const index = parseInt(e.key) - 1;
        window.TESTS[index].test();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pins]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search pins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Filter className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-80 bg-white h-full shadow-lg overflow-y-auto">
            <div className="p-4 border-b">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="p-4">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg mb-1 ${
                    selectedCategory === category ? 'bg-red-500 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </nav>
          </div>
          <div
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-20">
        {/* Category Pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-black text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
            gridAutoRows: '1px'
          }}
        >
          {filteredPins.map(pin => (
            <div
              key={pin.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden cursor-zoom-in"
              style={{
                gridRowEnd: `span ${pin.height}`,
              }}
              onClick={() => setSelectedPin(pin)}
            >
              <div
                className="w-full relative group"
                style={{
                  paddingBottom: `${100 / pin.aspectRatio}%`,
                  backgroundColor: pin.color
                }}
              >
                <div className="absolute inset-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20 flex justify-end">
                  <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                    <BookmarkPlus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-1">{pin.title}</h3>
                <p className="text-sm text-gray-600">{pin.description}</p>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {pin.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookmarkPlus className="w-4 h-4" />
                    {pin.saves}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Pin Modal */}
      {selectedPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-medium">{selectedPin.title}</h2>
              <button
                onClick={() => setSelectedPin(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div
              className="w-full relative"
              style={{
                paddingBottom: `${100 / selectedPin.aspectRatio}%`,
                backgroundColor: selectedPin.color
              }}
            />
            <div className="p-4">
              <p className="text-gray-600 mb-4">{selectedPin.description}</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600">
                  Save
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
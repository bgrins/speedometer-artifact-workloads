import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import _ from 'lodash';

// URL Parameters for tuning
const params = new URLSearchParams(window.location.search);
const NUM_STOCKS = parseInt(params.get('numStocks')) || 100;
const POINTS_PER_CHART = parseInt(params.get('pointsPerChart')) || 100;
const WATCHLIST_SIZE = parseInt(params.get('watchlistSize')) || 20;

// Seeded random number generator
class SeededRNG {
  constructor(seed = 12345) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }
}
const rng = new SeededRNG();

// Generate mock stock data
const generateStockData = (numPoints) => {
  let price = 100 + rng.next() * 900;
  const data = [];
  for (let i = 0; i < numPoints; i++) {
    price *= (0.98 + rng.next() * 0.04);
    data.push({
      time: i,
      price: price,
      volume: Math.floor(rng.next() * 1000000)
    });
  }
  return data;
};

const stockSymbols = Array(NUM_STOCKS).fill().map((_, i) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array(3).fill().map(() => letters[Math.floor(rng.next() * 26)]).join('');
});

const allStocks = stockSymbols.map(symbol => ({
  symbol,
  company: `${symbol} Corporation`,
  sector: ['Tech', 'Finance', 'Healthcare', 'Energy'][Math.floor(rng.next() * 4)],
  price: Math.floor(100 + rng.next() * 900),
  change: (rng.next() * 10 - 5).toFixed(2),
  volume: Math.floor(rng.next() * 1000000),
  chartData: generateStockData(POINTS_PER_CHART)
}));

const TradingPlatform = () => {
  const [selectedStock, setSelectedStock] = useState(allStocks[0]);
  const [watchlist, setWatchlist] = useState(allStocks.slice(0, WATCHLIST_SIZE));
  const [activeTab, setActiveTab] = useState('chart');
  const [chartType, setChartType] = useState('line');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStocks = allStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Expose TESTS for benchmark
  useEffect(() => {
    window.TESTS = [
      {
        name: 'SwitchStocks',
        test: () => {
          for (let i = 0; i < 10; i++) {
            setSelectedStock(allStocks[i]);
          }
        }
      },
      {
        name: 'ToggleChartTypes',
        test: () => {
          setChartType('line');
          setChartType('bar');
          setChartType('line');
          setChartType('bar');
          setChartType('line');
        }
      },
      {
        name: 'UpdateWatchlist',
        test: () => {
          for (let i = WATCHLIST_SIZE; i < WATCHLIST_SIZE * 2; i++) {
            setWatchlist(prev => [...prev.slice(1), allStocks[i]]);
          }
        }
      },
      {
        name: 'FilterSearch',
        test: () => {
          ['A', 'AB', 'ABC', 'ABCD', ''].forEach(term => {
            setSearchTerm(term);
          });
        }
      }
    ];

    // Debug mode keyboard shortcuts
    const handleKeyPress = (e) => {
      if (e.shiftKey && e.keyCode >= 49 && e.keyCode <= 52) {
        window.TESTS[e.keyCode - 49].test();
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <header className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Trading Platform</h1>
          <input
            type="text"
            placeholder="Search stocks..."
            className="px-4 py-2 bg-gray-700 rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>
      
      <div className="flex-1 flex">
        <aside className="w-64 bg-gray-800 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Watchlist</h2>
          <div className="space-y-2">
            {watchlist.map(stock => (
              <div
                key={stock.symbol}
                className="p-2 hover:bg-gray-700 cursor-pointer rounded"
                onClick={() => setSelectedStock(stock)}
              >
                <div className="flex justify-between">
                  <span>{stock.symbol}</span>
                  <span className={stock.change > 0 ? 'text-green-400' : 'text-red-400'}>
                    {stock.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
        
        <main className="flex-1 p-4">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">{selectedStock.company}</h2>
            <div className="flex space-x-4 mt-2">
              <span className="text-xl">${selectedStock.price}</span>
              <span className={selectedStock.change > 0 ? 'text-green-400' : 'text-red-400'}>
                {selectedStock.change}%
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex space-x-4">
              <button
                className={`px-4 py-2 rounded ${chartType === 'line' ? 'bg-blue-500' : 'bg-gray-700'}`}
                onClick={() => setChartType('line')}
              >
                Line
              </button>
              <button
                className={`px-4 py-2 rounded ${chartType === 'bar' ? 'bg-blue-500' : 'bg-gray-700'}`}
                onClick={() => setChartType('bar')}
              >
                Bar
              </button>
            </div>
          </div>
          
          <div className="h-96 bg-gray-800 p-4 rounded">
            {chartType === 'line' ? (
              <LineChart width={800} height={300} data={selectedStock.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#8884d8" />
              </LineChart>
            ) : (
              <BarChart width={800} height={300} data={selectedStock.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="volume" fill="#8884d8" />
              </BarChart>
            )}
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-bold mb-2">Market Overview</h3>
            <div className="grid grid-cols-4 gap-4">
              {filteredStocks.slice(0, 8).map(stock => (
                <div
                  key={stock.symbol}
                  className="p-4 bg-gray-800 rounded cursor-pointer"
                  onClick={() => setSelectedStock(stock)}
                >
                  <div className="font-bold">{stock.symbol}</div>
                  <div className="text-sm text-gray-400">{stock.sector}</div>
                  <div className={stock.change > 0 ? 'text-green-400' : 'text-red-400'}>
                    {stock.change}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TradingPlatform;
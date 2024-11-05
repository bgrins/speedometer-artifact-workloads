import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import _ from 'lodash';

// URL parameters for tuning
const params = new URLSearchParams(window.location.search);
const NUM_STOCKS = parseInt(params.get('numStocks')) || 100;
const NUM_SECTORS = parseInt(params.get('numSectors')) || 11;
const CHART_POINTS = parseInt(params.get('chartPoints')) || 90;

// Seeded random number generator
class Random {
  constructor(seed = 1) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

const rand = new Random(42);

// Generate synthetic market data
const generateStockData = () => {
  const sectors = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Industrial', 'Materials', 'Real Estate', 'Utilities', 'Telecom', 'Discretionary'];
  const stocks = [];
  
  for (let i = 0; i < NUM_STOCKS; i++) {
    const basePrice = 20 + rand.next() * 180;
    const history = [];
    let price = basePrice;
    
    for (let j = 0; j < CHART_POINTS; j++) {
      price *= 1 + (rand.next() - 0.5) * 0.02;
      history.push({ time: j, price: price });
    }
    
    stocks.push({
      symbol: `STK${i.toString().padStart(4, '0')}`,
      name: `Stock ${i}`,
      sector: sectors[i % NUM_SECTORS],
      price: price.toFixed(2),
      change: ((price - basePrice) / basePrice * 100).toFixed(2),
      volume: Math.floor(rand.next() * 10000000),
      history
    });
  }
  return stocks;
};

const App = () => {
  const [stocks, setStocks] = useState(generateStockData());
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedSector, setSelectedSector] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'asc' });
  const [expandedRows, setExpandedRows] = useState(new Set());
  
  const sectors = _.uniq(stocks.map(s => s.sector));
  
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    
    const sorted = _.orderBy(stocks, [key], [direction]);
    setStocks(sorted);
  };
  
  const toggleRow = (symbol) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(symbol)) {
      newExpanded.delete(symbol);
    } else {
      newExpanded.add(symbol);
    }
    setExpandedRows(newExpanded);
  };
  
  const filteredStocks = selectedSector === 'All' 
    ? stocks 
    : stocks.filter(s => s.sector === selectedSector);

  // Expose test interface
  window.TESTS = [
    {
      name: 'SortAllColumns', 
      test: () => {
        const columns = ['symbol', 'price', 'change', 'volume'];
        columns.forEach(col => handleSort(col));
      }
    },
    {
      name: 'ExpandCollapseManyRows',
      test: () => {
        const symbols = stocks.slice(0, 20).map(s => s.symbol);
        symbols.forEach(sym => toggleRow(sym));
        symbols.forEach(sym => toggleRow(sym));
      }
    },
    {
      name: 'FilterAllSectors',
      test: () => {
        sectors.forEach(sector => setSelectedSector(sector));
        setSelectedSector('All');
      }
    },
    {
      name: 'SelectStocksSequentially',
      test: () => {
        const targetStocks = stocks.slice(0, 10);
        targetStocks.forEach(stock => setSelectedStock(stock));
        setSelectedStock(null);
      }
    }
  ];

  // Debug keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.shiftKey && e.keyCode >= 49 && e.keyCode <= 52) {
        window.TESTS[e.keyCode - 49].test();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stocks]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="px-4 py-5">
          <h1 className="text-3xl font-bold text-gray-900">Market Dashboard</h1>
        </div>
      </header>

      <main className="p-4">
        <div className="mb-4 flex gap-2">
          <select 
            className="p-2 border rounded"
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
          >
            <option value="All">All Sectors</option>
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th></th>
                  {['Symbol', 'Price', 'Change %', 'Volume', 'Sector'].map((header, i) => (
                    <th 
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort(['symbol', 'price', 'change', 'volume', 'sector'][i])}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStocks.map((stock) => (
                  <React.Fragment key={stock.symbol}>
                    <tr 
                      className={`hover:bg-gray-50 ${selectedStock?.symbol === stock.symbol ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedStock(stock)}
                    >
                      <td className="px-6 py-4">
                        <button 
                          className="w-4 h-4 text-gray-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(stock.symbol);
                          }}
                        >
                          {expandedRows.has(stock.symbol) ? '▼' : '▶'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{stock.symbol}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${stock.price}</td>
                      <td className={`px-6 py-4 whitespace-nowrap ${parseFloat(stock.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {stock.volume.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{stock.sector}</td>
                    </tr>
                    {expandedRows.has(stock.symbol) && (
                      <tr>
                        <td colSpan="6" className="p-4">
                          <div className="h-64">
                            <LineChart width={800} height={200} data={stock.history}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="time" />
                              <YAxis domain={['auto', 'auto']} />
                              <Tooltip />
                              <Line type="monotone" dataKey="price" stroke="#8884d8" />
                            </LineChart>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedStock && (
          <div className="mt-4 p-4 bg-white shadow rounded-lg">
            <h2 className="text-xl font-bold mb-4">{selectedStock.symbol} Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Price History</h3>
                <LineChart width={400} height={200} data={selectedStock.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#8884d8" />
                </LineChart>
              </div>
              <div>
                <h3 className="font-medium mb-2">Statistics</h3>
                <dl className="grid grid-cols-2 gap-2">
                  <dt className="text-gray-600">Open</dt>
                  <dd>${selectedStock.history[0].price.toFixed(2)}</dd>
                  <dt className="text-gray-600">High</dt>
                  <dd>${Math.max(...selectedStock.history.map(h => h.price)).toFixed(2)}</dd>
                  <dt className="text-gray-600">Low</dt>
                  <dd>${Math.min(...selectedStock.history.map(h => h.price)).toFixed(2)}</dd>
                  <dt className="text-gray-600">Volume</dt>
                  <dd>{selectedStock.volume.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
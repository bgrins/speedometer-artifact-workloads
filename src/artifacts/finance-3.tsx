import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Eye, 
  ChevronLeft,
  AlertOctagon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Generate sample chart data
const generateChartData = () => {
  const data = [];
  let basePrice = 40;
  for (let i = 0; i < 100; i++) {
    basePrice += Math.random() * 2 - 1;
    data.push({
      time: i,
      price: basePrice,
      volume: Math.random() * 1000000
    });
  }
  return data;
};

const watchlistData = [
  { symbol: 'PFE', price: 27.38, change: -2.18, volume: '65,749,517' },
  { symbol: 'WFC', price: 72.30, change: 12.85, volume: '63,689,141' },
  { symbol: 'MQ', price: 3.73, change: 9.06, volume: '53,159,771' },
  { symbol: 'CCL', price: 24.14, change: 7.53, volume: '48,010,994' },
  { symbol: 'BBD', price: 2.41, change: 0.42, volume: '44,371,248' }
];

const TradingPlatform = () => {
  const [chartData] = useState(generateChartData());

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold">TradeApp</div>
          <div className="flex items-center text-sm">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
            <span className="text-green-500">Connected</span>
            <span className="text-gray-400 ml-1">Realtime data</span>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Find a Symbol"
              className="bg-gray-800 pl-8 pr-4 py-2 rounded text-sm w-64"
            />
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-green-500">
            <span className="text-xl">$COMP</span>
            <span className="ml-2">18,983.47</span>
            <span className="ml-2">▲ 544.30 (2.95%)</span>
          </div>
          <span className="text-yellow-500">9:57:48</span>
          <span>until open</span>
          <ExternalLink className="h-5 w-5" />
          <Bell className="h-5 w-5" />
          <Settings className="h-5 w-5" />
          <LogOut className="h-5 w-5" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-72 bg-gray-900 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg">Account Summary</h2>
            <Eye className="h-4 w-4 text-gray-400" />
          </div>
          
          <div className="flex mb-4">
            <button className="flex-1 py-2 text-center">Live Trading</button>
            <button className="flex-1 py-2 text-center bg-yellow-500 rounded">paperMoney®</button>
          </div>

          <select className="w-full bg-gray-800 p-2 rounded mb-4">
            <option>All Accounts</option>
          </select>

          <div className="space-y-4">
            <div>
              <div className="text-gray-400">Account Value</div>
              <div className="text-xl">$200,000.00</div>
            </div>
            <div>
              <div className="text-gray-400">Option Buying Power</div>
              <div>$197,148.50</div>
            </div>
            <div>
              <div className="text-gray-400">Stock Buying Power</div>
              <div>$294,297.00</div>
            </div>
            <div>
              <div className="text-gray-400">Forex Buying Power</div>
              <div>$10,000.00</div>
            </div>
            <div>
              <div className="text-gray-400">Cash</div>
              <div className="text-xl">$200,000.00</div>
            </div>
            <div>
              <div className="text-gray-400">P/L Day $</div>
              <div>$0.00</div>
            </div>
            <div>
              <div className="text-gray-400">P/L Day %</div>
              <div>0%</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-500 bg-opacity-20 rounded">
            <span className="text-yellow-500">These are simulated values.</span>
          </div>

          {/* Watchlist */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg">Watchlist</h2>
              <button className="text-sm px-2 py-1 rounded border border-gray-700">New Watchlist</button>
            </div>
            <div className="text-sm font-medium mb-2">Top10 Active NYSE ▾</div>
            
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left py-2">Symbol</th>
                  <th className="text-right">Mark</th>
                  <th className="text-right">Chng %</th>
                  <th className="text-right">Volume</th>
                </tr>
              </thead>
              <tbody>
                {watchlistData.map((stock) => (
                  <tr key={stock.symbol} className="border-b border-gray-800">
                    <td className="py-2">{stock.symbol}</td>
                    <td className="text-right">{stock.price}</td>
                    <td className={`text-right ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change}%
                    </td>
                    <td className="text-right">{stock.volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex-1 p-4">
          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold">WFC</h1>
                <div className="text-gray-400">WELLS FARGO & CO</div>
                <div className="flex items-center mt-2">
                  <button className="text-sm text-gray-400 mr-4">Add to Watchlist ▾</button>
                  <button className="text-sm text-gray-400 flex items-center">
                    <AlertOctagon className="h-4 w-4 mr-1" /> Create Alert
                  </button>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm">Bid size: 20</div>
                <div className="flex items-center space-x-4">
                  <button className="bg-red-500 px-8 py-2 rounded">Sell</button>
                  <div className="text-2xl">72.30</div>
                  <button className="bg-green-500 px-8 py-2 rounded">Buy</button>
                </div>
                <div className="text-sm mt-1">Ask size: 3</div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4">
              <div className="flex space-x-4 mb-4">
                <button className="text-blue-400 border-b-2 border-blue-400 pb-2">All</button>
                <button className="text-gray-400">Positions</button>
                <button className="text-gray-400">Working</button>
              </div>

              {/* Chart */}
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Line 
                      type="linear" 
                      dataKey="price" 
                      stroke="#22c55e"
                      dot={false}
                      strokeWidth={2}
                    />
                    <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Controls */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-4">
                  <button className="text-gray-400">Studies</button>
                  <button className="text-gray-400">Drawings</button>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="text-gray-400">1Y</button>
                  <button className="text-gray-400">1W</button>
                  <button className="text-gray-400">Settings</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-72 bg-gray-900 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg">All Account Positions</h2>
            <ChevronLeft className="h-4 w-4" />
          </div>

          <div className="flex items-center mb-4">
            <div className="flex-1">
              <div className="flex items-center">
                <span className="mr-2">Activity</span>
                <div className="bg-gray-700 px-2 rounded">2</div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-2">Filled</span>
              <div className="bg-gray-700 px-2 rounded">0</div>
            </div>
            <div className="flex items-center">
              <span className="ml-4">Canceled</span>
              <div className="bg-gray-700 px-2 rounded ml-2">0</div>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left py-2">Time ▲</th>
                <th className="text-center">Side</th>
                <th className="text-right">Pos Effect</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>11/6/24, 2:48:16 PM</td>
                <td className="text-center text-green-500">BUY</td>
                <td className="text-right">TO OPEN</td>
              </tr>
              <tr>
                <td>11/6/24, 2:49:24 PM</td>
                <td className="text-center text-green-500">BUY</td>
                <td className="text-right">TO OPEN</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TradingPlatform;
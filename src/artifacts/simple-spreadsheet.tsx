import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Settings2, Plus, Minus, RefreshCw, Bold, Italic, Underline, 
  AlignLeft, AlignCenter, AlignRight, List, ChevronDown,
  FileText, Download, Share2, Palette, CircleDollarSign, BarChart,
  Filter, Image, Link, Lock
} from 'lucide-react';

const SpreadsheetApp = () => {
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(6);
  const [data, setData] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [formula, setFormula] = useState('');
  const [activeSheet, setActiveSheet] = useState('Sheet1');

  // ... (keeping existing data management functions)
  useEffect(() => {
    const newData = {};
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        newData[`${i}-${j}`] = '';
      }
    }
    setData(newData);
  }, [rows, cols]);

  const colToLetter = (col) => String.fromCharCode(65 + col);
  const cellRefToIndex = (ref) => {
    const col = ref.match(/[A-Z]+/)[0];
    const row = parseInt(ref.match(/\d+/)[0]) - 1;
    return {
      row,
      col: col.split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 65, 0)
    };
  };

  const evaluateFormula = (formula) => {
    if (!formula.startsWith('=')) return formula;
    try {
      let expression = formula.substring(1);
      expression = expression.replace(/[A-Z]+\d+/g, (cellRef) => {
        const { row, col } = cellRefToIndex(cellRef);
        const value = data[`${row}-${col}`] || '0';
        return isNaN(value) ? '0' : value;
      });
      return Function(`return ${expression}`)();
    } catch (error) {
      return '#ERROR';
    }
  };

  const handleCellChange = (row, col, value) => {
    setData(prev => ({
      ...prev,
      [`${row}-${col}`]: value
    }));
  };

  const handleCellClick = (row, col) => {
    setSelectedCell(`${row}-${col}`);
    setFormula(data[`${row}-${col}`]);
  };

  const handleFormulaChange = (e) => {
    setFormula(e.target.value);
    if (selectedCell) {
      handleCellChange(...selectedCell.split('-'), e.target.value);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Menu Bar */}
      <div className="bg-white border-b px-4 py-1">
        <div className="flex items-center space-x-4">
          <FileText className="h-5 w-5 text-gray-600" />
          <div className="flex flex-col">
            <input 
              defaultValue="Untitled spreadsheet" 
              className="font-medium outline-none border-b border-transparent hover:border-gray-300 px-1"
            />
            <div className="flex space-x-4 text-sm text-gray-600">
              <button className="hover:bg-gray-100 px-2 py-1 rounded">File</button>
              <button className="hover:bg-gray-100 px-2 py-1 rounded">Edit</button>
              <button className="hover:bg-gray-100 px-2 py-1 rounded">View</button>
              <button className="hover:bg-gray-100 px-2 py-1 rounded">Insert</button>
              <button className="hover:bg-gray-100 px-2 py-1 rounded">Format</button>
              <button className="hover:bg-gray-100 px-2 py-1 rounded">Tools</button>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <Button variant="outline" size="sm"><Share2 className="h-4 w-4 mr-1" /> Share</Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b px-4 py-1 flex items-center space-x-2">
        <Button variant="ghost" size="icon"><RefreshCw className="h-4 w-4" /></Button>
        <div className="h-4 border-r border-gray-300" />
        <select className="border rounded px-2 py-1 text-sm">
          <option>Arial</option>
          <option>Times New Roman</option>
        </select>
        <select className="border rounded px-2 py-1 text-sm w-16">
          <option>10</option>
          <option>11</option>
          <option>12</option>
        </select>
        <div className="h-4 border-r border-gray-300" />
        <Button variant="ghost" size="icon"><Bold className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon"><Italic className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon"><Underline className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon"><Palette className="h-4 w-4" /></Button>
        <div className="h-4 border-r border-gray-300" />
        <Button variant="ghost" size="icon"><AlignLeft className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon"><AlignCenter className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon"><AlignRight className="h-4 w-4" /></Button>
        <div className="h-4 border-r border-gray-300" />
        <Button variant="ghost" size="icon"><List className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon"><CircleDollarSign className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon"><BarChart className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon"><Filter className="h-4 w-4" /></Button>
      </div>

      {/* Formula Bar */}
      <div className="bg-white border-b px-4 py-1 flex items-center space-x-2">
        <div className="w-10 text-center text-gray-600">fx</div>
        <Input 
          value={formula}
          onChange={handleFormulaChange}
          placeholder="Enter value or formula (e.g., =A1+B1)"
          className="flex-1"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="overflow-auto h-full">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-12 bg-gray-50 p-2 border sticky top-0 z-10"></th>
                {[...Array(cols)].map((_, i) => (
                  <th key={i} className="text-center bg-gray-50 p-2 border font-medium sticky top-0 z-10">
                    {colToLetter(i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(rows)].map((_, row) => (
                <tr key={row}>
                  <td className="text-center bg-gray-50 p-2 border font-medium sticky left-0">{row + 1}</td>
                  {[...Array(cols)].map((_, col) => (
                    <td 
                      key={col}
                      className={`p-0 border ${selectedCell === `${row}-${col}` ? 'bg-blue-50' : ''}`}
                      onClick={() => handleCellClick(row, col)}
                    >
                      <Input
                        value={data[`${row}-${col}`]?.startsWith('=') 
                          ? evaluateFormula(data[`${row}-${col}`])
                          : data[`${row}-${col}`] || ''}
                        onChange={(e) => handleCellChange(row, col, e.target.value)}
                        className="border-0 h-8 focus:ring-0 focus:ring-offset-0"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Sheet Tabs */}
      <div className="bg-white border-t px-4 py-1 flex items-center space-x-2">
        <div className="flex space-x-1">
          {['Sheet1', 'Sheet2', 'Sheet3'].map(sheet => (
            <button
              key={sheet}
              onClick={() => setActiveSheet(sheet)}
              className={`px-4 py-1 text-sm rounded-t border-t border-l border-r ${
                activeSheet === sheet ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent'
              }`}
            >
              {sheet}
            </button>
          ))}
          <Button variant="ghost" size="icon"><Plus className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetApp;
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings2, Plus, Minus, RefreshCw } from 'lucide-react';

const SpreadsheetApp = () => {
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(6);
  const [data, setData] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [formula, setFormula] = useState('');

  // Initialize empty data
  useEffect(() => {
    const newData = {};
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        newData[`${i}-${j}`] = '';
      }
    }
    setData(newData);
  }, [rows, cols]);

  // Convert column number to letter (0 = A, 1 = B, etc.)
  const colToLetter = (col) => String.fromCharCode(65 + col);

  // Convert cell reference (e.g., "A1") to row-col index
  const cellRefToIndex = (ref) => {
    const col = ref.match(/[A-Z]+/)[0];
    const row = parseInt(ref.match(/\d+/)[0]) - 1;
    return {
      row,
      col: col.split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 65, 0)
    };
  };

  // Simple formula evaluator
  const evaluateFormula = (formula) => {
    if (!formula.startsWith('=')) return formula;
    
    try {
      // Remove the '=' sign
      let expression = formula.substring(1);
      
      // Replace cell references with their values
      expression = expression.replace(/[A-Z]+\d+/g, (cellRef) => {
        const { row, col } = cellRefToIndex(cellRef);
        const value = data[`${row}-${col}`] || '0';
        return isNaN(value) ? '0' : value;
      });
      
      // Evaluate basic arithmetic
      // eslint-disable-next-line no-new-func
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

  const addRow = () => setRows(prev => prev + 1);
  const removeRow = () => setRows(prev => Math.max(1, prev - 1));
  const addColumn = () => setCols(prev => prev + 1);
  const removeColumn = () => setCols(prev => Math.max(1, prev - 1));

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>Simple Spreadsheet</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={addRow}><Plus className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={removeRow}><Minus className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={addColumn}><Plus className="rotate-90 h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={removeColumn}><Minus className="rotate-90 h-4 w-4" /></Button>
            <Button variant="outline" size="icon"><Settings2 className="h-4 w-4" /></Button>
          </div>
        </div>
        {selectedCell && (
          <div className="flex items-center space-x-2 mt-4">
            <span className="text-sm font-medium">
              {colToLetter(parseInt(selectedCell.split('-')[1]))}{parseInt(selectedCell.split('-')[0]) + 1}:
            </span>
            <Input 
              value={formula}
              onChange={handleFormulaChange}
              placeholder="Enter value or formula (e.g., =A1+B1)"
              className="flex-1"
            />
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[600px]">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-12 bg-gray-50 p-2 border"></th>
                {[...Array(cols)].map((_, i) => (
                  <th key={i} className="text-center bg-gray-50 p-2 border font-medium">
                    {colToLetter(i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(rows)].map((_, row) => (
                <tr key={row}>
                  <td className="text-center bg-gray-50 p-2 border font-medium">{row + 1}</td>
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
      </CardContent>
    </Card>
  );
};

export default SpreadsheetApp;
import React, { useState } from 'react';
import { Table, X, Plus, Trash2 } from 'lucide-react';

const TableToolbar = ({ onAddTable, onClose }) => {
  const [title, setTitle] = useState('');
  const [headers, setHeaders] = useState(['']);
  const [rows, setRows] = useState([['']]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && headers.some(header => header.trim())) {
      onAddTable({ 
        title: title.trim(), 
        headers: headers.map(h => h.trim()),
        rows: rows.map(row => row.map(cell => cell.trim()))
      });
      onClose();
    }
  };

  const addColumn = () => {
    setHeaders([...headers, '']);
    setRows(rows.map(row => [...row, '']));
  };

  const removeColumn = (index) => {
    if (headers.length > 1) {
      setHeaders(headers.filter((_, i) => i !== index));
      setRows(rows.map(row => row.filter((_, i) => i !== index)));
    }
  };

  const addRow = () => {
    setRows([...rows, Array(headers.length).fill('')]);
  };

  const removeRow = (index) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const updateHeader = (index, value) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const updateCell = (rowIndex, colIndex, value) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Table size={20} className="text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Add Table</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Table Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter table title"
              className="w-full p-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Table Content
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addColumn}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                >
                  <Plus size={16} />
                  Add Column
                </button>
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                >
                  <Plus size={16} />
                  Add Row
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {headers.map((header, index) => (
                      <th key={index} className="p-2 border border-gray-600">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={header}
                            onChange={(e) => updateHeader(index, e.target.value)}
                            placeholder={`Header ${index + 1}`}
                            className="w-full p-1 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeColumn(index)}
                            className="p-1 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-700"
                            disabled={headers.length === 1}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="p-2 border border-gray-600">
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                            placeholder={`Cell ${rowIndex + 1}-${colIndex + 1}`}
                            className="w-full p-1 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>
                      ))}
                      <td className="p-2 border border-gray-600">
                        <button
                          type="button"
                          onClick={() => removeRow(rowIndex)}
                          className="p-1 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-700"
                          disabled={rows.length === 1}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableToolbar; 
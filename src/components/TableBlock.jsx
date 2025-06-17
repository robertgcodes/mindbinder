import React, { useState } from 'react';
import { Table } from 'lucide-react';

const TableBlock = ({ block, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(block.config?.title || '');
  const [headers, setHeaders] = useState(block.config?.headers || ['']);
  const [rows, setRows] = useState(block.config?.rows || [['']]);

  const handleSave = () => {
    onUpdate({
      ...block,
      config: {
        ...block.config,
        title,
        headers: headers.filter(header => header.trim() !== ''),
        rows: rows.map(row => row.filter(cell => cell.trim() !== ''))
      }
    });
    setIsEditing(false);
  };

  const addRow = () => {
    setRows([...rows, Array(headers.length).fill('')]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateCell = (rowIndex, colIndex, value) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
  };

  const updateHeader = (index, value) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const addColumn = () => {
    setHeaders([...headers, '']);
    setRows(rows.map(row => [...row, '']));
  };

  const removeColumn = (index) => {
    setHeaders(headers.filter((_, i) => i !== index));
    setRows(rows.map(row => row.filter((_, i) => i !== index)));
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter table title"
          className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
        />
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
                        className="w-full p-1 bg-gray-700 text-white rounded"
                      />
                      <button
                        onClick={() => removeColumn(index)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </th>
                ))}
                <th className="p-2 border border-gray-600">
                  <button
                    onClick={addColumn}
                    className="w-full px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    +
                  </button>
                </th>
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
                        className="w-full p-1 bg-gray-700 text-white rounded"
                      />
                    </td>
                  ))}
                  <td className="p-2 border border-gray-600">
                    <button
                      onClick={() => removeRow(rowIndex)}
                      className="w-full px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={addRow}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Add Row
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-4 bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-center gap-2 mb-2">
        <Table size={20} className="text-blue-400" />
        <h3 className="text-lg font-semibold text-white">{title || 'Untitled Table'}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="p-2 border border-gray-600 text-white">
                  {header || `Header ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="p-2 border border-gray-600 text-gray-300">
                    {cell || `Cell ${rowIndex + 1}-${colIndex + 1}`}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableBlock; 
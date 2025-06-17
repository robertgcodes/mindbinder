import React from 'react';
import { 
  Type, 
  Link, 
  FileText, 
  List, 
  Code, 
  Table, 
  Calendar,
  Rss,
  X
} from 'lucide-react';

const blockTypes = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'link', label: 'Link', icon: Link },
  { type: 'document', label: 'Document', icon: FileText },
  { type: 'list', label: 'List', icon: List },
  { type: 'code', label: 'Code', icon: Code },
  { type: 'table', label: 'Table', icon: Table },
  { type: 'calendar', label: 'Calendar', icon: Calendar },
  { type: 'rss', label: 'RSS Feed', icon: Rss }
];

const BlockToolbar = ({ onAddBlock, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Add New Block</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {blockTypes.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => {
                onAddBlock(type);
                onClose();
              }}
              className="flex flex-col items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Icon size={24} className="text-blue-400 mb-2" />
              <span className="text-white text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlockToolbar; 
import React, { useState } from 'react';
import { Trash2, RotateCw, Play, Pause, Globe, Calendar, Music, FileSpreadsheet, Video, Eye, EyeOff } from 'lucide-react';

const EmbedBlockToolbar = ({ selectedBlock, onUpdate, onDelete }) => {
  const [tempUrl, setTempUrl] = useState(selectedBlock?.embedUrl || '');
  const [showPreview, setShowPreview] = useState(false);

  if (!selectedBlock) return null;

  const embedTypes = [
    {
      value: 'youtube',
      label: 'YouTube Video',
      icon: <Video className="h-4 w-4" />,
      color: 'bg-red-600',
      description: 'Embed YouTube videos',
      placeholder: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      examples: [
        'https://www.youtube.com/watch?v=VIDEO_ID',
        'https://youtu.be/VIDEO_ID',
        'https://www.youtube.com/embed/VIDEO_ID'
      ]
    },
    {
      value: 'calendar',
      label: 'Google Calendar',
      icon: <Calendar className="h-4 w-4" />,
      color: 'bg-blue-600',
      description: 'Show your Google Calendar',
      placeholder: 'your-email@gmail.com or calendar embed URL',
      examples: [
        'your-email@gmail.com',
        'https://calendar.google.com/calendar/embed?src=...'
      ]
    },
    {
      value: 'spotify',
      label: 'Spotify',
      icon: <Music className="h-4 w-4" />,
      color: 'bg-green-600',
      description: 'Embed Spotify playlists, albums, or tracks',
      placeholder: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd',
      examples: [
        'https://open.spotify.com/playlist/PLAYLIST_ID',
        'https://open.spotify.com/album/ALBUM_ID',
        'https://open.spotify.com/track/TRACK_ID'
      ]
    },
    {
      value: 'sheets',
      label: 'Google Sheets',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      color: 'bg-emerald-600',
      description: 'Display Google Sheets data',
      placeholder: 'https://docs.google.com/spreadsheets/d/SHEET_ID/edit',
      examples: [
        'https://docs.google.com/spreadsheets/d/SHEET_ID/edit'
      ]
    },
    {
      value: 'iframe',
      label: 'Custom Embed',
      icon: <Globe className="h-4 w-4" />,
      color: 'bg-purple-600',
      description: 'Embed any webpage or service',
      placeholder: 'https://example.com or embed URL',
      examples: [
        'https://codepen.io/pen/EMBED_ID',
        'https://www.figma.com/embed?embed_host=share&url=...',
        'Any embeddable URL'
      ]
    }
  ];

  const currentType = embedTypes.find(type => type.value === selectedBlock.embedType) || embedTypes[0];

  const handleTypeChange = (newType) => {
    onUpdate({
      embedType: newType,
      embedUrl: '',
      title: embedTypes.find(t => t.value === newType)?.label || 'Embed Block'
    });
    setTempUrl('');
  };

  const handleUrlUpdate = () => {
    onUpdate({
      embedUrl: tempUrl,
      title: selectedBlock.title || currentType.label
    });
  };

  const handleUrlChange = (value) => {
    setTempUrl(value);
  };

  const backgroundColors = [
    'rgba(255, 255, 255, 0.95)',
    'rgba(248, 250, 252, 0.95)',
    'rgba(241, 245, 249, 0.95)',
    'rgba(226, 232, 240, 0.95)',
    'rgba(15, 23, 42, 0.95)',
    'rgba(30, 41, 59, 0.95)',
    'rgba(51, 65, 85, 0.95)',
    'rgba(71, 85, 105, 0.95)'
  ];

  return (
    <div className="absolute top-20 left-6 z-20 bg-dark-800/95 backdrop-blur-sm border border-dark-700 rounded-lg p-4 shadow-lg min-w-96 max-w-lg max-h-[85vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white flex items-center">
          {currentType.icon}
          <span className="ml-2">Embed Block</span>
        </h3>
        <button
          onClick={onDelete}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
          title="Delete block"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Embed Type Selection */}
      <div className="mb-6 p-4 bg-dark-700/50 rounded-lg border border-dark-600">
        <label className="text-sm font-medium text-white mb-3 block">Embed Type</label>
        <div className="grid grid-cols-1 gap-2">
          {embedTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => handleTypeChange(type.value)}
              className={`flex items-center justify-between p-3 rounded transition-colors ${
                selectedBlock.embedType === type.value 
                  ? `${type.color} text-white` 
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                {type.icon}
                <div className="text-left">
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs opacity-75">{type.description}</div>
                </div>
              </div>
              {selectedBlock.embedType === type.value && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* URL Configuration */}
      <div className="mb-6 p-4 bg-dark-700/50 rounded-lg border border-dark-600">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-white">Configure {currentType.label}</label>
          {selectedBlock.embedUrl && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                showPreview ? 'bg-green-600 text-white' : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
              }`}
            >
              {showPreview ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              <span>{showPreview ? 'Hide' : 'Preview'}</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">URL or Embed Code</label>
            <input
              type="text"
              value={tempUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={currentType.placeholder}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 text-white text-sm rounded focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleUrlUpdate}
              disabled={!tempUrl.trim()}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
            >
              Update Embed
            </button>
            {selectedBlock.embedUrl && (
              <button
                onClick={() => {
                  onUpdate({ embedUrl: '' });
                  setTempUrl('');
                }}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Examples */}
        <div className="mt-4 p-3 bg-dark-900 rounded border border-dark-600">
          <div className="text-xs text-gray-400 mb-2">Example URLs:</div>
          {currentType.examples.map((example, index) => (
            <div key={index} className="text-xs text-gray-500 font-mono mb-1 break-all">
              {example}
            </div>
          ))}
        </div>

        {/* Current embed status */}
        {selectedBlock.embedUrl && (
          <div className="mt-3 p-2 bg-green-900/20 border border-green-600/30 rounded">
            <div className="text-xs text-green-400 font-medium">✓ Embed Active</div>
            <div className="text-xs text-gray-400 mt-1 break-all">{selectedBlock.embedUrl}</div>
          </div>
        )}
      </div>

      {/* Block Settings */}
      <div className="mb-6 p-4 bg-dark-700/50 rounded-lg border border-dark-600">
        <label className="text-sm font-medium text-white mb-3 block">Block Settings</label>
        
        {/* Title */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">Block Title</label>
          <input
            type="text"
            value={selectedBlock.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder={currentType.label}
            className="w-full px-3 py-2 bg-dark-800 border border-dark-600 text-white text-sm rounded focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Show Header Toggle */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400">Show Header</span>
          <button
            onClick={() => onUpdate({ showHeader: !selectedBlock.showHeader })}
            className={`flex items-center space-x-2 px-3 py-1 rounded transition-colors ${
              selectedBlock.showHeader 
                ? 'bg-blue-600 text-white' 
                : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
            }`}
          >
            <span className="text-xs">{selectedBlock.showHeader ? 'Visible' : 'Hidden'}</span>
          </button>
        </div>

        {/* Autoplay for video content */}
        {selectedBlock.embedType === 'youtube' && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400">Autoplay (muted)</span>
            <button
              onClick={() => onUpdate({ autoplay: !selectedBlock.autoplay })}
              className={`flex items-center space-x-2 px-3 py-1 rounded transition-colors ${
                selectedBlock.autoplay 
                  ? 'bg-green-600 text-white' 
                  : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
              }`}
            >
              {selectedBlock.autoplay ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              <span className="text-xs">{selectedBlock.autoplay ? 'On' : 'Off'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Background Color */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Background Color</label>
        <div className="grid grid-cols-4 gap-2">
          {backgroundColors.map((color, index) => (
            <button
              key={index}
              onClick={() => onUpdate({ backgroundColor: color })}
              className={`w-full h-8 rounded border-2 ${
                selectedBlock.backgroundColor === color ? 'border-white' : 'border-dark-600'
              }`}
              style={{ backgroundColor: color.replace('0.95', '1') }}
            />
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Corner Radius</label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="20"
            value={selectedBlock.borderRadius || 8}
            onChange={(e) => onUpdate({ borderRadius: parseInt(e.target.value) })}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-8 text-right">{selectedBlock.borderRadius || 8}px</span>
        </div>
      </div>

      {/* Block Rotation */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Block Rotation</label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="-180"
            max="180"
            value={selectedBlock.rotation || 0}
            onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })}
            className="flex-1"
          />
          <button
            onClick={() => onUpdate({ rotation: 0 })}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Reset rotation"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">{selectedBlock.rotation || 0}°</div>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 mt-4 p-3 bg-dark-900 rounded border border-dark-600">
        <p className="mb-2"><strong>Embed Instructions:</strong></p>
        <p>• <strong>YouTube:</strong> Paste any YouTube URL</p>
        <p>• <strong>Calendar:</strong> Use your Gmail or calendar embed URL</p>
        <p>• <strong>Spotify:</strong> Share link from Spotify app</p>
        <p>• <strong>Sheets:</strong> Make sheet public and paste URL</p>
        <p>• <strong>Custom:</strong> Any embeddable URL or iframe source</p>
        <p className="mt-2 text-amber-400">⚠️ Some sites may block embedding for security</p>
      </div>
    </div>
  );
};

export default EmbedBlockToolbar;

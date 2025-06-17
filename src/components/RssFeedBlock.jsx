import React, { useState, useEffect } from 'react';
import { Group, Text, Rect } from 'react-konva';
import { Globe, RefreshCw } from 'lucide-react';

const RssFeedBlock = ({
  x,
  y,
  width,
  height,
  feedUrl,
  maxItems = 5,
  refreshInterval = 300000, // 5 minutes
  fontSize = 14,
  textColor = '#ffffff',
  backgroundColor = 'rgba(59, 130, 246, 0.1)',
  rotation = 0,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchFeed = async () => {
    if (!feedUrl) return;
    
    setLoading(true);
    setError('');

    try {
      // Use a CORS proxy to fetch the RSS feed
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const response = await fetch(proxyUrl + encodeURIComponent(feedUrl));
      const text = await response.text();
      
      // Parse the XML response
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      
      // Extract feed items
      const feedItems = Array.from(xmlDoc.getElementsByTagName('item')).slice(0, maxItems).map(item => ({
        title: item.getElementsByTagName('title')[0]?.textContent || '',
        link: item.getElementsByTagName('link')[0]?.textContent || '',
        description: item.getElementsByTagName('description')[0]?.textContent || '',
        pubDate: new Date(item.getElementsByTagName('pubDate')[0]?.textContent || '').toLocaleDateString()
      }));

      setItems(feedItems);
    } catch (err) {
      setError('Error loading feed');
      console.error('Error fetching RSS feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, refreshInterval);
    return () => clearInterval(interval);
  }, [feedUrl, maxItems, refreshInterval]);

  const handleRefresh = () => {
    fetchFeed();
  };

  return (
    <Group
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
    >
      {/* Background */}
      <Rect
        width={width}
        height={height}
        fill={backgroundColor}
        cornerRadius={8}
        stroke={isSelected ? '#3b82f6' : 'transparent'}
        strokeWidth={2}
      />

      {/* Header */}
      <Group>
        <Rect
          width={width}
          height={40}
          fill="rgba(0, 0, 0, 0.2)"
          cornerRadius={[8, 8, 0, 0]}
        />
        <Text
          x={12}
          y={12}
          text="RSS Feed"
          fontSize={16}
          fill={textColor}
          fontFamily="Inter"
        />
        <Group
          x={width - 40}
          y={8}
          onClick={handleRefresh}
          onTap={handleRefresh}
        >
          <Rect
            width={24}
            height={24}
            fill="transparent"
            cornerRadius={4}
          />
          <RefreshCw
            className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: loading ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s ease'
            }}
          />
        </Group>
      </Group>

      {/* Content */}
      <Group y={48}>
        {error ? (
          <Text
            x={12}
            y={12}
            text={error}
            fontSize={fontSize}
            fill="#ef4444"
            fontFamily="Inter"
            width={width - 24}
          />
        ) : loading ? (
          <Text
            x={12}
            y={12}
            text="Loading feed..."
            fontSize={fontSize}
            fill={textColor}
            fontFamily="Inter"
          />
        ) : items.length === 0 ? (
          <Text
            x={12}
            y={12}
            text="No feed items available"
            fontSize={fontSize}
            fill={textColor}
            fontFamily="Inter"
          />
        ) : (
          items.map((item, index) => (
            <Group key={index} y={index * 80}>
              <Text
                x={12}
                y={0}
                text={item.title}
                fontSize={fontSize}
                fill={textColor}
                fontFamily="Inter"
                width={width - 24}
                ellipsis
              />
              <Text
                x={12}
                y={24}
                text={item.description.replace(/<[^>]*>/g, '')}
                fontSize={fontSize - 2}
                fill={textColor}
                opacity={0.8}
                fontFamily="Inter"
                width={width - 24}
                height={40}
                ellipsis
              />
              <Text
                x={12}
                y={64}
                text={item.pubDate}
                fontSize={fontSize - 2}
                fill={textColor}
                opacity={0.6}
                fontFamily="Inter"
              />
            </Group>
          ))
        )}
      </Group>
    </Group>
  );
};

export default RssFeedBlock; 
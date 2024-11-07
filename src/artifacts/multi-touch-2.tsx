import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

const TouchDebugger = () => {
  const [touches, setTouches] = useState([]);
  const [lastEvent, setLastEvent] = useState(null);
  const containerRef = useRef(null);

  // Prevent scrolling on the entire document when touching the debug area
  useEffect(() => {
    const preventDefault = (e) => {
      e.preventDefault();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('touchmove', preventDefault, { passive: false });

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const processTouch = (e, eventType) => {
      e.preventDefault();
      e.stopPropagation();
      
      const rect = container.getBoundingClientRect();
      const touchArray = Array.from(e.touches).map(touch => ({
        id: touch.identifier,
        x: touch.clientX - rect.left, // Make coordinates relative to container
        y: touch.clientY - rect.top,
        force: touch.force,
        radiusX: touch.radiusX,
        radiusY: touch.radiusY,
        rotationAngle: touch.rotationAngle,
        altitudeAngle: touch.altitudeAngle,
        azimuthAngle: touch.azimuthAngle
      }));
      
      setTouches(touchArray);
      setLastEvent(eventType);
      
      console.log(`Touch event: ${eventType}`, touchArray); // Debug logging
    };

    const handleTouchStart = (e) => processTouch(e, 'touchstart');
    const handleTouchMove = (e) => processTouch(e, 'touchmove');
    const handleTouchEnd = (e) => processTouch(e, 'touchend');

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  const getTouchColor = (index) => {
    const colors = ['#FF0000', '#0000FF', '#00FF00', '#800080', '#FFA500'];
    return colors[index % colors.length];
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-white p-4">
      <Card className="p-4 mb-4 bg-white shadow-md">
        <h2 className="text-xl font-bold mb-2">Multi-touch Debug Visualizer</h2>
        <p className="text-sm text-gray-600">
          Touch the screen to see touch points and their properties.
          Active touches: {touches.length} | Last event: {lastEvent || 'None'}
        </p>
      </Card>
      
      <div 
        ref={containerRef}
        className="relative flex-grow bg-gray-100 rounded-lg overflow-hidden touch-none select-none"
        style={{ touchAction: 'none' }}
      >
        {touches.map((touch, index) => (
          <React.Fragment key={touch.id}>
            {/* Touch point */}
            <div
              className="absolute w-16 h-16 pointer-events-none"
              style={{
                left: `${touch.x}px`,
                top: `${touch.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Outer ring */}
              <div 
                className="absolute inset-0 rounded-full border-4 animate-ping"
                style={{ borderColor: getTouchColor(index) }}
              />
              {/* Inner dot */}
              <div 
                className="absolute inset-4 rounded-full"
                style={{ backgroundColor: getTouchColor(index) }}
              />
            </div>
            
            {/* Touch data */}
            <div
              className="absolute px-3 py-2 bg-white/90 rounded-lg shadow-lg pointer-events-none"
              style={{
                left: `${touch.x + 40}px`,
                top: `${touch.y + 40}px`,
                color: getTouchColor(index),
                fontSize: '12px',
                fontFamily: 'monospace'
              }}
            >
              <div>ID: {touch.id}</div>
              <div>Force: {touch.force?.toFixed(3) || 'N/A'}</div>
              <div>Radius: {touch.radiusX?.toFixed(1) || 'N/A'}×{touch.radiusY?.toFixed(1) || 'N/A'}</div>
              <div>Rotation: {touch.rotationAngle?.toFixed(1) || 'N/A'}°</div>
              <div>X: {Math.round(touch.x)}, Y: {Math.round(touch.y)}</div>
            </div>
          </React.Fragment>
        ))}

        {touches.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-lg">
            Touch anywhere to begin debugging
          </div>
        )}
      </div>
    </div>
  );
};

export default TouchDebugger;
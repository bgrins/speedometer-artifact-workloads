import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

const TouchDebugger = () => {
  const [touches, setTouches] = useState([]);
  const [lastEvent, setLastEvent] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      e.preventDefault();
      const touchArray = Array.from(e.touches).map(touch => ({
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        force: touch.force,
        radiusX: touch.radiusX,
        radiusY: touch.radiusY,
        rotationAngle: touch.rotationAngle,
        altitudeAngle: touch.altitudeAngle,
        azimuthAngle: touch.azimuthAngle
      }));
      setTouches(touchArray);
      setLastEvent('touchstart');
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touchArray = Array.from(e.touches).map(touch => ({
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        force: touch.force,
        radiusX: touch.radiusX,
        radiusY: touch.radiusY,
        rotationAngle: touch.rotationAngle,
        altitudeAngle: touch.altitudeAngle,
        azimuthAngle: touch.azimuthAngle
      }));
      setTouches(touchArray);
      setLastEvent('touchmove');
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      const touchArray = Array.from(e.touches).map(touch => ({
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        force: touch.force,
        radiusX: touch.radiusX,
        radiusY: touch.radiusY,
        rotationAngle: touch.rotationAngle,
        altitudeAngle: touch.altitudeAngle,
        azimuthAngle: touch.azimuthAngle
      }));
      setTouches(touchArray);
      setLastEvent('touchend');
    };

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
    const colors = ['red', 'blue', 'green', 'purple', 'orange'];
    return colors[index % colors.length];
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Card className="p-4 mb-4">
        <h2 className="text-xl font-bold mb-2">Multi-touch Debug Visualizer</h2>
        <p className="text-sm text-gray-600">
          Touch the screen to see touch points and their properties.
          Last event: {lastEvent || 'None'}
        </p>
      </Card>
      
      <div 
        ref={containerRef}
        className="relative flex-grow bg-gray-100 rounded-lg overflow-hidden touch-none"
      >
        {/* Touch visualization */}
        {touches.map((touch, index) => (
          <React.Fragment key={touch.id}>
            {/* Touch point */}
            <div
              className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 border-2 rounded-full"
              style={{
                left: touch.x,
                top: touch.y,
                borderColor: getTouchColor(index),
                transform: `translate(-50%, -50%) rotate(${touch.rotationAngle || 0}deg)`
              }}
            />
            
            {/* Touch data */}
            <div
              className="absolute px-2 py-1 text-xs bg-white rounded shadow-md"
              style={{
                left: touch.x + 20,
                top: touch.y + 20,
                color: getTouchColor(index)
              }}
            >
              <div>ID: {touch.id}</div>
              <div>Force: {touch.force?.toFixed(3) || 'N/A'}</div>
              <div>Radius: {touch.radiusX?.toFixed(1) || 'N/A'}x{touch.radiusY?.toFixed(1) || 'N/A'}</div>
              <div>Rotation: {touch.rotationAngle?.toFixed(1) || 'N/A'}°</div>
              <div>
                X: {Math.round(touch.x)}, Y: {Math.round(touch.y)}
              </div>
            </div>
          </React.Fragment>
        ))}

        {touches.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            Touch the screen to begin
          </div>
        )}
      </div>
    </div>
  );
};

export default TouchDebugger;
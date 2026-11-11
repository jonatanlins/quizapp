import type React from 'react';

interface CursorProps {
  x: number;
  y: number;
  clicking?: boolean;
  visible?: boolean;
}

export const Cursor: React.FC<CursorProps> = ({ x, y, clicking = false, visible = true }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: `translate(-2px, -2px) scale(${clicking ? 0.9 : 1})`,
        transition: 'transform 0.1s ease',
      }}
    >
      {/* SVG Mouse Pointer */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))',
        }}
      >
        <path
          d="M4.5 3.5L10.5 20.5L13.8 13.8L20.5 10.5L4.5 3.5Z"
          fill="#1e1b18"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>

      {/* Click ripple animation */}
      {clicking && (
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '2px solid #8a6dd5',
            backgroundColor: 'rgba(138, 109, 213, 0.25)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

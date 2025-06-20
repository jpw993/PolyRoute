
"use client";

import React from 'react';

interface GraphSearchAnimationProps {
  className?: string;
}

export function GraphSearchAnimation({ className }: GraphSearchAnimationProps) {
  return (
    <svg
      width="80" // Intrinsic width, can be overridden by className
      height="80" // Intrinsic height, can be overridden by className
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className} // Apply Tailwind classes for sizing and color
    >
      <style>{`
        .graph-node {
          fill: currentColor;
          transition: r 0.3s ease, opacity 0.3s ease;
        }
        .graph-node-center {
          animation: pulseNodeAnim 1.8s infinite ease-in-out;
        }
        .graph-edge {
          stroke: currentColor;
          stroke-width: 1.5; /* Adjusted for better appearance when scaled */
          stroke-linecap: round;
          opacity: 0.4;
        }
        .graph-edge-active {
          stroke-width: 2.5; /* Adjusted for better appearance when scaled */
          opacity: 1;
          animation: drawPathAnim 2s infinite linear;
        }
        @keyframes pulseNodeAnim {
          0%, 100% { r: 5; opacity: 1; }
          50% { r: 7; opacity: 0.7; }
        }
        @keyframes drawPathAnim {
          0% { stroke-dasharray: 0, 200; stroke-dashoffset: 0; opacity: 0.5; } /* Start invisible or faint */
          50% { stroke-dasharray: 100, 200; stroke-dashoffset: -50; opacity: 1; } /* Path appears and moves */
          100% { stroke-dasharray: 0, 200; stroke-dashoffset: -150; opacity: 0.5; } /* Path fades or disappears */
        }
      `}</style>

      {/* Nodes: cx, cy, r */}
      <circle className="graph-node graph-node-center" cx="50" cy="50" r="6" />
      
      <circle className="graph-node" cx="25" cy="25" r="4" />
      <circle className="graph-node" cx="75" cy="25" r="4" />
      <circle className="graph-node" cx="25" cy="75" r="4" />
      <circle className="graph-node" cx="75" cy="75" r="4" />

      <circle className="graph-node" cx="50" cy="15" r="4" />
      <circle className="graph-node" cx="50" cy="85" r="4" />
      <circle className="graph-node" cx="15" cy="50" r="4" />
      <circle className="graph-node" cx="85" cy="50" r="4" />

      {/* Edges: x1, y1, x2, y2 */}
      {/* Edges from center node */}
      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="25" y2="25" style={{ animationDelay: '0s' }}/>
      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="75" y2="25" style={{ animationDelay: '0.25s' }}/>
      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="25" y2="75" style={{ animationDelay: '0.5s' }}/>
      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="75" y2="75" style={{ animationDelay: '0.75s' }}/>

      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="50" y2="15" style={{ animationDelay: '1s' }}/>
      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="15" y2="50" style={{ animationDelay: '1.25s' }}/>
       <line className="graph-edge" x1="50" y1="50" x2="50" y2="85" /> {/* Static example */}
      <line className="graph-edge" x1="50" y1="50" x2="85" y2="50" /> {/* Static example */}


      {/* Edges connecting peripheral nodes */}
      <line className="graph-edge" x1="25" y1="25" x2="50" y2="15" />
      <line className="graph-edge" x1="75" y1="25" x2="50" y2="15" />
      <line className="graph-edge graph-edge-active" x1="25" y1="25" x2="15" y2="50" style={{ animationDelay: '0.1s' }}/>
      <line className="graph-edge graph-edge-active" x1="75" y1="25" x2="85" y2="50" style={{ animationDelay: '0.35s' }}/>
      
      <line className="graph-edge" x1="25" y1="75" x2="15" y2="50" />
      <line className="graph-edge" x1="75" y1="75" x2="85" y2="50" />
      <line className="graph-edge graph-edge-active" x1="25" y1="75" x2="50" y2="85" style={{ animationDelay: '0.6s' }}/>
      <line className="graph-edge graph-edge-active" x1="75" y1="75" x2="50" y2="85" style={{ animationDelay: '0.85s' }}/>
    </svg>
  );
}

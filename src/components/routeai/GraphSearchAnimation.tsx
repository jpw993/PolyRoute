
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

      {/* Center Node */}
      <circle className="graph-node graph-node-center" cx="50" cy="50" r="6" />
      
      {/* Inner Ring Nodes (6 nodes) */}
      <circle className="graph-node" cx="50" cy="25" r="4" /> {/* N1 */}
      <circle className="graph-node" cx="71.6" cy="35" r="4" /> {/* NE1 */}
      <circle className="graph-node" cx="71.6" cy="65" r="4" /> {/* SE1 */}
      <circle className="graph-node" cx="50" cy="75" r="4" /> {/* S1 */}
      <circle className="graph-node" cx="28.4" cy="65" r="4" /> {/* SW1 */}
      <circle className="graph-node" cx="28.4" cy="35" r="4" /> {/* NW1 */}

      {/* Outer Ring Nodes (8 nodes) */}
      <circle className="graph-node" cx="50" cy="10" r="3.5" />  {/* N2 */}
      <circle className="graph-node" cx="80" cy="20" r="3.5" />  {/* NNE2 */}
      <circle className="graph-node" cx="90" cy="50" r="3.5" />  {/* E2 */}
      <circle className="graph-node" cx="80" cy="80" r="3.5" />  {/* SSE2 */}
      <circle className="graph-node" cx="50" cy="90" r="3.5" />  {/* S2 */}
      <circle className="graph-node" cx="20" cy="80" r="3.5" />  {/* SSW2 */}
      <circle className="graph-node" cx="10" cy="50" r="3.5" />  {/* W2 */}
      <circle className="graph-node" cx="20" cy="20" r="3.5" />  {/* NNW2 */}

      {/* Edges from Center to Inner Ring */}
      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="50" y2="25" style={{ animationDelay: '0s' }}/>
      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="71.6" y2="35" style={{ animationDelay: '0.15s' }}/>
      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="71.6" y2="65" style={{ animationDelay: '0.3s' }}/>
      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="50" y2="75" style={{ animationDelay: '0.45s' }}/>
      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="28.4" y2="65" style={{ animationDelay: '0.6s' }}/>
      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="28.4" y2="35" style={{ animationDelay: '0.75s' }}/>

      {/* Edges connecting Inner Ring nodes */}
      <line className="graph-edge" x1="50" y1="25" x2="71.6" y2="35"/>
      <line className="graph-edge" x1="71.6" y1="35" x2="71.6" y2="65"/>
      <line className="graph-edge" x1="71.6" y1="65" x2="50" y2="75"/>
      <line className="graph-edge" x1="50" y1="75" x2="28.4" y2="65"/>
      <line className="graph-edge" x1="28.4" y1="65" x2="28.4" y2="35"/>
      <line className="graph-edge" x1="28.4" y1="35" x2="50" y2="25"/>

      {/* Edges from Inner Ring to Outer Ring (some animated) */}
      <line className="graph-edge graph-edge-active" x1="50" y1="25" x2="50" y2="10" style={{ animationDelay: '0.9s' }}/> {/* N1 to N2 */}
      <line className="graph-edge" x1="50" y1="25" x2="20" y2="20"/> {/* N1 to NNW2 */}
      <line className="graph-edge" x1="71.6" y1="35" x2="80" y2="20" /> {/* NE1 to NNE2 */}
      <line className="graph-edge graph-edge-active" x1="71.6" y1="35" x2="90" y2="50" style={{ animationDelay: '1.05s' }}/> {/* NE1 to E2 */}
      <line className="graph-edge" x1="71.6" y1="65" x2="90" y2="50" /> {/* SE1 to E2 */}
      <line className="graph-edge" x1="71.6" y1="65" x2="80" y2="80" /> {/* SE1 to SSE2 */}
      <line className="graph-edge graph-edge-active" x1="50" y1="75" x2="50" y2="90" style={{ animationDelay: '1.2s' }}/> {/* S1 to S2 */}
      <line className="graph-edge" x1="50" y1="75" x2="80" y2="80"/> {/* S1 to SSE2 */}
      <line className="graph-edge" x1="28.4" y1="65" x2="20" y2="80" /> {/* SW1 to SSW2 */}
      <line className="graph-edge graph-edge-active" x1="28.4" y1="65" x2="10" y2="50" style={{ animationDelay: '1.35s' }}/> {/* SW1 to W2 */}
      <line className="graph-edge" x1="28.4" y1="35" x2="10" y2="50" /> {/* NW1 to W2 */}
      <line className="graph-edge" x1="28.4" y1="35" x2="20" y2="20" /> {/* NW1 to NNW2 */}

      {/* Edges connecting Outer Ring nodes (some animated) */}
      <line className="graph-edge" x1="50" y1="10" x2="80" y2="20" />
      <line className="graph-edge" x1="80" y1="20" x2="90" y2="50" />
      <line className="graph-edge graph-edge-active" x1="90" y1="50" x2="80" y2="80" style={{ animationDelay: '1.5s' }}/>
      <line className="graph-edge" x1="80" y1="80" x2="50" y2="90" />
      <line className="graph-edge" x1="50" y1="90" x2="20" y2="80" />
      <line className="graph-edge graph-edge-active" x1="20" y1="80" x2="10" y2="50" style={{ animationDelay: '1.65s' }}/>
      <line className="graph-edge" x1="10" y1="50" x2="20" y2="20" />
      <line className="graph-edge" x1="20" y1="20" x2="50" y2="10" />
    </svg>
  );
}

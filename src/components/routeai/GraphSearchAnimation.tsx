
"use client";

import React from 'react';

interface GraphSearchAnimationProps {
  className?: string;
}

export function GraphSearchAnimation({ className }: GraphSearchAnimationProps) {
  // Helper to generate node coordinates for a ring
  const getRingNodes = (count: number, radius: number, offsetAngleDeg: number = 0) => {
    const nodes = [];
    const angleStep = 360 / count;
    for (let i = 0; i < count; i++) {
      const angleDeg = i * angleStep + offsetAngleDeg;
      const angleRad = (angleDeg * Math.PI) / 180;
      nodes.push({
        cx: 50 + radius * Math.cos(angleRad),
        cy: 50 - radius * Math.sin(angleRad), // SVG y-axis is inverted
      });
    }
    return nodes;
  };

  const ring1Nodes = getRingNodes(6, 22); // Radius 22
  const ring2Nodes = getRingNodes(20, 36, 9); // Radius 36, 20 nodes, slight offset
  const ring3Nodes = getRingNodes(32, 47, 18); // Radius 47, 32 nodes, further offset

  // Define edges: [fromNodeIdx, toNodeIdx, fromRing, toRing, isAnimated, delayFactor]
  // Ring indices: 0=center, 1=ring1, 2=ring2, 3=ring3
  const edges = [
    // Center to Ring 1 (Animated)
    ...ring1Nodes.map((_, i) => ({ from: {ring:0, idx:0}, to: {ring:1, idx:i}, animated: true, delay: i * 0.1 })),
    
    // Ring 1 to Ring 2 (Some Animated)
    { from: {ring:1, idx:0}, to: {ring:2, idx:0}, animated: true, delay: 0.6 },
    { from: {ring:1, idx:0}, to: {ring:2, idx:1}, animated: false },
    { from: {ring:1, idx:0}, to: {ring:2, idx:19}, animated: false },
    { from: {ring:1, idx:1}, to: {ring:2, idx:2}, animated: true, delay: 0.7 },
    { from: {ring:1, idx:1}, to: {ring:2, idx:3}, animated: false },
    { from: {ring:1, idx:1}, to: {ring:2, idx:4}, animated: true, delay: 0.75 },
    { from: {ring:1, idx:2}, to: {ring:2, idx:5}, animated: false },
    { from: {ring:1, idx:2}, to: {ring:2, idx:6}, animated: true, delay: 0.8 },
    { from: {ring:1, idx:2}, to: {ring:2, idx:7}, animated: false },
    { from: {ring:1, idx:3}, to: {ring:2, idx:8}, animated: true, delay: 0.9 },
    { from: {ring:1, idx:3}, to: {ring:2, idx:9}, animated: false },
    { from: {ring:1, idx:3}, to: {ring:2, idx:10}, animated: true, delay: 0.95 },
    { from: {ring:1, idx:4}, to: {ring:2, idx:11}, animated: false },
    { from: {ring:1, idx:4}, to: {ring:2, idx:12}, animated: true, delay: 1.0 },
    { from: {ring:1, idx:4}, to: {ring:2, idx:13}, animated: false },
    { from: {ring:1, idx:5}, to: {ring:2, idx:14}, animated: true, delay: 1.1 },
    { from: {ring:1, idx:5}, to: {ring:2, idx:15}, animated: false },
    { from: {ring:1, idx:5}, to: {ring:2, idx:16}, animated: true, delay: 1.15 },
    { from: {ring:1, idx:0}, to: {ring:2, idx:17}, animated: false }, // connect back
    { from: {ring:1, idx:0}, to: {ring:2, idx:18}, animated: false },


    // Ring 2 to Ring 3 (Some Animated)
    ...[0,3,6,9,12,15,18].map(i => ({ from: {ring:2, idx:i}, to: {ring:3, idx:i}, animated: true, delay: 1.2 + i*0.05})),
    ...[1,4,7,10,13,16,19].map(i => ({ from: {ring:2, idx:i}, to: {ring:3, idx:i+1}, animated: true, delay: 1.25 + i*0.05})),
    ...[2,5,8,11,14,17].map(i => ({ from: {ring:2, idx:i}, to: {ring:3, idx:i+2}, animated: true, delay: 1.3 + i*0.05})),
    // Add some non-animated connections for density
    { from: {ring:2, idx:0}, to: {ring:3, idx:31}, animated: false },
    { from: {ring:2, idx:1}, to: {ring:3, idx:2}, animated: false },
    { from: {ring:2, idx:2}, to: {ring:3, idx:4}, animated: false },
    { from: {ring:2, idx:5}, to: {ring:3, idx:8}, animated: true, delay: 1.8},
    { from: {ring:2, idx:8}, to: {ring:3, idx:12}, animated: false },
    { from: {ring:2, idx:10}, to: {ring:3, idx:15}, animated: true, delay: 1.9},
    { from: {ring:2, idx:13}, to: {ring:3, idx:19}, animated: false },
    { from: {ring:2, idx:15}, to: {ring:3, idx:22}, animated: true, delay: 2.0},
    { from: {ring:2, idx:18}, to: {ring:3, idx:27}, animated: false },
    { from: {ring:2, idx:19}, to: {ring:3, idx:30}, animated: true, delay: 2.1},


    // Intra-ring connections (mostly non-animated for visual structure)
    // Ring 1
    ...ring1Nodes.map((_,i) => ({from: {ring:1, idx:i}, to: {ring:1, idx:(i+1)%6}, animated: false})),
    // Ring 2
    ...ring2Nodes.map((_,i) => ({from: {ring:2, idx:i}, to: {ring:2, idx:(i+1)%20}, animated: false})),
    // Ring 3
    ...ring3Nodes.map((_,i) => ({from: {ring:3, idx:i}, to: {ring:3, idx:(i+1)%32}, animated: (i%4===0), delay: 1.5 + i*0.03})), // Some animated in Ring 3
  ];

  const nodeCollections = [
    [{ cx: 50, cy: 50 }], // Center node
    ring1Nodes,
    ring2Nodes,
    ring3Nodes,
  ];

  const getNodeCoords = (ringIdx: number, nodeIdx: number) => {
    if (ringIdx === 0) return nodeCollections[0][0]; // Center node
    return nodeCollections[ringIdx][nodeIdx];
  };


  return (
    <svg
      width="100" 
      height="100" 
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className} 
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
          stroke-width: 0.5; 
          stroke-linecap: round;
          opacity: 0.2;
        }
        .graph-edge-active {
          stroke-width: 0.75; 
          opacity: 0.7;
          animation: drawPathAnim 2.2s infinite linear;
        }
        @keyframes pulseNodeAnim {
          0%, 100% { r: 4; opacity: 1; } /* Reduced center node size */
          50% { r: 5; opacity: 0.7; }
        }
        @keyframes drawPathAnim {
          0% { stroke-dasharray: 0, 100; stroke-dashoffset: 0; opacity: 0.3; }
          50% { stroke-dasharray: 50, 100; stroke-dashoffset: -25; opacity: 0.9; }
          100% { stroke-dasharray: 0, 100; stroke-dashoffset: -75; opacity: 0.3; }
        }
      `}</style>

      {/* Render Edges */}
      {edges.map((edge, index) => {
        const n1 = getNodeCoords(edge.from.ring, edge.from.idx);
        const n2 = getNodeCoords(edge.to.ring, edge.to.idx);
        if (!n1 || !n2) return null;
        return (
          <line
            key={`edge-${index}`}
            className={`graph-edge ${edge.animated ? 'graph-edge-active' : ''}`}
            x1={n1.cx}
            y1={n1.cy}
            x2={n2.cx}
            y2={n2.cy}
            style={edge.animated && edge.delay ? { animationDelay: `${edge.delay}s` } : {}}
          />
        );
      })}

      {/* Center Node */}
      <circle className="graph-node graph-node-center" cx="50" cy="50" r="4" />
      
      {/* Ring 1 Nodes (r=3.5) */}
      {ring1Nodes.map((node, i) => (
        <circle key={`r1-${i}`} className="graph-node" cx={node.cx} cy={node.cy} r="3.5" />
      ))}

      {/* Ring 2 Nodes (r=2.5) */}
      {ring2Nodes.map((node, i) => (
        <circle key={`r2-${i}`} className="graph-node" cx={node.cx} cy={node.cy} r="2.5" />
      ))}

      {/* Ring 3 Nodes (r=2) */}
      {ring3Nodes.map((node, i) => (
        <circle key={`r3-${i}`} className="graph-node" cx={node.cx} cy={node.cy} r="2" />
      ))}
      
    </svg>
  );
}

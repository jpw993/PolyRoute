
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

  const ring1Nodes = getRingNodes(6, 22, 0);    // 6 nodes, radius 22
  const ring2Nodes = getRingNodes(24, 32, 15);  // 24 nodes, radius 32
  const ring3Nodes = getRingNodes(40, 40, 7.5); // 40 nodes, radius 40
  const ring4Nodes = getRingNodes(56, 47, 3);   // 56 nodes, radius 47


  // Define edges: { from: {ring, idx}, to: {ring, idx}, animated, delay }
  // Ring indices: 0=center, 1=ring1, 2=ring2, 3=ring3, 4=ring4
  const edges = [
    // Center to Ring 1 (Animated)
    ...ring1Nodes.map((_, i) => ({ from: {ring:0, idx:0}, to: {ring:1, idx:i}, animated: true, delay: i * 0.08 })),
    
    // Ring 1 to Ring 2
    ...ring1Nodes.flatMap((_, r1Idx) => 
      [0,1,2,3].map(offset => ({ 
        from: {ring:1, idx:r1Idx}, 
        to: {ring:2, idx:(r1Idx * 4 + offset) % ring2Nodes.length}, 
        animated: offset < 2, // Animate first 2 connections from each R1 node
        delay: 0.5 + r1Idx * 0.1 + offset * 0.05 
      }))
    ),

    // Ring 2 to Ring 3
    ...ring2Nodes.flatMap((_, r2Idx) => {
      const connections = [];
      // Connect each R2 node to ~2 R3 nodes
      const r3StartIdx = Math.floor(r2Idx * (ring3Nodes.length / ring2Nodes.length));
      connections.push({
        from: {ring:2, idx:r2Idx},
        to: {ring:3, idx: (r3StartIdx) % ring3Nodes.length},
        animated: r2Idx % 3 === 0, // Animate some
        delay: 1.0 + r2Idx * 0.04
      });
      connections.push({
        from: {ring:2, idx:r2Idx},
        to: {ring:3, idx: (r3StartIdx + 1) % ring3Nodes.length},
        animated: r2Idx % 3 === 1, // Animate some
        delay: 1.05 + r2Idx * 0.04
      });
      // Add a few more non-animated for density
      if (r2Idx % 4 === 0) {
        connections.push({
          from: {ring:2, idx:r2Idx},
          to: {ring:3, idx: (r3StartIdx + 2) % ring3Nodes.length},
          animated: false
        });
      }
      return connections;
    }),

    // Ring 3 to Ring 4
     ...ring3Nodes.flatMap((_, r3Idx) => {
      const connections = [];
      const r4StartIdx = Math.floor(r3Idx * (ring4Nodes.length / ring3Nodes.length));
      connections.push({
        from: {ring:3, idx:r3Idx},
        to: {ring:4, idx: (r4StartIdx) % ring4Nodes.length},
        animated: r3Idx % 4 === 0, 
        delay: 1.5 + r3Idx * 0.03
      });
      connections.push({
        from: {ring:3, idx:r3Idx},
        to: {ring:4, idx: (r4StartIdx + 1) % ring4Nodes.length},
        animated: r3Idx % 4 === 2,
        delay: 1.55 + r3Idx * 0.03
      });
       if (r3Idx % 5 === 0) {
        connections.push({
          from: {ring:3, idx:r3Idx},
          to: {ring:4, idx: (r4StartIdx + 2) % ring4Nodes.length},
          animated: false
        });
      }
      return connections;
    }),

    // Intra-ring connections (mostly non-animated for visual structure)
    // Ring 1 (Animated)
    ...ring1Nodes.map((_,i) => ({from: {ring:1, idx:i}, to: {ring:1, idx:(i+1)%ring1Nodes.length}, animated: true, delay: 0.3 + i*0.1})),
    // Ring 2
    ...ring2Nodes.map((_,i) => ({from: {ring:2, idx:i}, to: {ring:2, idx:(i+1)%ring2Nodes.length}, animated: (i%5===0), delay: 0.8 + i*0.05})),
    // Ring 3
    ...ring3Nodes.map((_,i) => ({from: {ring:3, idx:i}, to: {ring:3, idx:(i+1)%ring3Nodes.length}, animated: (i%6===0), delay: 1.2 + i*0.04})),
    // Ring 4
    ...ring4Nodes.map((_,i) => ({from: {ring:4, idx:i}, to: {ring:4, idx:(i+1)%ring4Nodes.length}, animated: (i%8===0), delay: 1.7 + i*0.03})),
  ];

  const nodeCollections = [
    [{ cx: 50, cy: 50 }], // Center node
    ring1Nodes,
    ring2Nodes,
    ring3Nodes,
    ring4Nodes,
  ];

  const getNodeCoords = (ringIdx: number, nodeIdx: number) => {
    if (ringIdx < 0 || ringIdx >= nodeCollections.length) return null;
    const ring = nodeCollections[ringIdx];
    if (nodeIdx < 0 || nodeIdx >= ring.length) return null;
    return ring[nodeIdx];
  };


  return (
    <svg
      width="100%" 
      height="100%" 
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className} 
      preserveAspectRatio="xMidYMid meet"
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
          stroke-width: 0.3; 
          stroke-linecap: round;
          opacity: 0.15;
        }
        .graph-edge-active {
          stroke-width: 0.5; 
          opacity: 0.6;
          animation: drawPathAnim 2.5s infinite linear;
        }
        @keyframes pulseNodeAnim {
          0%, 100% { r: 3.5; opacity: 1; } 
          50% { r: 4.5; opacity: 0.7; }
        }
        @keyframes drawPathAnim {
          0% { stroke-dasharray: 0, 100; stroke-dashoffset: 0; opacity: 0.2; }
          50% { stroke-dasharray: 50, 100; stroke-dashoffset: -25; opacity: 0.8; }
          100% { stroke-dasharray: 0, 100; stroke-dashoffset: -75; opacity: 0.2; }
        }
      `}</style>

      {/* Render Edges */}
      {edges.map((edge, index) => {
        const n1 = getNodeCoords(edge.from.ring, edge.from.idx);
        const n2 = getNodeCoords(edge.to.ring, edge.to.idx);
        if (!n1 || !n2) return null; // Skip if node coords are invalid
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

      {/* Center Node (r=3.5) */}
      <circle className="graph-node graph-node-center" cx="50" cy="50" r="3.5" />
      
      {/* Ring 1 Nodes (r=3) */}
      {ring1Nodes.map((node, i) => (
        <circle key={`r1-${i}`} className="graph-node" cx={node.cx} cy={node.cy} r="3" />
      ))}

      {/* Ring 2 Nodes (r=2.5) */}
      {ring2Nodes.map((node, i) => (
        <circle key={`r2-${i}`} className="graph-node" cx={node.cx} cy={node.cy} r="2.5" />
      ))}

      {/* Ring 3 Nodes (r=2) */}
      {ring3Nodes.map((node, i) => (
        <circle key={`r3-${i}`} className="graph-node" cx={node.cx} cy={node.cy} r="2" />
      ))}

      {/* Ring 4 Nodes (r=1.5) */}
      {ring4Nodes.map((node, i) => (
        <circle key={`r4-${i}`} className="graph-node" cx={node.cx} cy={node.cy} r="1.5" />
      ))}
      
    </svg>
  );
}


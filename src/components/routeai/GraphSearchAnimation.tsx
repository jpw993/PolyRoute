
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

  const ring1Nodes = getRingNodes(8, 18, 0);     // 8 nodes, radius 18
  const ring2Nodes = getRingNodes(16, 25, 11.25); // 16 nodes, radius 25
  const ring3Nodes = getRingNodes(32, 32, 5.625); // 32 nodes, radius 32
  const ring4Nodes = getRingNodes(48, 39, 3.75);  // 48 nodes, radius 39
  const ring5Nodes = getRingNodes(64, 45, 2.8125); // 64 nodes, radius 45
  const ring6Nodes = getRingNodes(80, 49, 1.125);  // 80 nodes, radius 49 (very outer)


  // Define edges: { from: {ring, idx}, to: {ring, idx}, animated, delay }
  // Ring indices: 0=center, 1=ring1, ..., 6=ring6
  const edges = [
    // Center to Ring 1 (Animated)
    ...ring1Nodes.map((_, i) => ({ from: {ring:0, idx:0}, to: {ring:1, idx:i}, animated: true, delay: i * 0.06 })),
    
    // Ring 1 to Ring 2
    ...ring1Nodes.flatMap((_, r1Idx) => 
      [0,1].map(offset => ({ 
        from: {ring:1, idx:r1Idx}, 
        to: {ring:2, idx:(r1Idx * 2 + offset) % ring2Nodes.length}, 
        animated: offset < 1, 
        delay: 0.4 + r1Idx * 0.08 + offset * 0.04 
      }))
    ),

    // Ring 2 to Ring 3
    ...ring2Nodes.flatMap((_, r2Idx) => {
      const connections = [];
      const r3StartIdx = Math.floor(r2Idx * (ring3Nodes.length / ring2Nodes.length));
      connections.push({
        from: {ring:2, idx:r2Idx},
        to: {ring:3, idx: (r3StartIdx) % ring3Nodes.length},
        animated: r2Idx % 2 === 0, 
        delay: 0.7 + r2Idx * 0.03
      });
      connections.push({
        from: {ring:2, idx:r2Idx},
        to: {ring:3, idx: (r3StartIdx + 1) % ring3Nodes.length},
        animated: r2Idx % 2 === 1, 
        delay: 0.72 + r2Idx * 0.03
      });
      if (r2Idx % 4 === 0) { // Add some non-animated for density
          connections.push({ from: {ring:2, idx:r2Idx}, to: {ring:3, idx:(r3StartIdx + 2) % ring3Nodes.length}, animated: false });
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
        animated: r3Idx % 3 === 0, 
        delay: 1.0 + r3Idx * 0.025
      });
       if (r3Idx % 3 === 1) { // Add more animated with slight variation
        connections.push({
          from: {ring:3, idx:r3Idx},
          to: {ring:4, idx: (r4StartIdx + 1) % ring4Nodes.length},
          animated: true,
          delay: 1.02 + r3Idx * 0.025
        });
      }
      if (r3Idx % 5 === 0) { // Non-animated for density
        connections.push({ from: {ring:3, idx:r3Idx}, to: {ring:4, idx:(r4StartIdx + 2) % ring4Nodes.length}, animated: false });
      }
      return connections;
    }),
    
    // Ring 4 to Ring 5
     ...ring4Nodes.flatMap((_, r4Idx) => {
      const connections = [];
      const r5StartIdx = Math.floor(r4Idx * (ring5Nodes.length / ring4Nodes.length));
      connections.push({
        from: {ring:4, idx:r4Idx},
        to: {ring:5, idx: (r5StartIdx) % ring5Nodes.length},
        animated: r4Idx % 4 === 0, 
        delay: 1.3 + r4Idx * 0.02
      });
      if (r4Idx % 4 === 2) { 
        connections.push({
          from: {ring:4, idx:r4Idx},
          to: {ring:5, idx: (r5StartIdx + 1) % ring5Nodes.length},
          animated: true,
          delay: 1.32 + r4Idx * 0.02
        });
      }
      if (r4Idx % 6 === 0) { // Non-animated for density
        connections.push({ from: {ring:4, idx:r4Idx}, to: {ring:5, idx:(r5StartIdx + 2) % ring5Nodes.length}, animated: false });
      }
      return connections;
    }),

    // Ring 5 to Ring 6
     ...ring5Nodes.flatMap((_, r5Idx) => {
      const connections = [];
      const r6StartIdx = Math.floor(r5Idx * (ring6Nodes.length / ring5Nodes.length));
      connections.push({
        from: {ring:5, idx:r5Idx},
        to: {ring:6, idx: (r6StartIdx) % ring6Nodes.length},
        animated: r5Idx % 5 === 0, 
        delay: 1.6 + r5Idx * 0.015
      });
       if (r5Idx % 5 === 3) { 
        connections.push({
          from: {ring:5, idx:r5Idx},
          to: {ring:6, idx: (r6StartIdx + 1) % ring6Nodes.length},
          animated: true,
          delay: 1.62 + r5Idx * 0.015
        });
      }
      if (r5Idx % 8 === 0) { // Non-animated for density
        connections.push({ from: {ring:5, idx:r5Idx}, to: {ring:6, idx:(r6StartIdx + 2) % ring6Nodes.length}, animated: false });
      }
      return connections;
    }),

    // Intra-ring connections
    ...ring1Nodes.map((_,i) => ({from: {ring:1, idx:i}, to: {ring:1, idx:(i+1)%ring1Nodes.length}, animated: true, delay: 0.2 + i*0.08})),
    ...ring2Nodes.map((_,i) => ({from: {ring:2, idx:i}, to: {ring:2, idx:(i+1)%ring2Nodes.length}, animated: (i%4===0), delay: 0.5 + i*0.04})),
    ...ring3Nodes.map((_,i) => ({from: {ring:3, idx:i}, to: {ring:3, idx:(i+1)%ring3Nodes.length}, animated: (i%5===0), delay: 0.8 + i*0.03})),
    ...ring4Nodes.map((_,i) => ({from: {ring:4, idx:i}, to: {ring:4, idx:(i+1)%ring4Nodes.length}, animated: (i%6===0), delay: 1.1 + i*0.025})),
    ...ring5Nodes.map((_,i) => ({from: {ring:5, idx:i}, to: {ring:5, idx:(i+1)%ring5Nodes.length}, animated: (i%8===0), delay: 1.4 + i*0.02})),
    ...ring6Nodes.map((_,i) => ({from: {ring:6, idx:i}, to: {ring:6, idx:(i+1)%ring6Nodes.length}, animated: (i%10===0), delay: 1.7 + i*0.015, class: 'graph-edge-outermost' })),
  ];

  const nodeCollections = [
    [{ cx: 50, cy: 50 }], // Center node
    ring1Nodes,
    ring2Nodes,
    ring3Nodes,
    ring4Nodes,
    ring5Nodes,
    ring6Nodes,
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
          animation: pulseNodeAnim 1.5s infinite ease-in-out;
        }
        .graph-edge {
          stroke: currentColor;
          stroke-width: 0.25; 
          stroke-linecap: round;
          opacity: 0.1;
        }
        .graph-edge-outermost {
           stroke-width: 0.2;
           opacity: 0.08;
        }
        .graph-edge-active {
          stroke-width: 0.4; 
          opacity: 0.5;
          animation: drawPathAnim 2s infinite linear;
        }
        @keyframes pulseNodeAnim {
          0%, 100% { r: 3.5; opacity: 1; } 
          50% { r: 4.2; opacity: 0.7; }
        }
        @keyframes drawPathAnim {
          0% { stroke-dasharray: 0, 100; stroke-dashoffset: 0; opacity: 0.15; }
          50% { stroke-dasharray: 50, 100; stroke-dashoffset: -25; opacity: 0.7; }
          100% { stroke-dasharray: 0, 100; stroke-dashoffset: -75; opacity: 0.15; }
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
            className={`graph-edge ${edge.animated ? 'graph-edge-active' : ''} ${edge.class || ''}`}
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

      {/* Ring 5 Nodes (r=1.2) */}
      {ring5Nodes.map((node, i) => (
        <circle key={`r5-${i}`} className="graph-node" cx={node.cx} cy={node.cy} r="1.2" style={{opacity: 0.8}} />
      ))}
      
      {/* Ring 6 Nodes (r=1) */}
      {ring6Nodes.map((node, i) => (
        <circle key={`r6-${i}`} className="graph-node" cx={node.cx} cy={node.cy} r="1" style={{opacity: 0.7}} />
      ))}
      
    </svg>
  );
}


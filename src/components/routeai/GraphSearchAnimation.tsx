
"use client";

import React from 'react';

interface GraphSearchAnimationProps {
  className?: string;
}

export function GraphSearchAnimation({ className }: GraphSearchAnimationProps) {
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

  const nodeCounts = [1, 8, 14, 19, 24, 30, 35];
  const ringRadii = [0, 10, 17, 24, 31, 38, 45]; // Geometric radii for node positions
  const nodeVisualRadii = [3, 2.5, 2.2, 2.0, 1.8, 1.6, 1.4]; // Visual radii for <circle> elements

  const centerNode = [{ cx: 50, cy: 50 }];
  const ring1Nodes = getRingNodes(nodeCounts[1], ringRadii[1], 0);
  const ring2Nodes = getRingNodes(nodeCounts[2], ringRadii[2], 360 / nodeCounts[2] / 2);
  const ring3Nodes = getRingNodes(nodeCounts[3], ringRadii[3], 0);
  const ring4Nodes = getRingNodes(nodeCounts[4], ringRadii[4], 360 / nodeCounts[4] / 2);
  const ring5Nodes = getRingNodes(nodeCounts[5], ringRadii[5], 0);
  const ring6Nodes = getRingNodes(nodeCounts[6], ringRadii[6], 360 / nodeCounts[6] / 2);

  const nodeCollections = [
    centerNode,
    ring1Nodes,
    ring2Nodes,
    ring3Nodes,
    ring4Nodes,
    ring5Nodes,
    ring6Nodes,
  ];

  const edges = [];

  // Center to Ring 1
  for (let i = 0; i < ring1Nodes.length; i++) {
    edges.push({ from: {ring:0, idx:0}, to: {ring:1, idx:i}, animated: true, delay: i * 0.1 });
  }

  // Inter-ring connections (Ring k to Ring k+1)
  for (let k = 1; k < nodeCollections.length - 1; k++) { // From ring1 up to ring5 (connecting to ring2 to ring6)
    const fromRingNodes = nodeCollections[k];
    const toRingNodes = nodeCollections[k+1];
    for (let i = 0; i < fromRingNodes.length; i++) {
      const targetIdx1 = Math.floor(i * (toRingNodes.length / fromRingNodes.length));
      edges.push({
        from: {ring:k, idx:i},
        to: {ring:k+1, idx: targetIdx1 % toRingNodes.length},
        animated: (i % 3 === 0), // Animate some
        delay: (k * 0.25) + (i * 0.04)
      });
      // Add a second connection for density, often static
      if (toRingNodes.length > 1) {
           const targetIdx2 = (targetIdx1 + Math.floor(toRingNodes.length / fromRingNodes.length / 2) + 1) % toRingNodes.length;
           edges.push({
              from: {ring:k, idx:i},
              to: {ring:k+1, idx: targetIdx2 },
              animated: (i % 5 === 0 && k < 4), // Fewer animated here
              delay: (k * 0.27) + (i * 0.05)
          });
      }
       // Add some cross-connections for visual complexity (static)
      if (i % 4 === 0 && k < nodeCollections.length - 2 && nodeCollections[k+2].length > 0) {
        const targetIdxCross = Math.floor(i * (nodeCollections[k+2].length / fromRingNodes.length));
        edges.push({
          from: { ring: k, idx: i },
          to: { ring: k + 2, idx: targetIdxCross % nodeCollections[k+2].length },
          animated: false,
          class: 'graph-edge-long'
        });
      }
    }
  }

  // Intra-ring connections (within each Ring k)
  for (let k = 1; k < nodeCollections.length; k++) { // For ring1 up to ring6
    const ringNodes = nodeCollections[k];
    if (ringNodes.length <= 1) continue;
    for (let i = 0; i < ringNodes.length; i++) {
      edges.push({
        from: {ring:k, idx:i},
        to: {ring:k, idx:(i+1)%ringNodes.length},
        animated: (i % Math.max(1, Math.floor(ringNodes.length / 5)) === 0), // Animate some
        delay: (k * 0.15) + (i * 0.02),
        class: k === nodeCollections.length - 1 ? 'graph-edge-outermost' : (k > 3 ? 'graph-edge-outer' : '')
      });
    }
  }

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
          stroke-width: 0.22; 
          stroke-linecap: round;
          opacity: 0.12;
        }
        .graph-edge-outer {
          stroke-width: 0.18;
          opacity: 0.1;
        }
        .graph-edge-outermost {
           stroke-width: 0.15;
           opacity: 0.08;
        }
        .graph-edge-long {
          stroke-width: 0.12;
          opacity: 0.07;
        }
        .graph-edge-active {
          stroke-width: 0.35; 
          opacity: 0.6;
          animation: drawPathAnim 2s infinite linear;
        }
        @keyframes pulseNodeAnim {
          0%, 100% { r: ${nodeVisualRadii[0]}; opacity: 1; } 
          50% { r: ${nodeVisualRadii[0] * 1.2}; opacity: 0.7; }
        }
        @keyframes drawPathAnim {
          0% { stroke-dasharray: 0, 100; stroke-dashoffset: 0; opacity: 0.1; }
          50% { stroke-dasharray: 50, 100; stroke-dashoffset: -25; opacity: 0.7; }
          100% { stroke-dasharray: 0, 100; stroke-dashoffset: -75; opacity: 0.1; }
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

      {/* Render Nodes */}
      {nodeCollections.map((ring, ringIndex) => 
        ring.map((node, nodeIndex) => (
          <circle 
            key={`r${ringIndex}-n${nodeIndex}`} 
            className={`graph-node ${ringIndex === 0 ? 'graph-node-center' : ''}`} 
            cx={node.cx} 
            cy={node.cy} 
            r={nodeVisualRadii[ringIndex]} 
            style={{opacity: 1 - (ringIndex * 0.08) }}
          />
        ))
      )}
      
    </svg>
  );
}

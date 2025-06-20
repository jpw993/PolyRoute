
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';

const PATH_DURATION = 2000; // ms, duration for a path to be "active" and drawn
const FADE_DURATION = 500;   // ms, duration for fading back to default
const INTER_PATH_DELAY = 200; // ms, pause between one path fading and next one starting

interface GraphSearchAnimationProps {
  className?: string;
}

interface Node {
  id: string;
  cx: number;
  cy: number;
  r: number;
}

interface Edge {
  id: string;
  fromNodeId: string; // For path definition
  toNodeId: string;   // For path definition
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  originalIndex: number; // To map to path edge indices
}

interface PathDefinition {
  nodes: string[]; // Array of node IDs
  edges: string[]; // Array of edge IDs
}

export function GraphSearchAnimation({ className }: GraphSearchAnimationProps) {
  const [activePathIndex, setActivePathIndex] = useState(0);
  const [highlightedElementKeys, setHighlightedElementKeys] = useState<Set<string>>(new Set());
  const [fadingElementKeys, setFadingElementKeys] = useState<Set<string>>(new Set());

  const { allNodes, allEdges, paths } = useMemo(() => {
    const generatedNodes: Node[][] = [];
    const generatedEdges: Edge[] = [];
    let edgeCounter = 0;

    const getRingNodes = (count: number, radius: number, r: number, offsetAngleDeg: number = 0, ringIdx: number): Node[] => {
      const nodes: Node[] = [];
      const angleStep = 360 / count;
      for (let i = 0; i < count; i++) {
        const angleDeg = i * angleStep + offsetAngleDeg;
        const angleRad = (angleDeg * Math.PI) / 180;
        nodes.push({
          id: `r${ringIdx}-n${i}`,
          cx: 50 + radius * Math.cos(angleRad),
          cy: 50 - radius * Math.sin(angleRad),
          r,
        });
      }
      return nodes;
    };
    
    const nodeCounts = [1, 8, 14, 19, 24, 30, 35];
    const ringRadii = [0, 10, 17, 24, 31, 38, 45];
    const nodeVisualRadiiValues = [3, 2.5, 2.2, 2.0, 1.8, 1.6, 1.4]; // Local to useMemo

    for(let i = 0; i < nodeCounts.length; i++) {
      const offset = (i % 2 !== 0) ? 360 / nodeCounts[i] / 2 : 0;
      generatedNodes.push(getRingNodes(nodeCounts[i], ringRadii[i], nodeVisualRadiiValues[i], offset, i));
    }

    const flatNodes = generatedNodes.flat();

    // Center to Ring 1
    const centerNode = generatedNodes[0][0];
    generatedNodes[1].forEach((ring1Node, i) => {
      generatedEdges.push({
        id: `edge-${edgeCounter++}`,
        fromNodeId: centerNode.id,
        toNodeId: ring1Node.id,
        x1: centerNode.cx, y1: centerNode.cy, x2: ring1Node.cx, y2: ring1Node.cy,
        originalIndex: edgeCounter -1
      });
    });

    // Inter-ring connections (Ring k to Ring k+1)
    for (let k = 1; k < generatedNodes.length - 1; k++) {
      const fromRingNodes = generatedNodes[k];
      const toRingNodes = generatedNodes[k+1];
      fromRingNodes.forEach((fromNode, i) => {
        const targetIdx1 = Math.floor(i * (toRingNodes.length / fromRingNodes.length));
        const toNode1 = toRingNodes[targetIdx1 % toRingNodes.length];
        generatedEdges.push({
          id: `edge-${edgeCounter++}`,
          fromNodeId: fromNode.id,
          toNodeId: toNode1.id,
          x1: fromNode.cx, y1: fromNode.cy, x2: toNode1.cx, y2: toNode1.cy,
          originalIndex: edgeCounter -1
        });

        if (toRingNodes.length > 1 && fromRingNodes.length > 1) { 
          const targetIdx2 = (targetIdx1 + Math.floor(toRingNodes.length / fromRingNodes.length / 2) + 1) % toRingNodes.length;
          const toNode2 = toRingNodes[targetIdx2];
           if (toNode1.id !== toNode2.id) { 
            generatedEdges.push({
              id: `edge-${edgeCounter++}`,
              fromNodeId: fromNode.id,
              toNodeId: toNode2.id,
              x1: fromNode.cx, y1: fromNode.cy, x2: toNode2.cx, y2: toNode2.cy,
              originalIndex: edgeCounter -1
            });
           }
        }
      });
    }
    
    // Intra-ring connections (simplified)
    for (let k = 1; k < generatedNodes.length; k++) {
        const ringNodes = generatedNodes[k];
        if (ringNodes.length <=1) continue;
        for(let i = 0; i < ringNodes.length; i++) {
            const fromNode = ringNodes[i];
            const toNode = ringNodes[(i+1) % ringNodes.length];
            generatedEdges.push({
                id: `edge-${edgeCounter++}`,
                fromNodeId: fromNode.id,
                toNodeId: toNode.id,
                x1: fromNode.cx, y1: fromNode.cy, x2: toNode.cx, y2: toNode.cy,
                originalIndex: edgeCounter -1
            });
        }
    }

    // Define some sample paths
    const definedPaths: PathDefinition[] = [];
    if (generatedNodes[0]?.[0] && generatedNodes[1]?.[0] && generatedNodes[2]?.[0]) {
      const path1Nodes = [generatedNodes[0][0].id, generatedNodes[1][0].id, generatedNodes[2][0].id];
      const path1Edges = [
        generatedEdges.find(e => e.fromNodeId === path1Nodes[0] && e.toNodeId === path1Nodes[1])?.id,
        generatedEdges.find(e => e.fromNodeId === path1Nodes[1] && e.toNodeId === path1Nodes[2])?.id,
      ].filter(Boolean) as string[];
      if (path1Edges.length === 2) definedPaths.push({ nodes: path1Nodes, edges: path1Edges });
    }

    if (generatedNodes[0]?.[0] && generatedNodes[1]?.[2] && generatedNodes[2]?.[4]) {
        const path2Nodes = [generatedNodes[0][0].id, generatedNodes[1][2 % generatedNodes[1].length].id, generatedNodes[2][4 % generatedNodes[2].length].id];
        const path2Edges = [
            generatedEdges.find(e => e.fromNodeId === path2Nodes[0] && e.toNodeId === path2Nodes[1])?.id,
            generatedEdges.find(e => e.fromNodeId === path2Nodes[1] && e.toNodeId === path2Nodes[2])?.id,
        ].filter(Boolean) as string[];
        if (path2Edges.length === 2) definedPaths.push({ nodes: path2Nodes, edges: path2Edges });
    }
    
    if (generatedNodes[0]?.[0] && generatedNodes[1]?.[5] && generatedNodes[2]?.[9]) {
        const path3Nodes = [generatedNodes[0][0].id, generatedNodes[1][5 % generatedNodes[1].length].id, generatedNodes[2][9 % generatedNodes[2].length].id];
        const path3Edges = [
            generatedEdges.find(e => e.fromNodeId === path3Nodes[0] && e.toNodeId === path3Nodes[1])?.id,
            generatedEdges.find(e => e.fromNodeId === path3Nodes[1] && e.toNodeId === path3Nodes[2])?.id,
        ].filter(Boolean) as string[];
       if (path3Edges.length === 2) definedPaths.push({ nodes: path3Nodes, edges: path3Edges });
    }
     if (definedPaths.length === 0 && generatedEdges.length > 0) { // Fallback if specific paths fail
        definedPaths.push({ nodes: [generatedEdges[0].fromNodeId, generatedEdges[0].toNodeId], edges: [generatedEdges[0].id] });
    }


    return { allNodes: flatNodes, allEdges: generatedEdges, paths: definedPaths };
  }, []);


  useEffect(() => {
    if (paths.length === 0) return;

    const currentPathDef = paths[activePathIndex];
    const newHighlightedElements = new Set<string>([...currentPathDef.nodes, ...currentPathDef.edges]);

    setFadingElementKeys(prevFading => {
      // Elements that were highlighted previously should now fade
      // Exclude elements that are part of the new path from immediate fading if they overlap
      const toFade = new Set<string>();
      highlightedElementKeys.forEach(key => {
        if (!newHighlightedElements.has(key)) {
          toFade.add(key);
        }
      });
      return toFade;
    });
    setHighlightedElementKeys(newHighlightedElements);

    const fadeTimer = setTimeout(() => {
      setFadingElementKeys(new Set()); // Clear fading elements after FADE_DURATION
    }, FADE_DURATION);

    const nextPathTimer = setTimeout(() => {
      setActivePathIndex((prevIndex) => (prevIndex + 1) % paths.length);
    }, PATH_DURATION + INTER_PATH_DELAY);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(nextPathTimer);
    };
  }, [activePathIndex, paths, highlightedElementKeys]);


  const getNodeClass = useCallback((nodeId: string) => {
    if (highlightedElementKeys.has(nodeId) && !fadingElementKeys.has(nodeId)) return 'node-highlight';
    if (fadingElementKeys.has(nodeId)) return 'node-fading'; // Will transition to base
    return 'node-base';
  }, [highlightedElementKeys, fadingElementKeys]);

  const getEdgeClass = useCallback((edgeId: string) => {
    let classes = 'edge-base';
    if (highlightedElementKeys.has(edgeId) && !fadingElementKeys.has(edgeId)) {
      classes = 'edge-highlight edge-drawing-active';
    } else if (fadingElementKeys.has(edgeId)) {
      classes = 'edge-fading'; // Will transition to base
    }
    return classes;
  }, [highlightedElementKeys, fadingElementKeys]);

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
        .node-base {
          fill: hsl(var(--secondary)); /* Light purple */
          transition: fill ${FADE_DURATION}ms ease-out;
        }
        .node-highlight {
          fill: hsl(var(--primary)); /* Dark purple */
          transition: fill 0.1s ease-in; /* Faster highlight */
        }
        .node-fading { /* This class is for initiating the fade, relies on node-base transition */
          fill: hsl(var(--secondary));
        }
        .node-center-pulse {
          animation: pulseNodeAnim 1.5s infinite ease-in-out;
        }
        
        .edge-base {
          stroke: hsl(var(--secondary)); /* Light purple */
          opacity: 0.2;
          stroke-width: 0.22;
          transition: stroke ${FADE_DURATION}ms ease-out, opacity ${FADE_DURATION}ms ease-out, stroke-width ${FADE_DURATION}ms ease-out;
        }
        .edge-highlight {
          stroke: hsl(var(--primary)); /* Dark purple */
          opacity: 0.7;
          stroke-width: 0.35;
          transition: stroke 0.1s ease-in, opacity 0.1s ease-in, stroke-width 0.1s ease-in;
        }
         .edge-fading { /* This class is for initiating the fade, relies on edge-base transition */
           stroke: hsl(var(--secondary));
           opacity: 0.2;
           stroke-width: 0.22;
         }
        .edge-drawing-active {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawPathAnim ${PATH_DURATION}ms linear forwards;
        }

        @keyframes pulseNodeAnim {
          0%, 100% { r: ${nodeVisualRadii[0]}; opacity: 1; }
          50% { r: ${nodeVisualRadii[0] * 1.2}; opacity: 0.7; }
        }
        @keyframes drawPathAnim {
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Render Edges */}
      {allEdges.map((edge) => (
        <line
          key={edge.id}
          className={getEdgeClass(edge.id)}
          x1={edge.x1}
          y1={edge.y1}
          x2={edge.x2}
          y2={edge.y2}
        />
      ))}

      {/* Render Nodes */}
      {allNodes.map((node) => (
        <circle
          key={node.id}
          className={`${getNodeClass(node.id)} ${node.id === 'r0-n0' ? 'node-center-pulse' : ''}`}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
        />
      ))}
    </svg>
  );
}

// Pre-calculate node visual radii for the pulse animation if needed, assuming it's based on the center node.
// This array is defined in the useMemo hook now.
const nodeVisualRadii = [3, 2.5, 2.2, 2.0, 1.8, 1.6, 1.4];

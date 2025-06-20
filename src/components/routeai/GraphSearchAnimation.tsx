
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';

const STEP_DURATION = 300; // ms, duration for one step (node/edge reveal)
const PATH_COMPLETED_PAUSE = 1500; // ms, pause after a path is fully drawn
const FADE_DURATION = 500;   // ms, duration for fading out old path

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
  fromNodeId: string;
  toNodeId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface PathDefinition {
  nodeIds: string[]; // Array of node IDs in sequence
}

// Node visual radii for different rings (center outwards)
const nodeVisualRadii = [3, 2.5, 2.2, 2.0, 1.8, 1.6, 1.4];

export function GraphSearchAnimation({ className }: GraphSearchAnimationProps) {
  const [activePathIndex, setActivePathIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElements, setHighlightedElements] = useState<Set<string>>(new Set());
  const [fadingElements, setFadingElements] = useState<Set<string>>(new Set());

  const { allNodes, allEdges, definedPaths } = useMemo(() => {
    const generatedNodesList: Node[][] = [];
    const generatedEdgesList: Edge[] = [];
    let edgeCounter = 0;

    const getRingNodes = (count: number, ringRadius: number, nodeR: number, offsetAngleDeg: number = 0, ringIdx: number): Node[] => {
      const nodes: Node[] = [];
      const angleStep = 360 / count;
      for (let i = 0; i < count; i++) {
        const angleDeg = i * angleStep + offsetAngleDeg;
        const angleRad = (angleDeg * Math.PI) / 180;
        nodes.push({
          id: `r${ringIdx}-n${i}`,
          cx: 50 + ringRadius * Math.cos(angleRad),
          cy: 50 - ringRadius * Math.sin(angleRad), // SVG y-axis is inverted
          r: nodeR,
        });
      }
      return nodes;
    };
    
    // Ring configurations: [nodeCount, ringRadius, nodeVisualRadiusIndex, offsetAngleDeg]
    const ringConfigs: [number, number, number, number][] = [
      [1, 0, 0, 0],    // Center
      [8, 10, 1, 0],   // Ring 1
      [14, 17, 2, 360 / 14 / 2], // Ring 2 (offset)
      [19, 24, 3, 0],  // Ring 3
      [24, 31, 4, 360 / 24 / 2], // Ring 4 (offset)
      [30, 38, 5, 0],  // Ring 5
      [35, 45, 6, 360 / 35 / 2], // Ring 6 (offset)
    ];

    ringConfigs.forEach(([count, radius, visualRadiusIdx, offset], ringIdx) => {
      generatedNodesList.push(getRingNodes(count, radius, nodeVisualRadii[visualRadiusIdx], offset, ringIdx));
    });
    
    const flatNodes = generatedNodesList.flat();

    // Connect center to Ring 1
    const centerNode = generatedNodesList[0][0];
    generatedNodesList[1].forEach((ring1Node) => {
      generatedEdgesList.push({
        id: `edge-${edgeCounter++}`,
        fromNodeId: centerNode.id, toNodeId: ring1Node.id,
        x1: centerNode.cx, y1: centerNode.cy, x2: ring1Node.cx, y2: ring1Node.cy,
      });
    });

    // Inter-ring connections (Ring k to Ring k+1)
    for (let k = 1; k < generatedNodesList.length - 1; k++) {
      const fromRingNodes = generatedNodesList[k];
      const toRingNodes = generatedNodesList[k+1];
      fromRingNodes.forEach((fromNode, i) => {
        const targetIdx1 = Math.floor(i * (toRingNodes.length / fromRingNodes.length));
        const toNode1 = toRingNodes[targetIdx1 % toRingNodes.length];
        generatedEdgesList.push({
          id: `edge-${edgeCounter++}`,
          fromNodeId: fromNode.id, toNodeId: toNode1.id,
          x1: fromNode.cx, y1: fromNode.cy, x2: toNode1.cx, y2: toNode1.cy,
        });

        if (toRingNodes.length > 1 && fromRingNodes.length > 1 && fromRingNodes.length < toRingNodes.length * 0.8) { 
          const targetIdx2 = (targetIdx1 + 1) % toRingNodes.length;
          const toNode2 = toRingNodes[targetIdx2];
           if (toNode1.id !== toNode2.id) { 
            generatedEdgesList.push({
              id: `edge-${edgeCounter++}`,
              fromNodeId: fromNode.id, toNodeId: toNode2.id,
              x1: fromNode.cx, y1: fromNode.cy, x2: toNode2.cx, y2: toNode2.cy,
            });
           }
        }
      });
    }
    
    // Intra-ring connections (simplified - connect each node to its neighbor)
    for (let k = 1; k < generatedNodesList.length; k++) {
        const ringNodes = generatedNodesList[k];
        if (ringNodes.length <=1) continue;
        for(let i = 0; i < ringNodes.length; i++) {
            const fromNode = ringNodes[i];
            const toNode = ringNodes[(i+1) % ringNodes.length];
            generatedEdgesList.push({
                id: `edge-${edgeCounter++}`,
                fromNodeId: fromNode.id, toNodeId: toNode.id,
                x1: fromNode.cx, y1: fromNode.cy, x2: toNode.cx, y2: toNode.cy,
            });
        }
    }
    
    const paths: PathDefinition[] = [
      { nodeIds: ['r0-n0', 'r1-n1', 'r2-n2', 'r3-n3', 'r4-n4', 'r5-n5', 'r6-n6'] },
      { nodeIds: ['r0-n0', 'r1-n3', 'r2-n5', 'r3-n8', 'r4-n12', 'r5-n18', 'r6-n25'] },
      { nodeIds: ['r0-n0', 'r1-n5', 'r2-n9', 'r3-n15', 'r4-n20', 'r5-n25', 'r6-n34'] },
      { nodeIds: ['r0-n0', 'r1-n7', 'r2-n13', 'r3-n0', 'r4-n10', 'r5-n12', 'r6-n30'] },
    ];
     if (generatedNodesList.length > 3 && generatedNodesList[0]?.[0] && generatedNodesList[1]?.[0] && generatedNodesList[2]?.[0] && generatedNodesList[3]?.[0]) {
        // Paths are valid for the current graph structure.
    } else {
        // Fallback if graph is too shallow for defined paths
        if (generatedNodesList[0]?.[0] && generatedNodesList[1]?.[0]) {
             paths.splice(0, paths.length, { nodeIds: [generatedNodesList[0][0].id, generatedNodesList[1][0].id] });
        } else {
            paths.splice(0, paths.length); // No valid paths
        }
    }

    return { allNodes: flatNodes, allEdges: generatedEdgesList, definedPaths: paths };
  }, []);

  const findEdgeId = useCallback((node1Id: string, node2Id: string): string | undefined => {
    const edge = allEdges.find(
      (e) => (e.fromNodeId === node1Id && e.toNodeId === node2Id) || (e.fromNodeId === node2Id && e.toNodeId === node1Id)
    );
    return edge?.id;
  }, [allEdges]);

  // Effect for managing path transitions (outer loop)
  useEffect(() => {
    if (definedPaths.length === 0) return;

    // Current path is done, prepare for next or loop
    setFadingElements(new Set(highlightedElements)); // Mark current path for fading
    setHighlightedElements(new Set()); // Clear highlights for the new path
    setCurrentStep(0); // Reset step for the new path

    const fadeTimer = setTimeout(() => {
      setFadingElements(new Set()); // Clear fading elements after FADE_DURATION
    }, FADE_DURATION);

    return () => clearTimeout(fadeTimer);
  }, [activePathIndex, definedPaths]); // Corrected dependency array


  // Effect for step-by-step path construction (inner loop)
  useEffect(() => {
    if (definedPaths.length === 0 || activePathIndex >= definedPaths.length) return;
    
    const currentPathDef = definedPaths[activePathIndex];
    if (!currentPathDef || currentStep >= currentPathDef.nodeIds.length) {
      // Path fully drawn, wait then advance to next path
      const timer = setTimeout(() => {
        setActivePathIndex((prevIndex) => (prevIndex + 1) % definedPaths.length);
      }, PATH_COMPLETED_PAUSE);
      return () => clearTimeout(timer);
    }

    // Reveal current node and connecting edge
    const timer = setTimeout(() => {
      setHighlightedElements(prevHighlighted => {
        const newHighlighted = new Set(prevHighlighted);
        const currentNodeId = currentPathDef.nodeIds[currentStep];
        newHighlighted.add(currentNodeId);

        if (currentStep > 0) {
          const prevNodeId = currentPathDef.nodeIds[currentStep - 1];
          const edgeId = findEdgeId(prevNodeId, currentNodeId);
          if (edgeId) {
            newHighlighted.add(edgeId);
          }
        }
        return newHighlighted;
      });
      setCurrentStep(prev => prev + 1);
    }, STEP_DURATION);

    return () => clearTimeout(timer);
  }, [currentStep, activePathIndex, definedPaths, findEdgeId]);


  const getNodeClass = useCallback((nodeId: string) => {
    if (highlightedElements.has(nodeId) && !fadingElements.has(nodeId)) return 'node-highlight';
    // Fading is handled by transition on removing highlight, so no explicit fading class needed if transitions are set on base/highlight states.
    return 'node-base';
  }, [highlightedElements, fadingElements]);

  const getEdgeClass = useCallback((edgeId: string) => {
    let classes = 'edge-base';
    if (highlightedElements.has(edgeId) && !fadingElements.has(edgeId)) {
      classes = 'edge-highlight edge-drawing-active';
    }
    return classes;
  }, [highlightedElements, fadingElements]);


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
          transition: fill ${STEP_DURATION * 0.5}ms ease-in;
        }
        /* .node-fading could be used if a multi-stage fade is desired */

        .node-center-pulse {
          animation: pulseNodeAnim 1.5s infinite ease-in-out;
        }
        
        .edge-base {
          stroke: hsl(var(--secondary)); 
          opacity: 0.2;
          stroke-width: 0.22; /* Adjusted for density */
          transition: stroke ${FADE_DURATION}ms ease-out, opacity ${FADE_DURATION}ms ease-out, stroke-width ${FADE_DURATION}ms ease-out;
        }
        .edge-highlight {
          stroke: hsl(var(--primary)); 
          opacity: 0.7;
          stroke-width: 0.35; /* Adjusted for density */
          transition: stroke ${STEP_DURATION * 0.5}ms ease-in, opacity ${STEP_DURATION * 0.5}ms ease-in, stroke-width ${STEP_DURATION * 0.5}ms ease-in;
        }
        /* .edge-fading could be used here too */

        .edge-drawing-active {
          stroke-dasharray: 20; /* A reasonable default, or calculate per edge */
          stroke-dashoffset: 20;
          animation: drawPathAnim ${STEP_DURATION}ms linear forwards;
        }

        @keyframes pulseNodeAnim {
          0%, 100% { r: ${nodeVisualRadii[0]}; opacity: 1; }
          50% { r: ${nodeVisualRadii[0] * 1.2}; opacity: 0.7; }
        }
        @keyframes drawPathAnim {
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Render Edges first so nodes are on top */}
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
// nodeVisualRadii is defined at the top of the file.
// Ensure the pulseNodeAnim keyframe uses the correct radius for the center node.
// If nodeVisualRadii[0] is the center node's radius, the animation is correct.

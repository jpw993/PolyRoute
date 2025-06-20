"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';

const STEP_DURATION = 33; // ms, duration for one step (node/edge reveal)
const PATH_COMPLETED_PAUSE = 167; // ms, pause after a path is fully drawn
const FADE_DURATION = 57;   // ms, duration for fading out old path

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
    // Center, Ring 1 ... Ring 6
    const ringConfigs: [number, number, number, number][] = [
      [1, 0, 0, 0],    // Center (r0)
      [8, 10, 1, 0],   // Ring 1 (r1)
      [14, 17, 2, 360 / 14 / 2], // Ring 2 (r2)
      [19, 24, 3, 0],  // Ring 3 (r3)
      [24, 31, 4, 360 / 24 / 2], // Ring 4 (r4)
      [30, 38, 5, 0],  // Ring 5 (r5)
      [35, 45, 6, 360 / 35 / 2], // Ring 6 (r6)
    ];

    ringConfigs.forEach(([count, radius, visualRadiusIdx, offset], ringIdx) => {
      generatedNodesList.push(getRingNodes(count, radius, nodeVisualRadii[visualRadiusIdx], offset, ringIdx));
    });
    
    const flatNodes = generatedNodesList.flat();
    
    // Edge Generation
    generatedEdgesList.length = 0;
    edgeCounter = 0;

    // 1. Connect center node (r0-n0) to ALL nodes in the first ring (r1-*)
    const centerNode = generatedNodesList[0][0];
    if (generatedNodesList.length > 1) {
      generatedNodesList[1].forEach((ring1Node) => {
        generatedEdgesList.push({
          id: `edge-${edgeCounter++}`,
          fromNodeId: centerNode.id, toNodeId: ring1Node.id,
          x1: centerNode.cx, y1: centerNode.cy, x2: ring1Node.cx, y2: ring1Node.cy,
        });
      });
    }

    // 2. Inter-ring connections (Ring k to Ring k+1, for k >= 1)
    for (let k = 1; k < generatedNodesList.length - 1; k++) {
      const fromRingNodes = generatedNodesList[k];
      const toRingNodes = generatedNodesList[k+1];
      fromRingNodes.forEach((fromNode, i) => { // i is the index of fromNode in its ring
        // Connection 1: "Straight spoke"
        const toNode1Index = i % toRingNodes.length;
        const toNode1 = toRingNodes[toNode1Index];
        generatedEdgesList.push({
          id: `edge-${edgeCounter++}`,
          fromNodeId: fromNode.id, toNodeId: toNode1.id,
          x1: fromNode.cx, y1: fromNode.cy, x2: toNode1.cx, y2: toNode1.cy,
        });

        // Connection 2: "Diagonal/Offset spoke" for density
        if (toRingNodes.length > 1) {
            const toNode2Index = (i + Math.floor(fromRingNodes.length / 3) + 1) % toRingNodes.length; // Spread out a bit
            if (toNode2Index !== toNode1Index) { 
                const toNode2 = toRingNodes[toNode2Index];
                 // Check if this specific edge (or its reverse) already exists from Connection 1 or other logic
                const edgeExists = generatedEdgesList.some(e =>
                    (e.fromNodeId === fromNode.id && e.toNodeId === toNode2.id) ||
                    (e.fromNodeId === toNode2.id && e.toNodeId === fromNode.id)
                );
                if (!edgeExists) {
                    generatedEdgesList.push({
                        id: `edge-${edgeCounter++}`,
                        fromNodeId: fromNode.id, toNodeId: toNode2.id,
                        x1: fromNode.cx, y1: fromNode.cy, x2: toNode2.cx, y2: toNode2.cy,
                    });
                }
            }
        }
      });
    }

    // 3. Intra-ring connections (connect n(i) to n(i+1) within the same ring, for k >= 1)
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
    
    // Ensure paths are valid and use indices within bounds
    // generatedNodesList[0]: 1 node (idx 0)
    // generatedNodesList[1]: 8 nodes (idx 0-7) - Ring 1
    // generatedNodesList[2]: 14 nodes (idx 0-13) - Ring 2
    // generatedNodesList[3]: 19 nodes (idx 0-18) - Ring 3
    // generatedNodesList[4]: 24 nodes (idx 0-23) - Ring 4
    // generatedNodesList[5]: 30 nodes (idx 0-29) - Ring 5
    // generatedNodesList[6]: 35 nodes (idx 0-34) - Ring 6
    const paths: PathDefinition[] = [
      { nodeIds: ['r0-n0', 'r1-n0', 'r2-n0', 'r3-n0', 'r4-n0', 'r5-n0', 'r6-n0'] }, // Straight spoke
      { nodeIds: ['r0-n0', 'r1-n3', 'r2-n3', 'r3-n3', 'r4-n3', 'r5-n3', 'r6-n3'] }, // Another straight spoke
      { nodeIds: ['r0-n0', 'r1-n5', 'r2-n5', 'r3-n5', 'r3-n6', 'r4-n6', 'r5-n6', 'r6-n6'] }, // Spoke then intra-ring
      { nodeIds: ['r0-n0', 'r1-n7', 'r2-n7', 'r2-n8', 'r3-n8', 'r3-n9', 'r4-n9', 'r5-n9', 'r6-n9'] }, // Multiple intra-ring
    ];

    return { allNodes: flatNodes, allEdges: generatedEdgesList, definedPaths: paths };
  }, []);

  const findEdgeId = useCallback((node1Id: string, node2Id: string): string | undefined => {
    const edge = allEdges.find(
      (e) => (e.fromNodeId === node1Id && e.toNodeId === node2Id) || (e.fromNodeId === node2Id && e.toNodeId === node1Id)
    );
    return edge?.id;
  }, [allEdges]);

  // Effect for managing path transitions and starting new path construction (outer loop)
  useEffect(() => {
    if (definedPaths.length === 0) return;

    // 1. Current highlightedElements (completed path) become fadingElements
    setFadingElements(new Set(highlightedElements));
    // 2. Clear highlightedElements for the new path
    setHighlightedElements(new Set());
    // 3. Reset step for the new path
    setCurrentStep(0);

    // 4. After FADE_DURATION, clear fadingElements
    const fadeTimer = setTimeout(() => {
      setFadingElements(new Set());
    }, FADE_DURATION);
    
    return () => {
      clearTimeout(fadeTimer);
    };
    // IMPORTANT: highlightedElements was removed from deps to fix max update depth.
    // This effect should cycle based on activePathIndex.
  }, [activePathIndex, definedPaths, findEdgeId]);


  // Effect for step-by-step path construction (inner loop)
  useEffect(() => {
    if (definedPaths.length === 0 || activePathIndex >= definedPaths.length) return;
    
    const currentPathDef = definedPaths[activePathIndex];
    // Check if current path construction is complete
    if (!currentPathDef || currentStep >= currentPathDef.nodeIds.length) {
      // Path completed, pause then set up for next path
      const timer = setTimeout(() => {
        setActivePathIndex((prevIndex) => (prevIndex + 1) % definedPaths.length);
      }, PATH_COMPLETED_PAUSE);
      return () => clearTimeout(timer);
    }

    // Path is still being constructed, reveal next step
    const timer = setTimeout(() => {
      setHighlightedElements(prevHighlighted => {
        const newHighlighted = new Set(prevHighlighted);
        const currentNodeId = currentPathDef.nodeIds[currentStep];
        newHighlighted.add(currentNodeId); // Highlight current node

        if (currentStep > 0) { // If not the first node, find and highlight the edge to previous node
          const prevNodeId = currentPathDef.nodeIds[currentStep - 1];
          const edgeId = findEdgeId(prevNodeId, currentNodeId);
          if (edgeId) {
            newHighlighted.add(edgeId); // Highlight edge
          } else {
            // console.warn(`Edge not found between ${prevNodeId} and ${currentNodeId}`); // For debugging
          }
        }
        return newHighlighted;
      });
      setCurrentStep(prev => prev + 1); // Move to next step
    }, STEP_DURATION);

    return () => clearTimeout(timer);
     // IMPORTANT: highlightedElements removed from deps here as well.
     // This effect constructs highlightedElements based on currentStep & activePathIndex.
  }, [currentStep, activePathIndex, definedPaths, findEdgeId]);


  const getNodeClass = useCallback((nodeId: string) => {
    if (highlightedElements.has(nodeId) && !fadingElements.has(nodeId)) return 'node-highlight';
    if (fadingElements.has(nodeId)) return 'node-fading'; // Node specific fading style if needed
    return 'node-base';
  }, [highlightedElements, fadingElements]);

  const getEdgeClass = useCallback((edgeId: string) => {
    let classes = 'edge-base';
    if (highlightedElements.has(edgeId) && !fadingElements.has(edgeId)) {
      classes = 'edge-highlight edge-drawing-active';
    } else if (fadingElements.has(edgeId)) {
      classes = 'edge-fading'; // Edge specific fading style if needed
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
          fill: hsl(var(--secondary)); 
          transition: fill ${FADE_DURATION}ms ease-out;
        }
        .node-highlight {
          fill: hsl(var(--primary)); 
          /* No transition for highlight, should be immediate */
        }
        .node-fading {
          fill: hsl(var(--secondary)); /* Target color for fade */
          transition: fill ${FADE_DURATION}ms ease-out;
        }
        
        .node-center-pulse { /* Center node uses its own radius from nodeVisualRadii[0] */
          animation: pulseNodeAnim ${0.17 * 1}s infinite ease-in-out;
        }
        
        .edge-base {
          stroke: hsl(var(--secondary)); 
          opacity: 0.2;
          stroke-width: 0.22; 
          transition: stroke ${FADE_DURATION}ms ease-out, opacity ${FADE_DURATION}ms ease-out, stroke-width ${FADE_DURATION}ms ease-out;
        }
        .edge-highlight {
          stroke: hsl(var(--primary)); 
          opacity: 0.8; 
          stroke-width: 0.6; 
          /* No transition for highlight, should be immediate */
          animation: pulseEdgeAnim 0.75s infinite alternate ease-in-out;
        }
         .edge-fading {
          stroke: hsl(var(--secondary)); /* Target color for fade */
          opacity: 0.2; /* Target opacity for fade */
          stroke-width: 0.22; /* Target stroke-width for fade */
          transition: stroke ${FADE_DURATION}ms ease-out, opacity ${FADE_DURATION}ms ease-out, stroke-width ${FADE_DURATION}ms ease-out;
        }

        .edge-drawing-active { /* Applied to highlighted edges to draw them */
          stroke-dasharray: 20; /* A large enough value to cover edge length */
          stroke-dashoffset: 20; /* Start with dash hidden */
          animation: drawPathAnim ${STEP_DURATION}ms linear forwards;
        }

        @keyframes pulseNodeAnim {
          0%, 100% { r: var(--center-node-radius, ${nodeVisualRadii[0]}); opacity: 1; }
          50% { r: calc(var(--center-node-radius, ${nodeVisualRadii[0]}) * 1.2); opacity: 0.7; }
        }
        @keyframes drawPathAnim {
          to { stroke-dashoffset: 0; } /* Animate to fully drawn */
        }
        @keyframes pulseEdgeAnim { 
          from { stroke-width: 0.6; opacity: 0.8; }
          to   { stroke-width: 0.9; opacity: 1; }
        }
      `}</style>
      
      {/* Define CSS variable for center node radius if needed by pulseNodeAnim */}
      <defs>
        <style>{`:root { --center-node-radius: ${allNodes.find(n => n.id === 'r0-n0')?.r || nodeVisualRadii[0]}px; }`}</style>
      </defs>

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
// Using CSS variable --center-node-radius for robustness.


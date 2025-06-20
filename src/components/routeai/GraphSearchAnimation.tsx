
"use client";

import React from 'react';

interface GraphSearchAnimationProps {
  className?: string;
}

export function GraphSearchAnimation({ className }: GraphSearchAnimationProps) {
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
          stroke-width: 1; 
          stroke-linecap: round;
          opacity: 0.3;
        }
        .graph-edge-active {
          stroke-width: 1.5; 
          opacity: 0.8;
          animation: drawPathAnim 2.2s infinite linear;
        }
        @keyframes pulseNodeAnim {
          0%, 100% { r: 5; opacity: 1; }
          50% { r: 6.5; opacity: 0.7; }
        }
        @keyframes drawPathAnim {
          0% { stroke-dasharray: 0, 200; stroke-dashoffset: 0; opacity: 0.4; }
          50% { stroke-dasharray: 100, 200; stroke-dashoffset: -50; opacity: 1; }
          100% { stroke-dasharray: 0, 200; stroke-dashoffset: -150; opacity: 0.4; }
        }
      `}</style>

      {/* Center Node */}
      <circle className="graph-node graph-node-center" cx="50" cy="50" r="6" />
      
      {/* Ring 1 (6 nodes, r=4) - Original Inner Ring */}
      <circle className="graph-node" cx="50" cy="25" r="4" /> {/* N1 */}
      <circle className="graph-node" cx="71.6" cy="35" r="4" /> {/* NE1 */}
      <circle className="graph-node" cx="71.6" cy="65" r="4" /> {/* SE1 */}
      <circle className="graph-node" cx="50" cy="75" r="4" /> {/* S1 */}
      <circle className="graph-node" cx="28.4" cy="65" r="4" /> {/* SW1 */}
      <circle className="graph-node" cx="28.4" cy="35" r="4" /> {/* NW1 */}

      {/* Edges from Center to Ring 1 (Animated) */}
      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="50" y2="25" style={{ animationDelay: '0s' }}/>
      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="71.6" y2="35" style={{ animationDelay: '0.1s' }}/>
      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="71.6" y2="65" style={{ animationDelay: '0.2s' }}/>
      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="50" y2="75" style={{ animationDelay: '0.3s' }}/>
      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="28.4" y2="65" style={{ animationDelay: '0.4s' }}/>
      <line className="graph-edge graph-edge-active" x1="50" y1="50" x2="28.4" y2="35" style={{ animationDelay: '0.5s' }}/>

      {/* Edges connecting Ring 1 nodes */}
      <line className="graph-edge" x1="50" y1="25" x2="71.6" y2="35"/>
      <line className="graph-edge" x1="71.6" y1="35" x2="71.6" y2="65"/>
      <line className="graph-edge" x1="71.6" y1="65" x2="50" y2="75"/>
      <line className="graph-edge" x1="50" y1="75" x2="28.4" y2="65"/>
      <line className="graph-edge" x1="28.4" y1="65" x2="28.4" y2="35"/>
      <line className="graph-edge" x1="28.4" y1="35" x2="50" y2="25"/>

      {/* Ring 2 (12 nodes, r=3.5), radius ~38 from center */}
      <circle className="graph-node" cx="50" cy="12" r="3.5" /> 
      <circle className="graph-node" cx="69" cy="17.1" r="3.5" /> 
      <circle className="graph-node" cx="83" cy="31" r="3.5" /> 
      <circle className="graph-node" cx="88" cy="50" r="3.5" /> 
      <circle className="graph-node" cx="83" cy="69" r="3.5" /> 
      <circle className="graph-node" cx="69" cy="82.9" r="3.5" /> 
      <circle className="graph-node" cx="50" cy="88" r="3.5" /> 
      <circle className="graph-node" cx="31" cy="82.9" r="3.5" /> 
      <circle className="graph-node" cx="17" cy="69" r="3.5" /> 
      <circle className="graph-node" cx="12" cy="50" r="3.5" /> 
      <circle className="graph-node" cx="17" cy="31" r="3.5" /> 
      <circle className="graph-node" cx="31" cy="17.1" r="3.5" /> 

      {/* Edges from Ring 1 to Ring 2 (some animated) */}
      <line className="graph-edge graph-edge-active" x1="50" y1="25" x2="50" y2="12" style={{ animationDelay: '0.6s' }}/> {/* N1 to R2_N */}
      <line className="graph-edge" x1="50" y1="25" x2="31" y2="17.1"/> {/* N1 to R2_NNW */}
      <line className="graph-edge" x1="71.6" y1="35" x2="69" y2="17.1" /> {/* NE1 to R2_NNE */}
      <line className="graph-edge graph-edge-active" x1="71.6" y1="35" x2="83" y2="31" style={{ animationDelay: '0.7s' }}/> {/* NE1 to R2_ENE */}
      <line className="graph-edge" x1="71.6" y1="65" x2="83" y2="69" /> {/* SE1 to R2_ESE */}
      <line className="graph-edge graph-edge-active" x1="50" y1="75" x2="50" y2="88" style={{ animationDelay: '0.8s' }}/> {/* S1 to R2_S */}
      <line className="graph-edge" x1="28.4" y1="65" x2="17" y2="69" /> {/* SW1 to R2_WSW */}
      <line className="graph-edge graph-edge-active" x1="28.4" y1="35" x2="17" y2="31" style={{ animationDelay: '0.9s' }}/> {/* NW1 to R2_WNW */}
      <line className="graph-edge" x1="71.6" y1="65" x2="88" y2="50" /> {/* SE1 to R2_E */}
      <line className="graph-edge" x1="28.4" y1="65" x2="12" y2="50" /> {/* SW1 to R2_W */}

      {/* Edges connecting Ring 2 nodes */}
      <line className="graph-edge" x1="50" y1="12" x2="69" y2="17.1"/>
      <line className="graph-edge" x1="69" y1="17.1" x2="83" y2="31"/>
      <line className="graph-edge" x1="83" y1="31" x2="88" y2="50"/>
      <line className="graph-edge" x1="88" y1="50" x2="83" y2="69"/>
      <line className="graph-edge" x1="83" y1="69" x2="69" y2="82.9"/>
      <line className="graph-edge" x1="69" y1="82.9" x2="50" y2="88"/>
      <line className="graph-edge" x1="50" y1="88" x2="31" y2="82.9"/>
      <line className="graph-edge" x1="31" y1="82.9" x2="17" y2="69"/>
      <line className="graph-edge" x1="17" y1="69" x2="12" y2="50"/>
      <line className="graph-edge" x1="12" y1="50" x2="17" y2="31"/>
      <line className="graph-edge" x1="17" y1="31" x2="31" y2="17.1"/>
      <line className="graph-edge" x1="31" y1="17.1" x2="50" y2="12"/>
      
      {/* Ring 3 (16 nodes, r=3), radius ~46 from center */}
      <circle className="graph-node" cx="50" cy="4" r="3" />
      <circle className="graph-node" cx="67.6" cy="8.4" r="3" />
      <circle className="graph-node" cx="81.8" cy="18.2" r="3" />
      <circle className="graph-node" cx="91.6" cy="32.4" r="3" />
      <circle className="graph-node" cx="96" cy="50" r="3" />
      <circle className="graph-node" cx="91.6" cy="67.6" r="3" />
      <circle className="graph-node" cx="81.8" cy="81.8" r="3" />
      <circle className="graph-node" cx="67.6" cy="91.6" r="3" />
      <circle className="graph-node" cx="50" cy="96" r="3" />
      <circle className="graph-node" cx="32.4" cy="91.6" r="3" />
      <circle className="graph-node" cx="18.2" cy="81.8" r="3" />
      <circle className="graph-node" cx="8.4" cy="67.6" r="3" />
      <circle className="graph-node" cx="4" cy="50" r="3" />
      <circle className="graph-node" cx="8.4" cy="32.4" r="3" />
      <circle className="graph-node" cx="18.2" cy="18.2" r="3" />
      <circle className="graph-node" cx="32.4" cy="8.4" r="3" />

      {/* Edges from Ring 2 to Ring 3 (some animated) */}
      <line className="graph-edge graph-edge-active" x1="50" y1="12" x2="50" y2="4" style={{ animationDelay: '1.0s' }}/>
      <line className="graph-edge" x1="69" y1="17.1" x2="67.6" y2="8.4"/>
      <line className="graph-edge graph-edge-active" x1="83" y1="31" x2="81.8" y2="18.2" style={{ animationDelay: '1.1s' }}/>
      <line className="graph-edge" x1="88" y1="50" x2="91.6" y2="32.4"/>
      <line className="graph-edge" x1="88" y1="50" x2="96" y2="50"/>
      <line className="graph-edge graph-edge-active" x1="83" y1="69" x2="91.6" y2="67.6" style={{ animationDelay: '1.2s' }}/>
      <line className="graph-edge" x1="69" y1="82.9" x2="81.8" y2="81.8"/>
      <line className="graph-edge graph-edge-active" x1="50" y1="88" x2="67.6" y2="91.6" style={{ animationDelay: '1.3s' }}/>
      <line className="graph-edge" x1="50" y1="88" x2="50" y2="96"/>
      <line className="graph-edge" x1="31" y1="82.9" x2="32.4" y2="91.6"/>
      <line className="graph-edge graph-edge-active" x1="17" y1="69" x2="18.2" y2="81.8" style={{ animationDelay: '1.4s' }}/>
      <line className="graph-edge" x1="12" y1="50" x2="8.4" y2="67.6"/>
      <line className="graph-edge" x1="12" y1="50" x2="4" y2="50"/>
      <line className="graph-edge graph-edge-active" x1="17" y1="31" x2="8.4" y2="32.4" style={{ animationDelay: '1.5s' }}/>
      <line className="graph-edge" x1="31" y1="17.1" x2="18.2" y2="18.2"/>
      <line className="graph-edge graph-edge-active" x1="31" y1="17.1" x2="32.4" y2="8.4" style={{ animationDelay: '1.6s' }}/>

      {/* Edges connecting Ring 3 nodes (selected ones) */}
      <line className="graph-edge" x1="50" y1="4" x2="67.6" y2="8.4"/>
      <line className="graph-edge" x1="81.8" y1="18.2" x2="91.6" y2="32.4"/>
      <line className="graph-edge" x1="96" y1="50" x2="91.6" y2="67.6"/>
      <line className="graph-edge" x1="81.8" y1="81.8" x2="67.6" y2="91.6"/>
      <line className="graph-edge" x1="50" y1="96" x2="32.4" y2="91.6"/>
      <line className="graph-edge" x1="18.2" y1="81.8" x2="8.4" y2="67.6"/>
      <line className="graph-edge" x1="4" y1="50" x2="8.4" y2="32.4"/>
      <line className="graph-edge" x1="18.2" y1="18.2" x2="32.4" y2="8.4"/>
      {/* Closing the ring */}
       <line className="graph-edge" x1="32.4" y1="8.4" x2="50" y2="4"/>
       <line className="graph-edge" x1="67.6" y1="8.4" x2="81.8" y2="18.2"/>
       <line className="graph-edge" x1="91.6" y1="32.4" x2="96" y2="50"/>
       <line className="graph-edge" x1="91.6" y1="67.6" x2="81.8" y2="81.8"/>
       <line className="graph-edge" x1="67.6" y1="91.6" x2="50" y2="96"/>
       <line className="graph-edge" x1="32.4" y1="91.6" x2="18.2" y2="81.8"/>
       <line className="graph-edge" x1="8.4" y1="67.6" x2="4" y2="50"/>
       <line className="graph-edge" x1="8.4" y1="32.4" x2="18.2" y2="18.2"/>
    </svg>
  );
}

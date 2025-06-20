
"use client";

import { PolyRouteLogo } from './PolyRouteLogo';

export function AppInitialLoad() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <div className="animate-pulse">
        {/* Using larger dimensions for the logo on the initial load screen */}
        <PolyRouteLogo width={768} height={192} />
      </div>
      <p className="mt-4 text-4xl text-primary font-medium">
        Machine Learning powered best swap route finder
      </p>
    </div>
  );
}

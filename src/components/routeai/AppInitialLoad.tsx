
"use client";

import { PolyRouteLogo } from './PolyRouteLogo';

export function AppInitialLoad() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <div className="animate-pulse">
        {/* Using larger dimensions for the logo on the initial load screen */}
        <PolyRouteLogo width={768} height={192} />
      </div>
      <p className="mt-6 text-lg md:text-xl text-muted-foreground font-medium">
        Initializing Your Optimal Routing Experience...
      </p>
    </div>
  );
}

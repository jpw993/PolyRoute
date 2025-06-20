
import { PolyRouteLogo } from './PolyRouteLogo';
import { WalletConnect } from './WalletConnect';

export function Header() {
  return (
    <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center">
          {/* Adjust width/height props as needed for your specific logo dimensions */}
          {/* The h-8 class will set the height, and width will auto-adjust if not specified */}
          <PolyRouteLogo className="h-8 w-auto" />
        </div>
        <WalletConnect />
      </div>
    </header>
  );
}


import { PolyRouteLogo } from './PolyRouteLogo';
import { WalletConnect } from './WalletConnect';

export function Header() {
  return (
    <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <PolyRouteLogo className="h-7 w-7" />
          <h1 className="text-xl font-semibold text-foreground font-headline">PolyRoute</h1>
        </div>
        <WalletConnect />
      </div>
    </header>
  );
}

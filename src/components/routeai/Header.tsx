
import { PolyRouteLogo } from './PolyRouteLogo';
import { WalletConnect } from './WalletConnect';

export function Header() {
  return (
    <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center">
          <PolyRouteLogo className="h-[10.5rem] w-auto" />
        </div>
        <WalletConnect />
      </div>
    </header>
  );
}

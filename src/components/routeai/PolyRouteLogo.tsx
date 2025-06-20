import Image from 'next/image';

interface PolyRouteLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function PolyRouteLogo({ className, width = 160, height = 40 }: PolyRouteLogoProps) {
  return (
    <Image
      src="/polyroute-logo.png" 
      alt="PolyRoute Logo"
      width={width}
      height={height}
      className={className}
      priority 
    />
  );
}

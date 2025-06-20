
import type { SVGProps } from 'react';

export function PolyRouteLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="130"
      height="32"
      viewBox="0 0 130 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M10 6H18C21.3137 6 24 8.68629 24 12V12C24 15.3137 21.3137 18 18 18H10V6Z"
        fill="url(#paint0_linear_poly)"
      />
      <path d="M10 16V26H14V16H10Z" fill="hsl(var(--primary))" />
      <rect x="6" y="10" width="4" height="4" rx="1" fill="hsl(var(--accent))" />
      <rect x="6" y="18" width="4" height="4" rx="1" fill="hsl(var(--accent))" />
      <defs>
        <linearGradient
          id="paint0_linear_poly"
          x1="10"
          y1="6"
          x2="24"
          y2="18"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(var(--accent))" />
        </linearGradient>
      </defs>
      <text
        x="35"
        y="16"
        dominantBaseline="middle"
        fontFamily="Inter, sans-serif"
        fontSize="18"
        fontWeight="600"
        fill="hsl(var(--foreground))"
      >
        PolyRoute
      </text>
    </svg>
  );
}

import type { SVGProps } from 'react';

export function PolyRouteLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 162 32" // Intrinsic aspect ratio and coordinate system
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props} // Allows overriding width/height via props, e.g., className="h-8"
    >
      {/* Polygon Icon Group: Scaled to ~24px height, translated to position */}
      {/* The Polygon path's original viewBox is roughly 0,0 to 36,31 */}
      <g transform="translate(2 3.8) scale(0.83)">
        <path
          d="M20.7202 2C20.0304 2 19.4009 2.38182 19.061 2.99091L13.0269 12.8364L7.00906 2.99091C6.65293 2.38182 6.02343 2 5.34989 2H2.01815C1.52224 2 1.14042 2.44209 1.21989 2.92091L6.18724 30.0791C6.25042 30.4538 6.57133 30.7273 6.94989 30.7273H11.0815C11.5774 30.7273 11.9592 30.2852 11.8797 29.8064L10.0656 19.102L14.9672 29.7152C15.1997 30.187 15.6693 30.5442 16.1856 30.6515C16.3129 30.6792 16.4426 30.6921 16.5713 30.6921C16.9499 30.6921 17.3195 30.5442 17.5993 30.2L22.9793 22.2045L25.0034 29.8064C25.0828 30.2852 25.4646 30.7273 25.9605 30.7273H30.0922C30.4708 30.7273 30.7917 30.4538 30.8549 30.0791L35.8222 2.92091C35.8854 2.53091 35.6208 2.15909 35.2422 2.04545C35.1149 2.01073 34.9815 1.99782 34.8476 2H31.5159C30.8424 2 30.2129 2.38182 29.8729 2.99091L23.8551 12.8364L17.8209 2.99091C17.481 2.38182 16.8515 2 16.1779 2H20.7202Z"
          fill="hsl(var(--primary))"
        />
      </g>
      {/* PolyRoute Text */}
      <text
        x="38" // Positioned to the right of the icon
        y="22" // Vertically aligned with the icon (approximate baseline)
        fontFamily="Inter, sans-serif"
        fontSize="18"
        fontWeight="600" // Semi-bold
        fill="hsl(var(--primary))" // Matching icon color as per the user's image
      >
        PolyRoute
      </text>
    </svg>
  );
}

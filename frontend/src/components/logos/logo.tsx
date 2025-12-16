import React from "react";

type LogoProps = {
  className?: string;
};

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 106.15385 104.02295"
      width="106"
      height="104"
    >
      <rect
        x="2.645837"
        y="2.645833"
        width="100.86218"
        height="98.731285"
        fill="none"
        stroke="#fff"
        strokeWidth="5.29167"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />

      <text x="16.917832" y="87" fontSize="96.2363" fill="#fff">
        H
      </text>
    </svg>
  );
};

export default Logo;

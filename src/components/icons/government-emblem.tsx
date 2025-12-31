import React from 'react';

const GovernmentEmblem = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_emblem)">
      <path d="M50 5C25.16 5 5 25.16 5 50s20.16 45 45 45 45-20.16 45-45S74.84 5 50 5z" fill="#228B22" />
      <path d="M50 10c22.09 0 40 17.91 40 40s-17.91 40-40 40S10 72.09 10 50 27.91 10 50 10z" fill="#fff" />
      <path d="M50,20 L65,35 L60,38 L50,30 L40,38 L35,35 Z" fill="#800000" />
      <path d="M50,35 L60,45 L50,80 L40,45 Z" fill="#228B22" />
      <path d="M50,35 L55,42 L50,70 L45,42 Z" fill="#F0FAF0" />
      <rect x="47" y="20" width="6" height="15" fill="#FFA500" />
      <path d="M30,40 h40 l-5,10 h-30 z" fill="#000080" />
      <path d="M32,42 h36 l-4,6 h-28 z" fill="#ADD8E6" />
    </g>
    <defs>
      <clipPath id="clip0_emblem">
        <rect width="100" height="100" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default GovernmentEmblem;

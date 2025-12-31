import React from 'react';

const AndroidIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M17 9.5H7a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1Z" fill="#3DDC84" stroke="none" />
    <path d="M12 16.5v-7" stroke="#fff" />
    <path d="M9 13.5h6" stroke="#fff" />
    <path d="M17.5 9.5a5.5 5.5 0 1 0-11 0" fill="#3DDC84" stroke="none"/>
    <path d="M9 7L7.5 5.5" stroke="#3DDC84" strokeWidth="1.5" />
    <path d="M15 7l1.5-1.5" stroke="#3DDC84" strokeWidth="1.5" />
  </svg>
);

export default AndroidIcon;

import Image from 'next/image';
import React from 'react';

const GovernmentEmblem = ({ className }: { className?: string }) => {
  // Ensure the container is relative for the 'fill' property to work
  const containerClassName = `relative flex items-center justify-center ${className || ''}`;

  return (
    <div className={containerClassName}>
      <Image
        src="/logo.png"
        alt="TN-PDS Logo"
        fill
        sizes="(max-width: 768px) 100vw, 256px"
        className="object-contain"
        priority
        unoptimized
      />
    </div>
  );
};

export default GovernmentEmblem;

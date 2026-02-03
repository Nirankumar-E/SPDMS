import Image from 'next/image';
import React from 'react';

const GovernmentEmblem = ({ className }: { className?: string }) => {
  const containerClassName = `relative ${className || ''}`;

  return (
    <div className={containerClassName}>
      <Image
        src="/logo.png"
        alt="Portal Logo"
        fill
        sizes="256px"
        style={{ objectFit: 'contain' }}
        priority
      />
    </div>
  );
};

export default GovernmentEmblem;

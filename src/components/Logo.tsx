import React from 'react';
import Image from 'next/image';

interface LogoProps {
  src?: string;
  width?: number;
  height?: number;
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ src = '/images/logo.png', width = 40, height = 40, className = "rounded-md", showText = true }) => {
  return (
    <div className="flex items-center gap-2">
      <Image src={src} alt="Logo" width={width} height={height} className={className} />
      {showText && <span className="text-xl font-bold">AutoPro</span>}
    </div>
  );
};

export default Logo;
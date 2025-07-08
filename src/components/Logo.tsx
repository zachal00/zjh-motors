import React from 'react';
import Image from 'next/image';

interface LogoProps {
  src?: string;
  width?: number;
  height?: number;
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ src = 'https://assets.co.dev/f04d1c9e-1c8e-4e1f-a9f2-8889d85dd7b5/file-8b0eaf8.png', width = 40, height = 40, className = "rounded-md", showText = true }) => {
  return (
    <div className="flex items-center gap-2">
      <Image src={src} alt="Logo" width={width} height={height} className={className} />
      {showText && <span className="text-xl font-bold">AutoPro</span>}
    </div>
  );
};

export default Logo;
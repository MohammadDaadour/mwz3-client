'use client';
import { ComponentProps } from 'react';
import Image from 'next/image';

type ClientImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
} & Omit<ComponentProps<typeof Image>, 'src' | 'alt' | 'width' | 'height'>;

export default function ClientImage({
  src,
  alt,
  className,
  width = 150,
  height = 150,
  ...props
}: ClientImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className || 'w-[150px] mt-2'}
      {...props}
    />
  );
}

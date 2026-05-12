// app/components/ImageSlider.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ServerImage from './ServerImage';

interface ImageType {
  id: string;
  mime: string;
}

interface ImageSliderProps {
  images: ImageType[];
  postId: string; // Required for API-based images
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, postId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlay, images.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full max-w-4xl my-2 mx-auto bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
      <div className="relative h-96 overflow-hidden">
        {images[currentIndex] && (
          <ServerImage
            postId={postId}
            imageId={images[currentIndex].id}
            alt={images[currentIndex].mime || 'Slide image'}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
        )}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      <div className="flex justify-center gap-2 py-4 bg-gray-800">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentIndex ? 'bg-white' : 'bg-gray-400 hover:bg-gray-300'
            }`}
          />
        ))}
      </div>
      <div className="absolute bottom-16 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default ImageSlider;
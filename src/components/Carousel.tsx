import React, { useState, useRef, useEffect } from 'react';
import './Carousel.css';

interface CarouselProps {
  children: React.ReactNode[];
  itemsPerView?: number;
  gap?: number;
}

const Carousel: React.FC<CarouselProps> = ({ 
  children, 
  itemsPerView = 3,
  gap = 24 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemWidth, setItemWidth] = useState(0);
  const [responsiveItemsPerView, setResponsiveItemsPerView] = useState(itemsPerView);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateItemWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        
        // Responsive items per view based on screen width
        let items = itemsPerView;
        if (containerWidth < 600) {
          items = 1;
        } else if (containerWidth < 900) {
          items = Math.min(2, itemsPerView);
        }
        
        setResponsiveItemsPerView(items);
        
        const totalGap = gap * (items - 1);
        const width = (containerWidth - totalGap) / items;
        setItemWidth(width);
      }
    };

    updateItemWidth();
    window.addEventListener('resize', updateItemWidth);
    return () => window.removeEventListener('resize', updateItemWidth);
  }, [itemsPerView, gap]);

  const maxIndex = Math.max(0, children.length - responsiveItemsPerView);

  // Reset index if it exceeds max when resizing
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const translateX = currentIndex * (itemWidth + gap);

  return (
    <div className="carousel">
      <div className="carousel-container" ref={containerRef}>
        <div 
          className="carousel-track"
          style={{
            transform: `translateX(-${translateX}px)`,
            gap: `${gap}px`
          }}
        >
          {children.map((child, index) => (
            <div 
              key={index}
              className="carousel-item"
              style={{ 
                minWidth: itemWidth > 0 ? `${itemWidth}px` : 'auto',
                maxWidth: itemWidth > 0 ? `${itemWidth}px` : 'auto',
                width: itemWidth > 0 ? `${itemWidth}px` : 'auto'
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {children.length > responsiveItemsPerView && (
        <div className="carousel-controls">
          <button 
            className="carousel-btn carousel-btn-prev"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="Previous"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          
          <div className="carousel-indicators">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button 
            className="carousel-btn carousel-btn-next"
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            aria-label="Next"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Carousel;

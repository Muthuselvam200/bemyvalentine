import React, { useState, useRef, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+Cjwvc3ZnPgo=",
  width,
  height,
  loading = "lazy",
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  // Generate WebP and AVIF sources for modern browsers
  const getSrcSet = (originalSrc) => {
    if (!originalSrc || originalSrc.endsWith('.gif') || originalSrc.endsWith('.mp3')) {
      return originalSrc;
    }
    
    const baseName = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '');
    return `${baseName}.webp 1x, ${baseName}.avif 1x`;
  };

  const srcSet = getSrcSet(src);

  return (
    <div 
      ref={imgRef}
      className={`optimized-image-container ${className || ''}`}
      style={{ 
        position: 'relative',
        width: width || 'auto',
        height: height || 'auto',
        overflow: 'hidden'
      }}
    >
      {/* Placeholder while loading */}
      {!isLoaded && !hasError && (
        <div 
          className="image-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}
        >
          <div 
            className="loading-spinner"
            style={{
              width: '20px',
              height: '20px',
              border: '2px solid #ccc',
              borderTop: '2px solid #ff6b9d',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          ></div>
        </div>
      )}

      {/* Main image with modern format support */}
      {isInView && (
        <picture style={{ width: '100%', height: '100%' }}>
          {/* AVIF format for modern browsers (best compression) */}
          {src && !src.endsWith('.gif') && !src.endsWith('.mp3') && (
            <source 
              srcSet={src.replace(/\.(jpg|jpeg|png)$/i, '.avif')} 
              type="image/avif" 
            />
          )}
          
          {/* WebP format for broader support */}
          {src && !src.endsWith('.gif') && !src.endsWith('.mp3') && (
            <source 
              srcSet={src.replace(/\.(jpg|jpeg|png)$/i, '.webp')} 
              type="image/webp" 
            />
          )}
          
          {/* Fallback to original format */}
          <img
            src={src}
            alt={alt}
            loading={loading}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              display: hasError ? 'none' : 'block'
            }}
            {...props}
          />
        </picture>
      )}

      {/* Error fallback */}
      {hasError && (
        <div 
          className="image-error"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#f5f5f5',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            zIndex: 2
          }}
        >
          Image not available
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
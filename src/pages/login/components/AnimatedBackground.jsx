import React, { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;

    const ctx = canvas?.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particles = [];
      // Adjust particle density based on screen size
      const particleCount = Math.min(60, Math.floor(window.innerWidth / 15));
      
      for (let i = 0; i < particleCount; i++) {
        particles?.push({
          x: Math.random() * canvas?.width,
          y: Math.random() * canvas?.height,
          size: Math.random() * 2 + 0.5, // Smaller, subtle particles
          speedX: (Math.random() - 0.5) * 0.2, // Slower movement
          speedY: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.4 + 0.1, // Very subtle opacity
          hue: Math.random() * 40 + 200 // Hues from deep blue (200) to cyan/light blue (240)
        });
      }
      return particles;
    };

    const animate = () => {
      ctx?.clearRect(0, 0, canvas?.width, canvas?.height);
      
      // Create subtle gradient background (Deep Navy Blue to Lighter Blue)
      const gradient = ctx?.createLinearGradient(0, 0, canvas?.width, canvas?.height);
      gradient?.addColorStop(0, 'rgba(0, 77, 153, 0.05)'); // Primary/Navy
      gradient?.addColorStop(0.5, 'rgba(0, 153, 204, 0.03)'); // Secondary/Cyan
      gradient?.addColorStop(1, 'rgba(0, 77, 153, 0.05)'); 
      
      ctx.fillStyle = gradient;
      ctx?.fillRect(0, 0, canvas?.width, canvas?.height);
      
      // Animate particles
      particlesRef?.current?.forEach((particle, index) => {
        // Update position
        particle.x += particle?.speedX;
        particle.y += particle?.speedY;
        
        // Wrap around edges
        if (particle?.x < 0) particle.x = canvas?.width;
        if (particle?.x > canvas?.width) particle.x = 0;
        if (particle?.y < 0) particle.y = canvas?.height;
        if (particle?.y > canvas?.height) particle.y = 0;
        
        // Draw particle
        ctx?.save();
        ctx.globalAlpha = particle?.opacity;
        ctx.fillStyle = `hsl(${particle?.hue}, 80%, 70%)`; // Brighter saturation for particle dots
        ctx?.beginPath();
        ctx?.arc(particle?.x, particle?.y, particle?.size, 0, Math.PI * 2);
        ctx?.fill();
        ctx?.restore();
        
        // Draw connections to nearby particles
        particlesRef?.current?.slice(index + 1)?.forEach(otherParticle => {
          const dx = particle?.x - otherParticle?.x;
          const dy = particle?.y - otherParticle?.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) { // Slightly increased connection distance
            ctx?.save();
            ctx.globalAlpha = (120 - distance) / 120 * 0.08; // Very subtle connections
            ctx.strokeStyle = `hsl(210, 80%, 60%)`; // Light blue connection lines
            ctx.lineWidth = 1;
            ctx?.beginPath();
            ctx?.moveTo(particle?.x, particle?.y);
            ctx?.lineTo(otherParticle?.x, otherParticle?.y);
            ctx?.stroke();
            ctx?.restore();
          }
        });
      });
      
      animationId = requestAnimationFrame(animate);
    };

    const init = () => {
      resizeCanvas();
      particlesRef.current = createParticles();
      animate();
    };

    init();
    window.addEventListener('resize', () => {
      resizeCanvas();
      particlesRef.current = createParticles();
    });

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
};

export default AnimatedBackground;

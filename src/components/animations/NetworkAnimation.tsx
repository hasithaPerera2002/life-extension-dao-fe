
import React, { useEffect, useRef } from 'react';

export const NetworkAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Node class to represent each point in the network
    class Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      
      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = 1.5 + Math.random() * 1.5;
        this.color = '#00F0FF';
      }
      
      update(width: number, height: number) {
        // Update position based on velocity
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }
    
    // Create nodes
    const nodeCount = Math.floor((canvas.width * canvas.height) / 10000); // Responsive node count
    const nodes: Node[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new Node(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      ));
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update nodes
      nodes.forEach(node => node.update(canvas.width, canvas.height));
      
      // Draw connections
      ctx.lineWidth = 0.3;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Only connect nodes within a certain distance
          if (distance < 100) {
            // Calculate opacity based on distance
            const opacity = 1 - (distance / 100);
            
            // Create gradient for the line
            const gradient = ctx.createLinearGradient(
              nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y
            );
            
            gradient.addColorStop(0, `rgba(0, 240, 255, ${opacity * 0.2})`);
            gradient.addColorStop(0.5, `rgba(0, 255, 148, ${opacity * 0.5})`);
            gradient.addColorStop(1, `rgba(0, 240, 255, ${opacity * 0.2})`);
            
            // Draw the connection
            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Draw nodes
      nodes.forEach(node => node.draw(ctx));
      
      // Animate
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none -z-10"
    />
  );
};

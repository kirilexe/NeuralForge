import { useEffect, useRef } from "react";

export default function NeuralBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stars = [];
    const FPS = 60;
    const NUM_STARS = 100;
    const mouse = { x: 0, y: 0 };

    // Helper to set canvas size correctly for devicePixelRatio and CSS pixels
    function setCanvasSize() {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      // set transform so drawing commands use CSS pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initStars() {
      stars.length = 0;
      for (let i = 0; i < NUM_STARS; i++) {
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          radius: Math.random() + 1,
          vx: Math.floor(Math.random() * 50) - 25,
          vy: Math.floor(Math.random() * 50) - 25,
        });
      }
    }

    function distance(p1, p2) {
      const xs = p2.x - p1.x;
      const ys = p2.y - p1.y;
      return Math.sqrt(xs * xs + ys * ys);
    }

    function draw() {
      // clear using CSS pixels (ctx transform maps to CSS pixels)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalCompositeOperation = "lighter";

      for (let s of stars) {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.stroke();
      }

      ctx.beginPath();
      for (let i = 0; i < stars.length; i++) {
        const starI = stars[i];
        ctx.moveTo(starI.x, starI.y);

        if (distance(mouse, starI) < 150) ctx.lineTo(mouse.x, mouse.y);

        for (let j = 0; j < stars.length; j++) {
          const starII = stars[j];
          if (distance(starI, starII) < 150) {
            ctx.lineTo(starII.x, starII.y);
          }
        }
      }
      ctx.lineWidth = 0.05;
      ctx.strokeStyle = "white";
      ctx.stroke();
    }

    function update() {
      for (let s of stars) {
        s.x += s.vx / FPS;
        s.y += s.vy / FPS;
        if (s.x < 0 || s.x > window.innerWidth) s.vx = -s.vx;
        if (s.y < 0 || s.y > window.innerHeight) s.vy = -s.vy;
      }
    }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    // handle resize
    const handleResize = () => {
      setCanvasSize();
      // reinitialize stars so they fit new size
      initStars();
    };
    window.addEventListener("resize", handleResize);

    let animationFrameId;

    function tick() {
      draw();
      update();
      animationFrameId = requestAnimationFrame(tick);
    }

    tick();

    // Initialize sizes and stars then start loop
    setCanvasSize();
    initStars();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Use z-0 so the canvas renders above the page background but behind UI; pointer-events-none prevents blocking clicks
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-50" />;
}

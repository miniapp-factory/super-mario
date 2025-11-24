"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const canvasWidth = 800;
const canvasHeight = 600;
const fruitImages = ["🍎","🍌","🍇","🍓"];
const fruitSize = 50;
const gravity = 0.5;
const sliceSound = new Audio("/slice.mp3");

interface Fruit {
  x: number;
  y: number;
  vy: number;
  type: string;
  sliced: boolean;
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{x:number,y:number}|null>(null);

  // spawn fruits
  useEffect(() => {
    const interval = setInterval(() => {
      setFruits(f => [...f, {
        x: Math.random() * (canvasWidth - fruitSize),
        y: -fruitSize,
        vy: Math.random() * 2 + 1,
        type: fruitImages[Math.floor(Math.random()*fruitImages.length)],
        sliced: false
      }]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrameId: number;

    const update = () => {
      // update fruits
      setFruits(f => f.map(fr => ({
        ...fr,
        y: fr.y + fr.vy
      })));

      // remove off screen
      setFruits(f => f.filter(fr => fr.y < canvasHeight + fruitSize));

      // draw
      ctx.clearRect(0,0,canvasWidth,canvasHeight);
      ctx.font = `${fruitSize}px serif`;
      fruits.forEach(fr => {
        if (!fr.sliced) {
          ctx.fillText(fr.type, fr.x, fr.y);
        }
      });

      // check game over: if any fruit reaches bottom
      if (fruits.some(fr => fr.y > canvasHeight - 20)) {
        setGameOver(true);
      }
    };

    const loop = () => {
      update();
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => cancelAnimationFrame(animationFrameId);
  }, [fruits]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({x:e.nativeEvent.offsetX, y:e.nativeEvent.offsetY});
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragging || !dragStart) return;
    const dragEnd = {x:e.nativeEvent.offsetX, y:e.nativeEvent.offsetY};
    // simple line intersection: check if line crosses fruit bounding box
    setFruits(f => f.map(fr => {
      if (fr.sliced) return fr;
      const {x,y} = fr;
      const w = fruitSize;
      const h = fruitSize;
      // line equation
      const dx = dragEnd.x - dragStart.x;
      const dy = dragEnd.y - dragStart.y;
      const t = ((x - dragStart.x) * dx + (y - dragStart.y) * dy) / (dx*dx + dy*dy);
      const closestX = dragStart.x + t * dx;
      const closestY = dragStart.y + t * dy;
      const dist = Math.hypot(closestX - x, closestY - y);
      if (dist < w/2) {
        sliceSound.play();
        setScore(s => s + 1);
        return {...fr, sliced:true};
      }
      return fr;
    }));
    setDragging(false);
    setDragStart(null);
  };

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl mb-4">Game Over</h1>
        <p className="mb-4">Score: {score}</p>
        <Button onClick={() => { setScore(0); setGameOver(false); setFruits([]); }}>Restart</Button>
        <Share text={`I sliced ${score} fruits in Fruit Ninja Mini App! ${url}`} />
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border-2 border-black bg-white"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      />
      <div className="absolute top-2 right-2 text-xl">Score: {score}</div>
    </div>
  );
}

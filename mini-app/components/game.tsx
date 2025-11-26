"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const canvasWidth = 800;
const canvasHeight = 600;
const fruitImages = ["🍎","🍌","🍇","🍓"];
const fruitSize = 50;

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
  const fruitsRef = useRef<Fruit[]>([]);
  useEffect(() => {
    fruitsRef.current = fruits;
  }, [fruits]);

  // spawn fruits
  useEffect(() => {
    const interval = setInterval(() => {
      setFruits(f => [...f, {
        x: Math.random() * (canvasWidth - fruitSize),
        y: -fruitSize,
        vy: Math.random() * 2 + 1 + Math.floor(score / 50),
        type: fruitImages[Math.floor(Math.random()*fruitImages.length)],
        sliced: false
      }]);
    }, 2000);
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
      })).filter(fr => fr.y < canvasHeight + fruitSize && !fr.sliced));

      // draw
      ctx.clearRect(0,0,canvasWidth,canvasHeight);
      ctx.font = `${fruitSize}px serif`;
      fruitsRef.current.forEach(fr => {
        if (!fr.sliced) {
          ctx.fillText(fr.type, fr.x, fr.y);
        }
      });

      // check game over: if any unsliced fruit reaches bottom
      if (fruitsRef.current.some(fr => !fr.sliced && fr.y > canvasHeight - 20)) {
        setGameOver(true);
      }
    };

    const loop = () => {
      update();
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    setFruits(f => f.map(fr => {
      if (fr.sliced) return fr;
      const {x, y} = fr;
      const w = fruitSize;
      const h = fruitSize;
      if (clickX >= x && clickX <= x + w && clickY >= y && clickY <= y + h) {
        setScore(s => s + 1);
        return {...fr, sliced: true};
      }
      return fr;
    }));
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
        onClick={handleClick}
      />
      <div className="absolute top-2 right-2 text-xl">Score: {score}</div>
    </div>
  );
}

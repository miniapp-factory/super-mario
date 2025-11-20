"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const canvasWidth = 800;
const canvasHeight = 400;

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [stage, setStage] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);

  // Basic game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const update = () => {
      // TODO: Update game state (player, enemies, coins, physics)
      // For now, just clear the canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      // Draw placeholder
      ctx.fillStyle = "#88c";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = "#000";
      ctx.font = "20px Arial";
      ctx.fillText(`Stage ${stage}  Score: ${score}  Lives: ${lives}`, 10, 30);
    };

    const loop = () => {
      update();
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => cancelAnimationFrame(animationFrameId);
  }, [stage, score, lives]);

  // Simple controls
  const moveLeft = () => console.log("move left");
  const moveRight = () => console.log("move right");
  const jump = () => console.log("jump");

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl mb-4">Game Over</h1>
        <Button onClick={() => { setStage(1); setLives(3); setScore(0); setGameOver(false); }}>
          Restart
        </Button>
        <Share text={`I scored ${score} points in Super Mario Mini App! ${url}`} />
      </div>
    );
  }

  if (victory) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl mb-4">Victory!</h1>
        <p className="mb-4">Final Score: {score}</p>
        <Button onClick={() => { setStage(1); setLives(3); setScore(0); setVictory(false); }}>
          Play Again
        </Button>
        <Share text={`I scored ${score} points in Super Mario Mini App! ${url}`} />
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
      />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <Button onClick={moveLeft}>←</Button>
        <Button onClick={jump}>↑</Button>
        <Button onClick={moveRight}>→</Button>
      </div>
    </div>
  );
}

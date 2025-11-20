"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const canvasWidth = 800;
const canvasHeight = 400;
const platformY = canvasHeight - 50;
const gravity = 0.6;
const playerSpeed = 3;
const jumpVelocity = -12;
const enemySpeed = 1.5;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [stage, setStage] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);

  const [player, setPlayer] = useState<Rect>({
    x: 50,
    y: platformY - 50,
    width: 30,
    height: 50,
  });

  const [enemies, setEnemies] = useState<Rect[]>([
    { x: canvasWidth - 50, y: platformY - 50, width: 30, height: 50 },
    { x: canvasWidth - 150, y: platformY - 50, width: 30, height: 50 },
  ]);

  const [velocityY, setVelocityY] = useState(0);
  const [onGround, setOnGround] = useState(true);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const update = () => {
      // Apply gravity
      if (!onGround) {
        setVelocityY((v) => v + gravity);
      }

      // Update player position
      setPlayer((p) => ({
        ...p,
        y: p.y + velocityY,
      }));

      // Ground collision
      if (player.y + player.height >= platformY) {
        setPlayer((p) => ({ ...p, y: platformY - p.height }));
        setVelocityY(0);
        setOnGround(true);
      } else {
        setOnGround(false);
      }

      // Update enemies
      setEnemies((es) =>
        es.map((e) => ({
          ...e,
          x: e.x - enemySpeed,
        }))
      );

      // Collision detection
      enemies.forEach((e, idx) => {
        // Head hit
        if (
          player.y + player.height <= e.y + 5 &&
          player.y + player.height >= e.y &&
          player.x + player.width > e.x &&
          player.x < e.x + e.width
        ) {
          // Remove enemy
          setEnemies((es) => es.filter((_, i) => i !== idx));
          setScore((s) => s + 1);
        }
        // Side hit
        else if (
          player.x + player.width > e.x &&
          player.x < e.x + e.width &&
          player.y + player.height > e.y &&
          player.y < e.y + e.height
        ) {
          // Lose life
          setLives((l) => l - 1);
          // Reset player position
          setPlayer({ x: 50, y: platformY - 50, width: 30, height: 50 });
          setVelocityY(0);
          setOnGround(true);
        }
      });

      // Remove enemies that go off screen
      setEnemies((es) => es.filter((e) => e.x + e.width > 0));

      // Stage completion
      if (player.x + player.width >= canvasWidth - 50) {
        if (stage < 6) {
          setStage((s) => s + 1);
          // Reset level
          setPlayer({ x: 50, y: platformY - 50, width: 30, height: 50 });
          setEnemies([
            { x: canvasWidth - 50, y: platformY - 50, width: 30, height: 50 },
            { x: canvasWidth - 150, y: platformY - 50, width: 30, height: 50 },
          ]);
        } else {
          setVictory(true);
        }
      }

      // Game over
      if (lives <= 0) {
        setGameOver(true);
      }

      // Draw
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      // Platform
      ctx.fillStyle = "#654321";
      ctx.fillRect(0, platformY, canvasWidth, 10);
      // Player
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(player.x, player.y, player.width, player.height);
      // Enemies
      ctx.fillStyle = "#00ff00";
      enemies.forEach((e) => {
        ctx.fillRect(e.x, e.y, e.width, e.height);
      });
      // Score
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
  }, [player, enemies, score, lives, stage, gameOver, victory]);

  // Controls
  const moveLeft = () => {
    setPlayer((p) => ({ ...p, x: Math.max(p.x - playerSpeed, 0) }));
  };
  const moveRight = () => {
    setPlayer((p) => ({ ...p, x: Math.min(p.x + playerSpeed, canvasWidth - p.width) }));
  };
  const jump = () => {
    if (onGround) {
      setVelocityY(jumpVelocity);
      setOnGround(false);
    }
  };

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

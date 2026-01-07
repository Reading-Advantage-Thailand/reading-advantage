"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  useGameStore,
  VocabularyItem,
  CastleId,
  MAX_CASTLE_HP,
} from "@/store/useGameStore";
import { withBasePath } from "@/lib/games/basePath";
import { useInterval } from "@/hooks/useInterval";
import { useSound } from "@/hooks/useSound";
import { nanoid } from "nanoid";
import { InputController } from "./InputController";
import { AnimatePresence, motion } from "framer-motion";
import { Wand2 } from "lucide-react";
import { Enemy } from "./Enemy";
import { Explosion } from "./Explosion";
import { MagicBolt } from "./MagicBolt";
import { HUD } from "./HUD";

interface ActiveMissile extends VocabularyItem {
  id: string;
  x: number;
  targetX: number;
  targetCastleId: CastleId;
  state: "falling" | "targeted" | "dying";
}

interface ActiveExplosion {
  id: string;
  x: number;
  y: number;
}

interface ActiveBolt {
  id: string;
  startX: number;
  targetX: number;
  targetY: number;
  targetEnemyId: string;
}

const CASTLE_SHEET = withBasePath("/games/magic-defense/castles_3x2_sheet.png");
const CASTLE_COLUMNS = 2;
const CASTLE_ROWS = 3;
const CASTLE_SHEET_WIDTH = 1536;
const CASTLE_SHEET_HEIGHT = 1024;
const CASTLE_SPRITE_WIDTH = 768;
const CASTLE_SPRITE_HEIGHT = 341;
const CASTLE_SCALE = 0.25;
const CASTLE_RENDER_WIDTH = CASTLE_SPRITE_WIDTH * CASTLE_SCALE;
const CASTLE_RENDER_HEIGHT = CASTLE_SPRITE_HEIGHT * CASTLE_SCALE;
const CASTLE_BAR_HEIGHT = 8;
const BACKGROUND_IMAGE = withBasePath("/games/magic-defense/background.png");
const CASTLE_POSITIONS: Record<CastleId, number> = {
  left: 20,
  center: 50,
  right: 80,
};

const getCastleSpriteStyle = (column: number, row: number) => ({
  backgroundImage: `url(${CASTLE_SHEET})`,
  backgroundSize: `${CASTLE_SHEET_WIDTH}px ${CASTLE_SHEET_HEIGHT}px`,
  backgroundPosition: `${(column / (CASTLE_COLUMNS - 1)) * 100}% ${(row / (CASTLE_ROWS - 1)) * 100}%`,
  backgroundRepeat: "no-repeat",
});

const getCastleRowForHp = (hp: number) => {
  if (hp >= MAX_CASTLE_HP) return 0;
  if (hp === 2) return 1;
  return 2;
};

const getNearestAliveCastleId = (
  x: number,
  castles: Record<CastleId, number>
): CastleId => {
  const entries = (
    Object.entries(CASTLE_POSITIONS) as [CastleId, number][]
  ).filter(([castleId]) => castles[castleId] > 0);
  if (entries.length === 0) return "center";

  return entries.reduce((closest, [castleId, position]) => {
    const closestDistance = Math.abs(x - CASTLE_POSITIONS[closest]);
    const currentDistance = Math.abs(x - position);
    return currentDistance < closestDistance ? castleId : closest;
  }, entries[0][0]);
};

const getRandomAliveCastleId = (
  castles: Record<CastleId, number>
): CastleId => {
  const aliveCastles = (Object.keys(castles) as CastleId[]).filter(
    (castleId) => castles[castleId] > 0
  );
  if (aliveCastles.length === 0) return "center";

  return aliveCastles[Math.floor(Math.random() * aliveCastles.length)];
};

const getCastleMotion = (hp: number) => ({
  opacity: hp > 0 ? 1 : 0.2,
  scale: hp > 0 ? 1 : 0.85,
  y: hp > 0 ? 0 : 20,
  filter: hp > 0 ? "none" : "grayscale(100%) brightness(0.4)",
});

const getHealthPercent = (hp: number) =>
  `${(Math.max(hp, 0) / MAX_CASTLE_HP) * 100}%`;

export function GameEngine() {
  const {
    vocabulary,
    status,
    castles,
    score,
    correctAnswers,
    totalAttempts,
    damageCastle,
    increaseScore,
    incrementAttempts,
  } = useGameStore();
  const { playSound } = useSound();
  const [activeMissiles, setActiveMissiles] = useState<ActiveMissile[]>([]);
  const handledHitsRef = useRef<Set<string>>(new Set());
  const [explosions, setExplosions] = useState<ActiveExplosion[]>([]);
  const [bolts, setBolts] = useState<ActiveBolt[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [spawnRate, setSpawnRate] = useState(5000);
  const [missileDuration, setMissileDuration] = useState(15);

  const accuracy = totalAttempts > 0 ? correctAnswers / totalAttempts : 0;
  const leftCastleRow = getCastleRowForHp(castles.left);
  const centerCastleRow = getCastleRowForHp(castles.center);
  const rightCastleRow = getCastleRowForHp(castles.right);

  const spawnMissile = useCallback(() => {
    if (status !== "playing" || vocabulary.length === 0) return;

    const randomVocab =
      vocabulary[Math.floor(Math.random() * vocabulary.length)];
    const startX = Math.random() * 25 + 37.5;
    const targetCastleId = getNearestAliveCastleId(startX, castles);
    const newMissile: ActiveMissile = {
      ...randomVocab,
      id: nanoid(),
      x: startX,
      targetCastleId,
      targetX: CASTLE_POSITIONS[targetCastleId],
      state: "falling",
    };

    setActiveMissiles((prev) => [...prev, newMissile]);
  }, [status, vocabulary, castles]);

  useInterval(spawnMissile, status === "playing" ? spawnRate : null);

  const handleReachBottom = useCallback(
    (id: string) => {
      if (handledHitsRef.current.has(id)) return;
      handledHitsRef.current.add(id);

      const target = activeMissiles.find((missile) => missile.id === id);
      if (!target) return;

      playSound("missile-hit");
      setConsecutiveCorrect(0);
      setSpawnRate((prev) => Math.min(prev + 200, 3000));
      setMissileDuration((prev) => Math.min(prev + 0.5, 15));

      incrementAttempts();
      damageCastle(getNearestAliveCastleId(target.targetX, castles));
      setActiveMissiles((prev) => prev.filter((missile) => missile.id !== id));
    },
    [activeMissiles, damageCastle, playSound, incrementAttempts, castles]
  );

  const handleBoltComplete = useCallback(
    (boltId: string, enemyId: string, enemyX: number) => {
      setBolts((prev) => prev.filter((b) => b.id !== boltId));

      // Trigger explosion
      setExplosions((prev) => [
        ...prev,
        {
          id: nanoid(),
          x: enemyX,
          y: 50, // Approximate Y since we don't track it perfectly
        },
      ]);

      // Start death animation on hit
      setActiveMissiles((prev) =>
        prev.map((missile) =>
          missile.id === enemyId ? { ...missile, state: "dying" } : missile
        )
      );
    },
    []
  );

  const handleDeathComplete = useCallback((enemyId: string) => {
    setActiveMissiles((prev) =>
      prev.filter((missile) => missile.id !== enemyId)
    );
  }, []);

  const checkAnswer = useCallback(
    (answer: string) => {
      const matchingMissile = activeMissiles.find(
        (m) =>
          m.state === "falling" &&
          m.translation.toLowerCase() === answer.toLowerCase()
      );

      if (matchingMissile) {
        playSound("success");
        setFeedback("correct");
        setConsecutiveCorrect((prev) => prev + 1);

        setActiveMissiles((prev) =>
          prev.map((missile) =>
            missile.id === matchingMissile.id
              ? { ...missile, state: "targeted" }
              : missile
          )
        );

        const casterId = getRandomAliveCastleId(castles);
        const casterX = CASTLE_POSITIONS[casterId];

        // Spawn Bolt
        const boltId = nanoid();
        setBolts((prev) => [
          ...prev,
          {
            id: boltId,
            startX: casterX,
            targetX: matchingMissile.targetX,
            targetY: 20, // Aim high
            targetEnemyId: matchingMissile.id,
          },
        ]);

        if ((consecutiveCorrect + 1) % 3 === 0) {
          setSpawnRate((prev) => Math.max(prev - 200, 1000));
          setMissileDuration((prev) => Math.max(prev - 0.5, 5));
        }

        increaseScore(10);
        setTimeout(() => setFeedback(null), 500);
        return true;
      } else {
        playSound("error");
        setFeedback("incorrect");
        setConsecutiveCorrect(0);
        incrementAttempts();
        setTimeout(() => setFeedback(null), 500);
        return false;
      }
    },
    [
      activeMissiles,
      playSound,
      consecutiveCorrect,
      increaseScore,
      incrementAttempts,
      castles,
    ]
  );

  if (status !== "playing") return null;

  return (
    <div
      data-testid="game-stage"
      className="relative w-full h-[600px] overflow-hidden border-x-4 border-slate-800 shadow-inner rounded-lg bg-slate-900"
      style={{
        backgroundImage: `url(${BACKGROUND_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${
          feedback === "correct"
            ? "bg-emerald-500/20"
            : feedback === "incorrect"
              ? "bg-red-900/40"
              : "bg-transparent"
        }`}
        aria-hidden="true"
      />
      <div className="relative z-10 h-full">
        <HUD score={score} accuracy={accuracy} />

        <AnimatePresence>
          {activeMissiles.map((missile) => (
            <Enemy
              key={missile.id}
              id={missile.id}
              x={missile.x}
              targetX={missile.targetX}
              term={missile.term}
              duration={missileDuration}
              state={missile.state}
              onReachBottom={handleReachBottom}
              onDeathComplete={handleDeathComplete}
            />
          ))}
        </AnimatePresence>

        {bolts.map((bolt) => (
          <MagicBolt
            key={bolt.id}
            startX={bolt.startX}
            startY={80} // Wizard position
            targetX={bolt.targetX}
            targetY={bolt.targetY}
            onComplete={() =>
              handleBoltComplete(bolt.id, bolt.targetEnemyId, bolt.targetX)
            }
          />
        ))}

        {explosions.map((exp) => (
          <Explosion
            key={exp.id}
            x={exp.x}
            y={exp.y}
            onComplete={() =>
              setExplosions((prev) => prev.filter((e) => e.id !== exp.id))
            }
          />
        ))}

        {/* Bases/Castles at the bottom */}
        <div className="absolute bottom-0 w-full flex justify-around p-2 items-end pointer-events-none">
          {/* Left Castle */}
          <motion.div
            animate={getCastleMotion(castles.left)}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div
              style={{
                width: `${CASTLE_RENDER_WIDTH}px`,
                height: `${CASTLE_RENDER_HEIGHT}px`,
              }}
              aria-hidden="true"
            >
              <div
                style={{
                  ...getCastleSpriteStyle(0, leftCastleRow),
                  width: `${CASTLE_SPRITE_WIDTH}px`,
                  height: `${CASTLE_SPRITE_HEIGHT}px`,
                  transform: `scale(${CASTLE_SCALE})`,
                  transformOrigin: "top left",
                }}
                aria-hidden="true"
              />
            </div>
            <div
              className="bg-slate-800 rounded-full mt-2 overflow-hidden border border-slate-700"
              style={{
                width: `${CASTLE_RENDER_WIDTH}px`,
                height: `${CASTLE_BAR_HEIGHT}px`,
              }}
            >
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: getHealthPercent(castles.left) }}
                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              />
            </div>
          </motion.div>

          {/* Center Castle */}
          <motion.div
            animate={getCastleMotion(castles.center)}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div
              style={{
                width: `${CASTLE_RENDER_WIDTH}px`,
                height: `${CASTLE_RENDER_HEIGHT}px`,
              }}
              aria-hidden="true"
            >
              <div
                style={{
                  ...getCastleSpriteStyle(1, centerCastleRow),
                  width: `${CASTLE_SPRITE_WIDTH}px`,
                  height: `${CASTLE_SPRITE_HEIGHT}px`,
                  transform: `scale(${CASTLE_SCALE})`,
                  transformOrigin: "top left",
                }}
                aria-hidden="true"
              />
            </div>
            <div
              className="bg-slate-800 rounded-full mt-2 overflow-hidden border border-slate-700"
              style={{
                width: `${CASTLE_RENDER_WIDTH}px`,
                height: `${CASTLE_BAR_HEIGHT}px`,
              }}
            >
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: getHealthPercent(castles.center) }}
                className="h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
              />
            </div>
          </motion.div>

          {/* Right Castle */}
          <motion.div
            animate={getCastleMotion(castles.right)}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div
              style={{
                width: `${CASTLE_RENDER_WIDTH}px`,
                height: `${CASTLE_RENDER_HEIGHT}px`,
              }}
              aria-hidden="true"
            >
              <div
                style={{
                  ...getCastleSpriteStyle(0, rightCastleRow),
                  width: `${CASTLE_SPRITE_WIDTH}px`,
                  height: `${CASTLE_SPRITE_HEIGHT}px`,
                  transform: `scale(${CASTLE_SCALE})`,
                  transformOrigin: "top left",
                }}
                aria-hidden="true"
              />
            </div>
            <div
              className="bg-slate-800 rounded-full mt-2 overflow-hidden border border-slate-700"
              style={{
                width: `${CASTLE_RENDER_WIDTH}px`,
                height: `${CASTLE_BAR_HEIGHT}px`,
              }}
            >
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: getHealthPercent(castles.right) }}
                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              />
            </div>
          </motion.div>
        </div>

        {/* Magician Avatar */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 pointer-events-none">
          <motion.div
            animate={
              feedback === "correct"
                ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
                : {}
            }
            className="relative"
          >
            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Wand2 className="w-12 h-12 text-primary relative z-10" />
          </motion.div>
        </div>

        <div className="absolute top-20 left-0 right-0 z-20">
          <InputController onSubmit={checkAnswer} />
        </div>
      </div>
    </div>
  );
}

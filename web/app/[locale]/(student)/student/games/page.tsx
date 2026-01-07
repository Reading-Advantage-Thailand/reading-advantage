"use client";

import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Gamepad2, Sword, Shield, Puzzle, Zap, Flame } from "lucide-react";

const games = [
  {
    id: "dragon-flight",
    title: "Dragon Flight",
    description:
      "Choose the correct gate to grow your dragon flight before the Skeleton King arrives.",
    icon: Flame,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "magic-defense",
    title: "Magic Defense",
    description:
      "Defend your tower using magic spells and vocabulary knowledge.",
    icon: Shield,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "rpg-battle",
    title: "RPG Battle",
    description:
      "Battle monsters and level up your character with vocabulary skills.",
    icon: Sword,
    color: "from-red-500 to-orange-500",
  },
  {
    id: "rune-match",
    title: "Rune Match",
    description: "Match runes and vocabulary to unlock ancient secrets.",
    icon: Puzzle,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "wizard-vs-zombie",
    title: "Wizard vs Zombie",
    description: "Use your vocabulary powers to defeat the zombie horde.",
    icon: Zap,
    color: "from-yellow-500 to-amber-500",
  },
];

export default function GamesPage() {
  const router = useRouter();

  return (
    <>
      <Header
        heading="Games"
        text="Practice your vocabulary skills with fun and engaging games"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <Card
              key={game.id}
              className="overflow-hidden transition-all hover:shadow-lg hover:scale-105 cursor-pointer group"
              onClick={() => router.push(`/student/games/${game.id}`)}
            >
              <CardHeader
                className={`bg-gradient-to-br ${game.color} text-white`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-12 w-12 opacity-90" />
                  <Gamepad2 className="h-6 w-6 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <CardTitle className="mb-2">{game.title}</CardTitle>
                <CardDescription className="mb-4 min-h-[3rem]">
                  {game.description}
                </CardDescription>
                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/student/games/${game.id}`);
                  }}
                >
                  Play Now
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

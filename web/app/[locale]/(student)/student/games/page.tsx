"use client";

import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Gamepad2,
  Sword,
  Shield,
  Puzzle,
  Zap,
  Flame,
  Sparkles,
  Trophy,
  Star,
  Clock,
} from "lucide-react";
import { useScopedI18n } from "@/locales/client";

const difficultyColors = {
  Easy: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  Medium:
    "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  Hard: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

export default function GamesPage() {
  const router = useRouter();
  const t = useScopedI18n("pages.student.gamesPage");

  const games = [
    {
      id: "dragon-flight",
      title: t("games.dragonFlight.title"),
      description: t("games.dragonFlight.description"),
      icon: Flame,
      coverImage: "/games/cover/dragon-flight.png",
      color: "from-purple-500 via-pink-500 to-rose-500",
      difficulty: t("difficulty.medium"),
      type: t("types.strategy"),
      badge: t("badges.popular"),
      badgeVariant: "default" as const,
    },
    {
      id: "magic-defense",
      title: t("games.magicDefense.title"),
      description: t("games.magicDefense.description"),
      icon: Shield,
      coverImage: "/games/cover/magic-defense.png",
      color: "from-blue-500 via-cyan-500 to-teal-500",
      difficulty: t("difficulty.hard"),
      type: t("types.vocabulary"),
      badge: t("badges.new"),
      badgeVariant: "secondary" as const,
    },
    {
      id: "rpg-battle",
      title: t("games.rpgBattle.title"),
      description: t("games.rpgBattle.description"),
      icon: Sword,
      coverImage: "/games/cover/rpg-battle.png",
      color: "from-red-500 via-orange-500 to-amber-500",
      difficulty: t("difficulty.medium"),
      type: t("types.vocabulary"),
      badge: t("badges.popular"),
      badgeVariant: "default" as const,
    },
    {
      id: "rune-match",
      title: t("games.runeMatch.title"),
      description: t("games.runeMatch.description"),
      icon: Puzzle,
      coverImage: "/games/cover/rune-match.png",
      color: "from-green-500 via-emerald-500 to-teal-500",
      difficulty: t("difficulty.easy"),
      type: t("types.matching"),
      badge: null,
      badgeVariant: "outline" as const,
    },
    {
      id: "wizard-vs-zombie",
      title: t("games.wizardVsZombie.title"),
      description: t("games.wizardVsZombie.description"),
      icon: Zap,
      coverImage: "/games/cover/wizard-vs-zombie.png",
      color: "from-yellow-500 via-amber-500 to-orange-500",
      difficulty: t("difficulty.easy"),
      type: t("types.spelling"),
      badge: t("badges.recommended"),
      badgeVariant: "secondary" as const,
    },
  ];

  return (
    <>
      <Header heading={t("heading")} text={t("description")} />

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto mt-6 overflow-visible">
        <TooltipProvider>
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <div key={game.id} className="relative overflow-visible">
                <Card
                  className="group absolute inset-0 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 hover:z-50 cursor-pointer border-2 hover:border-primary/50 bg-card/50 backdrop-blur-sm flex flex-col"
                  onClick={() => router.push(`/student/games/${game.id}`)}
                >
                  {/* Badge overlay */}
                  {game.badge && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge
                        variant={game.badgeVariant}
                        className="shadow-lg font-semibold"
                      >
                        {game.badge === t("badges.popular") && (
                          <Trophy className="w-3 h-3 mr-1" />
                        )}
                        {game.badge === t("badges.new") && (
                          <Sparkles className="w-3 h-3 mr-1" />
                        )}
                        {game.badge === t("badges.recommended") && (
                          <Star className="w-3 h-3 mr-1" />
                        )}
                        {game.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="relative p-0 overflow-hidden">
                    {/* Cover Image */}
                    <div className="relative w-full h-48 group-hover:h-96 overflow-hidden transition-all duration-300">
                      <Image
                        src={game.coverImage}
                        alt={game.title}
                        fill
                        className="object-cover transition-all duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {/* Gradient overlay for better text readability */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-t ${game.color} opacity-40 group-hover:opacity-10 transition-opacity duration-300`}
                      />
                    </div>

                    {/* Game icon overlay */}
                    <div className="absolute bottom-4 left-4 z-10">
                      <div className="transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 bg-white/90 dark:bg-gray-900/90 p-3 rounded-xl shadow-lg">
                        <Icon className="h-10 w-10 text-primary" />
                      </div>
                    </div>

                    {/* Gamepad icon */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="absolute bottom-4 right-4 z-10 transform transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12 bg-white/90 dark:bg-gray-900/90 p-2 rounded-lg shadow-lg">
                          <Gamepad2 className="h-6 w-6 text-primary" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("clickToPlay")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </CardHeader>

                  <CardContent className="pt-6 pb-4 space-y-4 flex-1 flex flex-col">
                    <div className="flex-1">
                      <CardTitle className="mb-2 text-2xl font-bold group-hover:text-primary transition-colors">
                        {game.title}
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {game.description}
                      </CardDescription>
                    </div>

                    {/* Game info badges */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                      <Badge
                        variant="outline"
                        className={`${difficultyColors[game.difficulty as keyof typeof difficultyColors]} font-medium`}
                      >
                        {game.difficulty}
                      </Badge>
                      <Badge variant="outline" className="font-medium">
                        {game.type}
                      </Badge>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 pb-6">
                    <Button
                      className="w-full font-semibold text-base h-11 shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/student/games/${game.id}`);
                      }}
                    >
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      {t("playNow")}
                    </Button>
                  </CardFooter>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-5 blur-xl`}
                    />
                  </div>
                </Card>
                {/* Placeholder to maintain grid space */}
                <div className="h-full min-h-[500px]" />
              </div>
            );
          })}

          {/* Coming Soon Card */}
          <Card className="group relative overflow-hidden border-2 border-dashed border-muted-foreground/30 bg-muted/30 backdrop-blur-sm flex flex-col opacity-60">
            <CardHeader className="relative bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white pb-8">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />
              </div>

              <div className="relative flex items-center justify-center">
                <div className="transform transition-all duration-300">
                  <Clock className="h-16 w-16 drop-shadow-lg animate-pulse" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 pb-4 space-y-4 flex-1 flex flex-col">
              <div className="flex-1 text-center">
                <CardTitle className="mb-2 text-2xl font-bold text-muted-foreground">
                  {t("comingSoon")}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {t("comingSoonDescription")}
                </CardDescription>
              </div>

              {/* Placeholder badges */}
              <div className="flex flex-wrap gap-2 mt-auto justify-center">
                <Badge variant="outline" className="font-medium opacity-50">
                  {t("newGames")}
                </Badge>
              </div>
            </CardContent>

            <CardFooter className="pt-0 pb-6">
              <Button
                disabled
                className="w-full font-semibold text-base h-11 cursor-not-allowed"
              >
                <Clock className="w-4 h-4 mr-2" />
                {t("comingSoon")}
              </Button>
            </CardFooter>
          </Card>
        </TooltipProvider>
      </div>
    </>
  );
}

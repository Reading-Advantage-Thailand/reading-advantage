"use client";
import { useScopedI18n } from "@/locales/client";

function ProgressBar({ progress, level }: { progress: number; level: number }) {
  const xp = [
    5000, 11000, 18000, 26000, 35000, 45000, 56000, 68000, 81000, 95000, 110000,
    126000, 143000, 161000, 180000, 200000, 221000, 243000,
  ];

  let maxProgress = xp.find((xp) => progress <= xp);

  if (!maxProgress) {
    maxProgress = progress;
  }

  const t = useScopedI18n("components.progressBarXp");
  const percentage = ((progress * 100) / (maxProgress || 1)).toFixed(0);

  return (
    <>
      <style>
        {`
          @keyframes progress-bar-animation {
            from{
              width: 0%;
            }
            to {
             
              width: ${percentage}%;
            }
          }
        `}
      </style>
      <div className="gap-2 justify-center w-[50%] flex">
        <p className="hidden md:block">{t("xp")}</p>
        <div className="w-[50%] bg-[#f3f3f3] rounded-xl hidden md:block h-5">
          <div
            className="w-full animated-pulse rounded-x bg-blue-500 h-5 rounded-xl relative items-center flex"
            style={{
              // width: `${(progress * 100) / (maxProgress || 1)}%`,
              animationName: "progress-bar-animation",
              animationDuration: "2s",
              animationTimingFunction: "ease-out",
              animationFillMode: "forwards",
            }}
          >
       <span className="text-white absolute left-3/4 transform -translate-x-1">{percentage}%</span>
       </div>
        </div>
        <p>{t("level", { level })} </p>
      </div>
    </>
  );
}

export default ProgressBar;
 // width: ${(progress * 100) / (maxProgress || 1)}%;
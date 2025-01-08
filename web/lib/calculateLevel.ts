import readability from "text-readability-ts";

interface IReadability {
  raLevel: number;
  cefrLevel: string;
}

const levels = [
  "A1-",
  "A1",
  "A1+",
  "A2-",
  "A2",
  "A2+",
  "B1-",
  "B1",
  "B1+",
  "B2-",
  "B2",
  "B2+",
  "C1-",
  "C1",
  "C1+",
  "C2-",
  "C2",
  "C2+",
];

function getCefrLevel(textStandart: number): string {
  return levels[Math.min(Math.max(0, textStandart), 18)];
}

function calculateLevel(text: string, cefrlevel: string): IReadability {
  const textStandard = readability.textStandard(text, true);
  const cefrNum = getLevelNumber(cefrlevel);
  let raLevel = (textStandard as number) + 1;
  let cefrLevel = getCefrLevel(textStandard as number);

  if (cefrNum > raLevel) {
    raLevel = cefrNum - 1;
    cefrLevel = levels[raLevel - 1];
  } else if (cefrNum < raLevel) {
    raLevel = cefrNum + 1;
    cefrLevel = levels[raLevel - 1];
  } else {
    raLevel = cefrNum;
    cefrLevel = levels[raLevel - 1];
  }

  return { raLevel, cefrLevel };
}

function getLevelNumber(level: string): number {
  const index = levels.indexOf(level);
  return index + 1;
}

//export { getLevelNumber };

export { calculateLevel };

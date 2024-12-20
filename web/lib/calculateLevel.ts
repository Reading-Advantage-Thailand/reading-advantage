import readability from "text-readability-ts";

interface IReadability {
  raLevel: number;
  cefrLevel: string;
}

function getCefrLevel(textStandart: number): string {
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
  return levels[Math.min(Math.max(0, textStandart), 18)];
}

function calculateLevel(text: string): IReadability {
  const textStandard = readability.textStandard(text, true);
  const raLevel = (textStandard as number) + 1;
  const cefrLevel = getCefrLevel(textStandard as number);
  return { raLevel, cefrLevel };
}

function getLevelNumber(level: string): number | null {
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
  const index = levels.indexOf(level);

  return index !== -1 ? index + 1 : null; // Return null if level is not found
}

//export { getLevelNumber };

export { calculateLevel };

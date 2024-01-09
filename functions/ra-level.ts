const readability = require('text-readability');

const testData = `
Malcolm X was born on May 19, 1925, in Omaha, Nebraska. He was raised in a family that was deeply involved in the black liberation movement. Malcolm's father, Earl Little, was a Baptist preacher who fought for the rights of African Americans. His mother, Louise Helen Norton Little, was a housewife and member of the Universal Negro Improvement Association. Despite their efforts, Malcolm's family faced racist threats and violence, which deeply impacted his early life. As a young boy, Malcolm witnessed his family's home being burned down by the Ku Klux Klan. This traumatic event led to a series of challenges and hardships for him. After the death of his father, Malcolm's family struggled financially, and his mother was eventually institutionalized for mental illness. As a result, Malcolm and his siblings were split up and sent to different foster homes. These experiences left a lasting impression on Malcolm, shaping his determination to fight against racial injustice. After dropping out of school, Malcolm engaged in a life of crime. He became involved in drug dealing, gambling, and other illegal activities. In 1946, at the age of 21, he was arrested for burglary and sentenced to 10 years in prison. During his time behind bars, Malcolm had a transformative experience. He began educating himself by reading extensively and studying a wide range of subjects, including history, philosophy, and religion. It was during his imprisonment that Malcolm X discovered the teachings of the Nation of Islam, a black nationalist religious movement. He became influenced by the ideas of its leader, Elijah Muhammad, who preached self-reliance and racial separation. Upon his release from prison in 1952, Malcolm joined the Nation of Islam and became an outspoken advocate for the rights of African Americans. Malcolm X rose to prominence through his powerful speeches and fearless activism. He was known for his passionate delivery and uncompromising stance on racial equality. His message resonated with many people, particularly those who felt marginalized by society. Malcolm's emphasis on self-empowerment and self-defense struck a chord with African Americans who were tired of peaceful protests and nonviolent resistance. In 1964, Malcolm X announced his split from the Nation of Islam and renounced some of the controversial beliefs that he had previously supported. He started his own organization, the Organization of Afro-American Unity, with the goal of bringing together people of African descent and promoting unity and social change. Tragically, Malcolm's journey was cut short when he was assassinated on February 21, 1965, in New York City. Malcolm X's legacy is one of resilience and determination. His personal journey from a troubled youth to a civil rights leader continues to inspire generations. His advocacy for self-love, self-respect, and self-empowerment paved the way for future activists and leaders. Malcolm X's contributions to the fight against racial injustice should never be forgotten.
      `

// Define the structure for your baseline values
interface BaselineValues {
  WPS: number;
  WC: number;
}

// Baseline average values for WPS and WC for each CEFR level
const averageValues: Record<string, BaselineValues> = {
  'A0': { WPS: 4, WC: 95 },
  'A0+': { WPS: 5, WC: 140 },
  'A1': { WPS: 6, WC: 180 },
  'A1+': { WPS: 7, WC: 225 },
  'A2': { WPS: 8, WC: 280 },
  'A2+': { WPS: 9, WC: 340 },
  'B1': { WPS: 11, WC: 410 },
  'B1+': { WPS: 12, WC: 470 },
  'B2': { WPS: 13, WC: 530 },
  'B2+': { WPS: 14, WC: 585 },
  'C1': { WPS: 15, WC: 645 },
  'C1+': { WPS: 16, WC: 690 },
  'C2': { WPS: 17, WC: 735 }
};

// Baseline GSE values for each CEFR level
const baselineGSE: Record<string, number> = {
  'A0': 15,
  'A0+': 20,
  'A1': 25,
  'A1+': 30,
  'A2': 36,
  'A2+': 43,
  'B1': 51,
  'B1+': 58,
  'B2': 65,
  'B2+': 71,
  'C1': 78,
  'C1+': 83,
  'C2': 88
};

// Define the scoring thresholds
const thresholds = {
  WPS: {
    '-3': 0.75,
    '-2': 0.85,
    '-1': 0.95,
    '0': 1.05,
    '1': 1.15,
    '2': 1.25,
    '3': 1.35,
  },
  WC: {
    '-3': 0.75,
    '-2': 0.85,
    '-1': 0.95,
    '0': 1.05,
    '1': 1.15,
    '2': 1.25,
    '3': 1.35,
  }
};

// Function to get the score based on the value, average, and metric
function getScore(value: number, average: number, metric: 'WPS' | 'WC'): number {
  const thresholdValues = thresholds[metric];
  const percentage = value / average;

  if (percentage <= thresholdValues['-3']) return -3;
  if (percentage <= thresholdValues['-2']) return -2;
  if (percentage <= thresholdValues['-1']) return -1;
  if (percentage <= thresholdValues['0']) return 0;
  if (percentage <= thresholdValues['1']) return 1;
  if (percentage <= thresholdValues['2']) return 2;

  return 3;
}

// Function to adjust the GSE level based on CEFR level, actual WPS, and actual WC
function adjustGSE(cefrLevel: string, actualWPS: number, actualWC: number): number {
  const avgWPS = averageValues[cefrLevel].WPS;
  const avgWC = averageValues[cefrLevel].WC;


  const wpsScore = getScore(actualWPS, avgWPS, 'WPS');
  const wcScore = getScore(actualWC, avgWC, 'WC');

  const totalScore = wpsScore + wcScore;

  // Assuming each score point adjusts GSE by 1 points as an example
  const GSEAdjustmentFactor = 1;
  return baselineGSE[cefrLevel] + (totalScore * GSEAdjustmentFactor);
}

// Calculate mean
const mean = Object.values(baselineGSE).reduce((sum, score) => sum + score, 0) / Object.keys(baselineGSE).length;

// Calculate standard deviation
const squaredDifferences = Object.values(baselineGSE).map(score => Math.pow(score - mean, 2));
const variance = squaredDifferences.reduce((sum, squaredDiff) => sum + squaredDiff, 0) / squaredDifferences.length;
const standardDeviation = Math.sqrt(variance);

console.log('Mean:', mean);
console.log('Standard Deviation:', standardDeviation);

// Function to calculate z-score
function calculateZScore(textStandard: number, mean: number, standardDeviation: number): number {
  return (textStandard - mean) / standardDeviation;
}

// Example usage
const cefrLevel = 'B1';
const actualWPS = 10; // Example WPS value
const actualWC = 420; // Example WC value

const adjustGSELevel = adjustGSE(cefrLevel, actualWPS, actualWC);
console.log('Adjusted GSE level:', adjustGSELevel);

const zScore = calculateZScore(adjustGSELevel, mean, standardDeviation);
console.log('Z-Score:', zScore);

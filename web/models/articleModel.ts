export interface Article {
  id: string;
  ari: number;
  cefrLevel: string;
  cefrScores: {
    A1: number;
    A2: number;
    B1: number;
    B2: number;
    C1: number;
    C2: number;
  };
  content: string;
  genre: string;
  grade: number;
  raLevel: number;
  subGenre: string;
  title: string;
  topic: string;
  type: string;
  timepoints: [
    {
      timeSeconds: number;
      markName: string;
    }
  ];
  questions: {
    multiple_choice_questions: [
      {
        question: string;
        id: string;
        answers: {
          choice_a: string;
          choice_b: string;
          choice_c: string;
          choice_d: string;
        };
      }
    ];
  }
}

import React from "react";

interface LessonSummaryProps {
  wordsSaved: number;
  sentencesSaved: number;
  quizPerformance: string;
  xpEarned: number;
}

const LessonSummary: React.FC<LessonSummaryProps> = ({
  wordsSaved,
  sentencesSaved,
  quizPerformance,
  xpEarned,
}) => {
  return (
    <div className="lesson-summary xl:h-[400px] w-full md:w-[700px] lg:w-[550px] xl:w-[660px] mt-5">
      <h1>Congratulations!</h1>
      <p>You’ve completed the lesson. Here’s what you achieved:</p>
      <ul>
        <li>
          <strong>Words Saved:</strong> {wordsSaved}
        </li>
        <li>
          <strong>Sentences Saved:</strong> {sentencesSaved}
        </li>
        <li>
          <strong>Quiz Performance:</strong> {quizPerformance}
        </li>
        <li>
          <strong>Time Taken:</strong> {quizPerformance}
        </li>
        <li>
          <strong>XP Earned:</strong> {xpEarned}
        </li>
      </ul>
    </div>
  );
};

export default LessonSummary;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ChallengingQuestionsTable = () => {
  const questions = [
    { question: "What is the capital of France?", type: "MC", correctRate: "45%" },
    { question: "Explain the water cycle.", type: "SA", correctRate: "38%" },
  ];

  return (
    <Card className="w-full col-span-3">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Most Challenging Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left font-semibold text-gray-600 border-b">Question</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600 border-b">Type</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600 border-b">Correct Rate</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, index) => (
                <tr key={index} className="border-b last:border-b-0">
                  <td className="px-4 py-2">{q.question}</td>
                  <td className="px-4 py-2">{q.type}</td>
                  <td className="px-4 py-2">{q.correctRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengingQuestionsTable;
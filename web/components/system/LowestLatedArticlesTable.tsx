import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// const ChallengingQuestionsTable = () => {
const LowestLatedArticlesTable = () => {
  const articles = [
    { title: "The Stagecoach Robbery", type: "Fiction", rate: "2" },
    { title: "The Pomodoro Adventure: Boosting Focus and Efficiency with Time Management", type: "Non Fiction", rate: "3" },
  ];

  return (
    <Card className="w-full col-span-3">
      <CardHeader>
        <CardTitle className="text-lg font-bold sm:text-xl md:text-2xl">Lowest Lated Articles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left font-semibold text-gray-600 border-b">Articles</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600 border-b">Type</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600 border-b">Rate</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a, index) => (
                <tr key={index} className="border-b last:border-b-0">
                  <td className="px-4 py-2">{a.title}</td>
                  <td className="px-4 py-2">{a.type}</td>
                  <td className="px-4 py-2">{a.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LowestLatedArticlesTable;
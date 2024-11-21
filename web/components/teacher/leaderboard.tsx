import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type RankingType = {
  classroom: string;
  name: string;
  rank: number;
  xp: number;
};

type DataProps = {
  license_id: string;
  ranking: RankingType[];
};

type LeaderboardProps = {
  data: DataProps[];
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .reduce((initials, word) => initials + word[0].toUpperCase() + ".", "")
    .slice(0, -1); // Remove trailing dot
}

export default function Leaderboard({ data }: LeaderboardProps) {
  return (
    <div className="mb-6 px-2 flex flex-col gap-4">
      <div>
        <p className="text-center text-2xl font-bold">Leaderboard</p>
        <p className="text-center">
          {new Date().toLocaleString("en-US", { month: "long" })}
        </p>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">XP</TableHead>
              <TableHead className="text-center">Room</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length
              ? data[0].ranking.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-center">
                      {item.rank <= 3 ? (
                        <img
                          src={`/rank-${item.rank}.png`} // Replace with the path to your rank logo images
                          alt={`Rank ${item.rank}`}
                          className="h-6 w-6 mx-auto"
                        />
                      ) : (
                        item.rank // Show the rank number for other ranks
                      )}
                    </TableCell>
                    <TableCell className="flex gap-2 items-center">
                      {getInitials(item.name)}
                    </TableCell>
                    <TableCell className="text-center">{item.xp}</TableCell>
                    <TableCell className="text-center">
                      {item.classroom}
                    </TableCell>
                  </TableRow>
                ))
              : ""}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

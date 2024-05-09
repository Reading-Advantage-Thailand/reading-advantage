import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardDescription, CardTitle } from "../ui/card";
import { Header } from "@/components/header";

type Student = {
    studentId: string;
    lastActivity: Date;
    studentName: string;
    classroomName: string;
    classroomId: string;
    email: string;
    xp: number;
    level: number;
  };
  
  type MyStudentProps = {
    userId: string;
    studentInClass: Student[];
    params: any;    
  };
  
export default function ReportsStudentProgress({studentInClass, params}: MyStudentProps) {
    console.log('studentInClass', studentInClass);
    console.log('params', params);

    const studentSelected = studentInClass.find((student) => student.studentId === params.params.studentId);
    console.log('studentSelected', studentSelected);
    
  return (
    <div>
      <Header heading="Student Progress Report" />
      <Card className="mt-4 p-4">
        <CardTitle className="mb-10 ">{studentSelected?.studentName}
        <CardDescription className="mt-2">Assign to class <strong>classroom name</strong></CardDescription>
        </CardTitle>
        <div className="grid grid-cols-3 gap-4 h-[100px]">
        <Card className="flex items-center justify-center">Level: {studentSelected?.level}</Card>
        <Card className="flex items-center justify-center">XP: {studentSelected?.xp}</Card>
        <Card className="flex items-center justify-center">Activity: No data available</Card>
        </div>
      </Card>
    </div>
  );
}

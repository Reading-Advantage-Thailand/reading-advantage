import { render, screen, fireEvent } from "@testing-library/react";
import Reports from "../components/teacher/reports";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Router, RouterProps } from "react-router-dom";
import EditStudent from "../components/teacher/edit-student";
import RemoveStudent from "../components/teacher/remove-student-inclass";

jest.mock("../locales/client", () => ({
  useScopedI18n: () => (key: string) => key,
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

type Student = {
  studentId: string;
  lastActivity: Date;
  studentName: string;
  classroomName: string;
  classroomId: string;
  email: string;
  xp: number;
};

const studentsMapped: Student[] = [
  {
    studentId: "qWXtOI9Hr6QtILuhsrOc06zXZUg1",
    studentName: "John Doe",
    email: "",
    xp: 0,
    lastActivity: new Date(),
    classroomName: "Class 1",
    classroomId: "1",
  },
];

describe("Report", () => {
    test("renders Reports component", async () => {
      render(<Reports studentInClass={studentsMapped} userId={'qWXtOI9Hr6QtILuhsrOc06zXZUg1'} />);
      expect(await screen.findByText(/class reports/i)).toBeInTheDocument();
    });

    test("renders Reports component with student data", async () => {
      render(<Reports studentInClass={studentsMapped} userId={'qWXtOI9Hr6QtILuhsrOc06zXZUg1'} />);
      expect(await screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

  //   test("redirect to report student progress", async () => {
  //     render(<Reports studentInClass={studentsMapped} userId={'qWXtOI9Hr6QtILuhsrOc06zXZUg1'} />);

  //     userEvent.click(screen.getByRole('button', {name:/actions/i }));
  //     const elements = await screen.findAllByText(/view detail/i);
  //     elements.forEach(element => {
  //       expect(element).toBeInTheDocument();
  //     });

  //     userEvent.click(screen.getByText(/view detail/i));
  //     // expect( await screen.findByText(/student progress report/i)).toBeInTheDocument();

  //   });

//   test("renders EditStudent and RemoveStudent components on icon click", () => {
//     const { getByText, getAllByRole } = render(
//       <Reports
//         studentInClass={studentsMapped}
//         userId={"qWXtOI9Hr6QtILuhsrOc06zXZUg1"}
//       />
//     );

//     // Assuming the icons are represented by buttons
//     const buttons = getAllByRole("button");

//     // Simulate click events on the icons
//     fireEvent.click(buttons[0]);
//     fireEvent.click(buttons[1]);

//     // Check if the EditStudent and RemoveStudent components are rendered
//     expect(
//         getByText(
//             expect.stringMatching(
//                 /<EditStudent userId={"qWXtOI9Hr6QtILuhsrOc06zXZUg1"} studentInClass={studentsMapped} studentIdSelected={"103186496931574456567"} \/>/
//             )
//         )
//     ).toBeInTheDocument();
//     expect(
//         getByText(
//             expect.stringMatching(
//                 /<RemoveStudent studentInClass={studentsMapped} classroomIdSelected={"4ODGVkBL6FvdO8vLVNk7"} studentIdSelected={"103186496931574456567"} userId={"qWXtOI9Hr6QtILuhsrOc06zXZUg1"} \/>/
//             )
//         )
//     ).toBeInTheDocument();
//   });
});
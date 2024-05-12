import MyClasses from "../components/teacher/my-classes";
import { fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import ClassRoster from "@/components/teacher/class-roster";
import CreateNewClass from "@/components/teacher/create-new-class";
import EditClass from "@/components/teacher/edit-class";
import axios from "axios";
import { toast } from "../components/ui/use-toast";
import ArchiveClass from "@/components/teacher/archive-class";
import DeleteClass from "@/components/teacher/delete-class";
import { screen } from "@testing-library/dom";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("axios");

jest.mock("../components/ui/use-toast", () => ({
  toast: jest.fn(),
}));


const mockClassroomData = {
  classroomName: "Test Class",
  classCode: "TC101",
  noOfStudents: 30,
  grade: "5",
  coTeacher: {
    coTeacherId: "CT101",
    name: "Co-Teacher",
  },
  id: "1",
};

describe("myClasses Page", () => {
  const mockClassrooms = [
    {
      classroomName: "Test Class",
      classCode: "TC1",
      noOfStudents: 20,
      grade: "Grade 1",
      coTeacher: {
        coTeacherId: "CT1",
        name: "CoTeacher 1",
      },
      id: "1",
      archived: false,
    },
  ];

  it("should render myClasses component", async () => {
    render(<MyClasses userId="1" classrooms={mockClassrooms} />);
    expect(screen.getByText("My Classroom")).toBeInTheDocument();
  });

  it("can click create new class", () => {
    render(<MyClasses classrooms={mockClassrooms} userId="1" />);
    fireEvent.click(screen.getByText("Create New Class"));
    expect(screen.getByText("Create New Class")).toBeInTheDocument();
    render(<CreateNewClass userId="1" />);
    expect(screen.getByText("Create a new class")).toBeInTheDocument();
  });

  it("can click detail dropdown", async () => {
    render(<MyClasses classrooms={mockClassrooms} userId="1" />);
    const dropdown = screen.getByRole("button", { name: /Details/i });
    fireEvent.click(dropdown);
  });

  it("can click EditClass, ArchiveClass, DeleteClass", async () => {
    render(<MyClasses classrooms={mockClassrooms} userId="1" />);

    const editIcon = screen.getByTitle("edit class");
    const archiveIcon = screen.getByTitle("edit class");
    const deleteIcon = screen.getByTitle("edit class");

    userEvent.click(editIcon);
    userEvent.click(archiveIcon);
    userEvent.click(deleteIcon);

    expect(editIcon).toBeInTheDocument();
    expect(archiveIcon).toBeInTheDocument();
    expect(deleteIcon).toBeInTheDocument();
  });

  it("can show class name, class code, no.of Students, Details, Actions", async () => {
    render(<MyClasses classrooms={mockClassrooms} userId="1" />);

    mockClassrooms.forEach((classroom) => {
      expect(screen.getByText(classroom.classroomName)).toBeInTheDocument();
      expect(screen.getByText(classroom.classCode)).toBeInTheDocument();
      expect(screen.getByText(classroom.noOfStudents)).toBeInTheDocument();
    });

    const detailsDropdown = screen.getAllByRole("button", { name: "Details" });
    const firstDetailsDropdown = detailsDropdown[0];
    userEvent.click(firstDetailsDropdown);

    const rosterElement = await screen.findByText("Roster");
    const reportElement = await screen.findByText("Report");

    expect(rosterElement).toBeInTheDocument();
    expect(reportElement).toBeInTheDocument();

  });

    it('can click classroom and navigate to class roster', async () => {
      const handleOnClickClassroom = jest.fn(() => console.log('clicked'));
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

      const mockClassrooms = [
        {
          classroomName: 'Test Class',
          classCode: 'Code1',
          noOfStudents: 10,
          grade: "Grade 1",
          coTeacher: {
            coTeacherId: "CT1",
            name: "CoTeacher 1",
          },
          id: "1",
          archived: false,
        },
      ];

      render(<MyClasses classrooms={mockClassrooms} userId="1" handleOnClickClassroom={handleOnClickClassroom}/>);

      const classroomElement = screen.getByText('Test Class');
      expect (classroomElement).toBeInTheDocument();
      userEvent.click(classroomElement);

      render(<ClassRoster studentInClass={[]}/>);
      const classRosterElement = await screen.findByText((content, element) => content.startsWith('Class Roster'));

      expect(classRosterElement).toBeInTheDocument();
    });

});

// test for edit class component
describe('EditClass', () => {
  const classroomData = {
    classroomName: "Test Classroom",
    classCode: "Test123",
    noOfStudents: 30,
    grade: "1",
    coTeacher: {
      coTeacherId: "coTest123",
      name: "CoTeacher Test"
    },
    id: "classTest123"
  };

  test('renders EditClass component and updates class details', async () => {
    jest.spyOn(axios, 'patch').mockResolvedValueOnce({ data: {} });

    render(<EditClass userId="testUserId" classroomData={classroomData} title="Test Title" />);

    fireEvent.click(screen.getByTitle(/edit class/i));

    expect(screen.getByPlaceholderText(/class name/i)).toHaveValue(classroomData.classroomName);
    expect(screen.getByPlaceholderText(/class code/i)).toHaveValue(classroomData.classCode);
    expect(screen.getByPlaceholderText(/no of students/i)).toHaveValue(classroomData.noOfStudents.toString());
    expect(screen.getByPlaceholderText(/co-teacher name/i)).toHaveValue(classroomData.coTeacher.name);

    fireEvent.change(screen.getByPlaceholderText(/class name/i), { target: { value: 'New Classroom Name' } });
    fireEvent.change(screen.getByPlaceholderText(/no of students/i), { target: { value: '35' } });
    fireEvent.change(screen.getByPlaceholderText(/co-teacher name/i), { target: { value: 'New CoTeacher Name' } });

    fireEvent.click(screen.getByText(/update class/i));

    await waitFor(() => expect(axios.patch).toHaveBeenCalledWith(`/api/classroom/${classroomData.id}`, expect.objectContaining({
      classroomName: 'New Classroom Name',
      noOfStudents: 35,
      coTeacher: expect.arrayContaining([expect.objectContaining({ name: 'New CoTeacher Name' })])
    })));
  });
});

// test for archive class component
describe('ArchiveClass', () => {
  it('renders correctly', () => {
    jest.spyOn(axios, 'patch').mockResolvedValueOnce({ data: {} });
        render(<ArchiveClass classroomData={mockClassroomData} title="Test Title" />);
            fireEvent.click(screen.getByTitle(/archive class/i));
  });

  it('calls handleArchiveClass and handleClose when the corresponding buttons are clicked', async () => {
    jest.spyOn(axios, 'patch').mockResolvedValueOnce({ data: {} });

    render(<ArchiveClass classroomData={mockClassroomData} title="Test Title" />);
    fireEvent.click(screen.getByTitle(/archive class/i));
    fireEvent.click(screen.getByText('Archive'));

    expect(axios.patch).toHaveBeenCalledWith(`/api/classroom/${mockClassroomData.id}/archived`, { archived: true });
  });
});

// test for delete class component
describe("DeleteClass", () => {
  it("renders correctly", () => {
    jest.spyOn(axios, "patch").mockResolvedValueOnce({ data: {} });
    render(
      <DeleteClass classroomData={mockClassroomData} title="Test Title" />
    );
    fireEvent.click(screen.getByTitle(/delete class/i));
  });

  it("calls the delete API and shows a success toast when the delete button is clicked", async () => {
    jest.spyOn(axios, "delete").mockResolvedValueOnce({ data: {} });

    render(
      <DeleteClass classroomData={mockClassroomData} title="Test Title" />
    );

    fireEvent.click(screen.getByTitle(/delete class/i));
    fireEvent.click(screen.getByText("Delete"));

    expect(axios.delete).toHaveBeenCalledWith(
      `/api/classroom/${mockClassroomData.id}`
    );
  });

  it('closes the dialog when the cancel button is clicked', () => {
    render(<DeleteClass classroomData={mockClassroomData} title="Test Title" />);

    fireEvent.click(screen.getByLabelText('delete class'));
    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.queryByText('Delete Classroom')).not.toBeInTheDocument();
  });
});

// test for create new class component
describe("CreateNewClass", () => {
  it("renders correctly", () => {
    jest.spyOn(axios, "post").mockResolvedValueOnce({ data: {} });
    render(
      <CreateNewClass userId="testUserId"/>
    );
    fireEvent.click(screen.getByText(/create new class/i));
  });

  it('opens and closes the dialog', async () => {
    render(<CreateNewClass userId="testUserId" />);
    fireEvent.click(screen.getByText(/Create New Class/i));
    expect(screen.getByText(/Create New Class/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(screen.queryByText(/create a new class/i)).not.toBeInTheDocument();
  });


  it('should not post the classroom data when not all fields are filled out', async () => {
   jest.spyOn(axios, "post").mockResolvedValueOnce({ data: {} });

   const mockPost = axios.post as jest.MockedFunction<typeof axios.post>;
   mockPost.mockResolvedValueOnce({ data: {} });

   render(<CreateNewClass userId="testUserId" />);

   fireEvent.click(screen.getByText(/Create New Class/i));

   const classNameElement = screen.getByPlaceholderText(/class name/i);
   const classCodeElement = screen.getByPlaceholderText(/class code/i);
   const noOfStudentElement = screen.getByPlaceholderText(/No of Students/i);
   const gradeElement = screen.getByText(/select grade/i);

   const coTeacherElement = screen.getByPlaceholderText(/co-teacher/i);
   userEvent.type(classNameElement, "Test Class");
   userEvent.type(classCodeElement, "TC101");
   userEvent.type(noOfStudentElement, "30");
   fireEvent.change(gradeElement, { target: { value: 'grade 1' } });
   fireEvent.change(coTeacherElement,{ target: { value: 'Co-Teacher' } });

   fireEvent.click(screen.getByText(/Create Class/i));

   const mockToast = toast as jest.MockedFunction<typeof toast>;
   const expectedToastArgs = {
     title: "Attention",
     description: "All fields must be filled out!",
     variant: "destructive"
   };
   expect(mockToast).toHaveBeenCalledWith(expectedToastArgs);
    });
});
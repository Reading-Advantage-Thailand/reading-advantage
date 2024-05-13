import { render, fireEvent, waitFor, screen, act } from "@testing-library/react";
import CreateNewStudent from "@/components/teacher/create-new-student";
import axios from "axios";
import { useRouter } from "next/router";
import userEvent from "@testing-library/user-event";
import { toast } from "react-toastify";
import RosterPage from "@/app/[locale]/(teacher)/teacher/class-roster/page";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      prefetch: () => null,
    };
  },
}));

jest.mock("axios");

jest.mock('react-toastify', () => jest.fn());

const mockRouter = {
  push: jest.fn(),
};

const mockedAxios = axios as jest.Mocked<typeof axios>;
interface Student {
  studentId: string;
  lastActivity: {
    _seconds: number;
    _nanoseconds: number;
  };
  studentName: string;
  classroomName: string;
  classroomsId: string;
  email: string;
}
const mockStudentData: Student[] = [{
  studentId: "1",
  lastActivity: {
    _seconds: 0,
    _nanoseconds: 0,
  },
  studentName: "Saeree t.",
  classroomName: "Test Class 1",
  classroomsId: "4ODGVkBL6FvdO8vLVNk7",
  email: "rtclub11140@gmail.com",
},
{
  studentId: "2",
  lastActivity: {
    _seconds: 0,
    _nanoseconds: 0,
  },
  studentName: "May",
  classroomName: "Test Class 1",
  classroomsId: "4ODGVkBL6FvdO8vLVNk7",
  email: "may@gmail.com",
},
];

const mockAllStudentEmail = [
  {
    email: "test1@test.com",
    studentId: "1",
  },
  {
    email: "test2@test.com",
    studentId: "2",
  },
  {
    email: "test3@test.com",
    studentId: "3",
  },
  {
    email: "passakorn15@gmail.com",
    studentId: "vjTXeBtP0GcGLv21eYn3OTTfIXp2",
  },
];

const mockStudentInEachClass = ["1", "2"];

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
  global.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ message: "success", }),
  });
  global.Response = jest.fn((body, init) => ({
    json: () => Promise.resolve({ message: "success", }),
    ...init,
  })) as unknown as typeof Response;
});

describe("CreateNewStudent", () => {
  const setup = () => {
    const utils = render(
      <CreateNewStudent
        studentDataInClass={mockStudentData}
        allStudentEmail={mockAllStudentEmail}
        studentInEachClass={mockStudentInEachClass}
      />
    );
    const emailInput = utils.getByPlaceholderText("Enter email address");
    const saveButton = utils.getByText("SAVE AND CONTINUE");
    return {
      emailInput,
      saveButton,
      ...utils,
    }
  }

  it("renders correctly", () => {
    const { getByText } = setup();
    expect(getByText("Add new students to Test Class 1")).toBeInTheDocument();
  });

  it('adds new email input field when "Add new student" is clicked', async () => {
    const { getByText } = setup();
    const addNewStudentButton = getByText("Add new student");
    fireEvent.click(addNewStudentButton);
    expect(screen.getAllByPlaceholderText(/Enter email address/i).length).toBe(2);
  });

  it("call PATH when email is correct", async () => {
    mockedAxios.patch.mockRejectedValueOnce({ status: 200 });
    const { emailInput, saveButton } = setup();
    fireEvent.change(emailInput, {
      target: { value: "passakorn15@gmail.com" },
    });
    expect(emailInput).toHaveValue("passakorn15@gmail.com");
    fireEvent.click(saveButton);
    expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
  });

  it("shows toast message when email is not found", async () => {
    const { emailInput, saveButton } = setup();
    fireEvent.change(emailInput, {
      target: { value: "this_is_an_invalid@email.com" },
    });
    expect(emailInput).toHaveValue("this_is_an_invalid@email.com");
    act(async () => {
      fireEvent.click(saveButton);
      const toastMessage = await screen.findByText("Email Not Found");
      expect(toastMessage).toBeInTheDocument();
    });
  });
});
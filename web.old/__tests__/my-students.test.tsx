import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor
} from "@testing-library/react";
import MyStudents from "../components/teacher/my-students";
import { I18nProviderClient, useScopedI18n } from "../locales/client";
import { useRouter } from "next/navigation";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

useScopedI18n("components.articleRecordsTable");
jest.mock("../locales/client", () => ({
  useScopedI18n: () => (key: string) => key,
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock('next/router', () => ({
  userRouter: jest.fn()
}));
jest.mock("axios");

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn(),
  }),
}));
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});



describe("MyStudents page", () => {
  it("should render student page", async () => {
    const matchedStudents = [
      { id: "1", email: "may@gmail.com", name: "may" },
      { id: "2", email: "adam@gmail.com", name: "Adam" },
      { id: "3", email: "test3@test.com", name: "Test Student 3" },
      { id: "4", email: "test4@test.com", name: "Test Student 4" },
      { id: "5", email: "test5@test.com", name: "Test Student 5" },
    ];
    render(<MyStudents matchedStudents={matchedStudents} />);

    const myStudentsPageElement = screen.getByText("My Students Page");
    expect(myStudentsPageElement).toBeInTheDocument();
  });

  it("should render student page with a list of students", async () => {
    const matchedStudents = [
      { id: "1", email: "may@gmail.com", name: "may" },
      { id: "2", email: "adam@gmail.com", name: "Adam" },
      { id: "3", email: "test3@test.com", name: "Test Student 3" },
      { id: "4", email: "test4@test.com", name: "Test Student 4" },
      { id: "5", email: "test5@test.com", name: "Test Student 5" },
    ];
    render(<MyStudents matchedStudents={matchedStudents} />);

    const myStudentsNameElement1 = screen.getByText("may");
    expect(myStudentsNameElement1).toBeInTheDocument();
    const myStudentsNameElement2 = screen.getByText("Adam");
    expect(myStudentsNameElement2).toBeInTheDocument();
    const myStudentsNameElement3 = screen.getByText("Test Student 3");
    expect(myStudentsNameElement3).toBeInTheDocument();
    const myStudentsNameElement4 = screen.getByText("Test Student 4");
    expect(myStudentsNameElement4).toBeInTheDocument();
    const myStudentsNameElement5 = screen.getByText("Test Student 5");
    expect(myStudentsNameElement5).toBeInTheDocument();
  });

  it("should render all available actions in dropdown list", async () => {
    const matchedStudents = [
      { id: "1", email: "test1@test.com", name: "Test Student 1" },
    ];

    render(<MyStudents matchedStudents={matchedStudents} />);

    const myStudentsNameElement1 = screen.getByText(matchedStudents[0].name);
    expect(myStudentsNameElement1).toBeInTheDocument();
    const actionsButton = screen.getByText("Actions");
    userEvent.click(actionsButton);
    const progressButton = await screen.findByRole("menuitemcheckbox", {
      name: "Progress",
    });
    expect(progressButton).toBeInTheDocument();
    const enrollButton = await screen.findByRole("menuitemcheckbox", {
      name: "Enroll",
    });
    expect(enrollButton).toBeInTheDocument();
    const UnenrollButton = await screen.findByRole("menuitemcheckbox", {
      name: "Unenroll",
    });
    expect(UnenrollButton).toBeInTheDocument();
    const resetProgressButton = await screen.findByRole("menuitemcheckbox", {
      name: "Reset Progress",
    });
    expect(resetProgressButton).toBeInTheDocument();
  });

  it("should redirect to progress page", async () => {
    const matchedStudents_progress = [
      { id: "103186496931574456567", email: "rtclub11140@gmail.com", name: "Saeree t." },
    ];

    const push = jest.fn();
    (useRouter as jest.Mock).mockImplementation(() => ({
      push
    }));


    render(
      <MyStudents matchedStudents={matchedStudents_progress} />
    );

    const myStudentsNameElement1 = screen.getByText(matchedStudents_progress[0].name);
    expect(myStudentsNameElement1).toBeInTheDocument();
    const actionsButton = screen.getByText("Actions");
    userEvent.click(actionsButton);

    const progressButton = await screen.findByRole("menuitemcheckbox", {
      name: "Progress",
    });
    expect(progressButton).toBeInTheDocument();
    fireEvent.click(progressButton);

    const url = `/teacher/student-progress/${matchedStudents_progress[0].id}`;
    expect(push).toHaveBeenCalledWith(url);

  });

  it("should redirect to enroll page", async () => {
    const matchedStudents_enroll = [
      { id: "103186496931574456567", email: "rtclub11140@gmail.com", name: "Saeree t." },
    ]

    const push = jest.fn();
    (useRouter as jest.Mock).mockImplementation(() => ({
      push
    }));

    render(
      <MyStudents matchedStudents={matchedStudents_enroll} />
    );
    const myStudentsNameElement2 = screen.getByText(matchedStudents_enroll[0].name);
    expect(myStudentsNameElement2).toBeInTheDocument();
    const actionsButton = screen.getByText("Actions");
    userEvent.click(actionsButton);

    const enrollButton = await screen.findByRole("menuitemcheckbox", {
      name: "Enroll",
    });
    expect(enrollButton).toBeInTheDocument();
    fireEvent.click(enrollButton);

    const url = `/teacher/enroll-classes/${matchedStudents_enroll[0].id}`;
    expect(push).toHaveBeenCalledWith(url);


  });

  it("should redirect to un-enroll page", async () => {
    const matchedStudents_unenroll = [
      { id: "103186496931574456567", email: "rtclub11140@gmail.com", name: "Saeree t." },
    ];

    const push = jest.fn();
    (useRouter as jest.Mock).mockImplementation(() => ({
      push
    }));

    render(
      <MyStudents matchedStudents={matchedStudents_unenroll} />
    );

    const myStudentsNameElement3 = screen.getByText(matchedStudents_unenroll[0].name);
    expect(myStudentsNameElement3).toBeInTheDocument();
    const actionsButton = screen.getByText("Actions");
    userEvent.click(actionsButton);

    const unEnrollButton = await screen.findByRole("menuitemcheckbox", {
      name: "Unenroll",
    });
    expect(unEnrollButton).toBeInTheDocument();
    fireEvent.click(unEnrollButton);

    const url = `/teacher/unenroll-classes/${matchedStudents_unenroll[0].id}`;
    expect(push).toHaveBeenCalledWith(url);

  });

  it("should popup a modal for resetting progress", async () => {
    const matchedStudents = [
      { id: "1", email: "test1@test.com", name: "Test Student 1" },
    ];

    render(<MyStudents matchedStudents={matchedStudents} />);
    const myStudentsNameElement1 = screen.getByText(matchedStudents[0].name);
    expect(myStudentsNameElement1).toBeInTheDocument();
    const actionsButton = screen.getByText("Actions");
    userEvent.click(actionsButton);

    const resetProgressButton = await screen.findByRole("menuitemcheckbox", {
      name: "Reset Progress",
    });
    expect(resetProgressButton).toBeInTheDocument();
    userEvent.click(resetProgressButton);

    const ModalPage = await screen.findByText("Reset all XP progress");

    expect(ModalPage).toBeInTheDocument();
  });

});

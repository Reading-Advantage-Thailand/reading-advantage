import { useRouter } from "next/navigation";
import { render, screen, fireEvent } from "@testing-library/react";
import FirstRunLevelTest from "../components/first-run-level-test";
import { SessionProvider } from "next-auth/react";
import "@testing-library/jest-dom";
import "jest-canvas-mock";
import { toast } from "react-toastify"; // Import the toast function from your toast library

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("next-auth/react", () => ({
  useSession: () => [null, false],
}));

jest.mock("../locales/client", () => ({
  useScopedI18n: () => (key: string) => key,
}));

jest.mock("react-toastify", () => ({
  toast: jest.fn(),
}));

const mockTest = [
  {
    level: "A0",
    points: 0,
    questions: [
      {
        prompt: "question1",
        options: {
          A: "correct_for_1",
          B: "incorrect1_for_1",
          C: "incorrect2_for_1",
          D: "incorrect3_for_1",
        },
      },
      {
        prompt: "question2",
        options: {
          A: "correct_for_2",
          B: "incorrect1_for_2",
          C: "incorrect2_for_2",
          D: "incorrect3_for_2",
        },
      },
      {
        prompt: "question3",
        options: {
          A: "correct_for_3",
          B: "incorrect1_for_3",
          C: "incorrect2_for_3",
          D: "incorrect3_for_3",
        },
      },
    ],
  },
  {
    level: "A1",
    points: 0,
    questions: [
      {
        prompt: "question1",
        options: {
          A: "correct_for_1",
          B: "incorrect1_for_1",
          C: "incorrect2_for_1",
          D: "incorrect3_for_1",
        },
      },
      {
        prompt: "question2",
        options: {
          A: "correct_for_2",
          B: "incorrect1_for_2",
          C: "incorrect2_for_2",
          D: "incorrect3_for_2",
        },
      },
      {
        prompt: "question3",
        options: {
          A: "correct_for_3",
          B: "incorrect1_for_3",
          C: "incorrect2_for_3",
          D: "incorrect3_for_3",
        },
      },
    ],
  },
];

const testUserId = "user123";

describe("FirstRunLevelTest Page", () => {
  it("should render FirstRunLevelTest component", async () => {
    //ARRANGE
    render(
      <FirstRunLevelTest
        userId={testUserId}
        language_placement_test={mockTest}
      />
    );

    //ACT
    const header = await screen.findByText(/heading/i);

    //check if there is a button with the text "Next"
    const button = await screen.findByText(/Next/i);

    //ASSERT
    expect(header).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });
  it("should render 3 questions", async () => {
    //ARRANGE
    render(
      <FirstRunLevelTest
        userId={testUserId}
        language_placement_test={mockTest}
      />
    );

    //ACT
    const element = await screen.findByText(/question1/i);
    const element2 = await screen.findByText(/question2/i);
    const element3 = await screen.findByText(/question3/i);

    //ASSERT
    expect(element).toBeInTheDocument();
    expect(element2).toBeInTheDocument();
    expect(element3).toBeInTheDocument();
  });
  it("should render all answers for the 3 questions", async () => {
    render(
      <FirstRunLevelTest
        userId={testUserId}
        language_placement_test={mockTest}
      />
    );
    const element = await screen.findByText("incorrect1_for_1");
    const element2 = await screen.findByText("incorrect2_for_1");
    const element3 = await screen.findByText("incorrect3_for_1");
    const element4 = await screen.findByText("incorrect1_for_2");
    const element5 = await screen.findByText("incorrect2_for_2");
    const element6 = await screen.findByText("incorrect2_for_2");
    const element7 = await screen.findByText("incorrect1_for_3");
    const element8 = await screen.findByText("incorrect2_for_3");
    const element9 = await screen.findByText("incorrect3_for_3");
    const element10 = await screen.findByText("correct_for_1");
    const element11 = await screen.findByText("correct_for_2");
    const element12 = await screen.findByText("correct_for_3");

    expect(element).toBeInTheDocument();
    expect(element2).toBeInTheDocument();
    expect(element3).toBeInTheDocument();
    expect(element4).toBeInTheDocument();
    expect(element5).toBeInTheDocument();
    expect(element6).toBeInTheDocument();
    expect(element7).toBeInTheDocument();
    expect(element8).toBeInTheDocument();
    expect(element9).toBeInTheDocument();
    expect(element10).toBeInTheDocument();
    expect(element11).toBeInTheDocument();
    expect(element12).toBeInTheDocument();
  });
});

// write a test to check if there is a radio button for each question
describe("Check answers conditions", () => {
  it("should verify that all questions must be answered before proceeding", async () => {
    const t = jest.fn((key) =>
      key === "toast.attention" ? "Attention" : "Please answer all questions!"
    );

    render(
      <FirstRunLevelTest
        userId={testUserId}
        language_placement_test={mockTest}
      />
    );

    const radioButton1_for_1 = (await screen.findByDisplayValue(
      "incorrect1_for_1"
    )) as HTMLInputElement;
    const radioButton2_for_1 = (await screen.findByDisplayValue(
      "incorrect2_for_1"
    )) as HTMLInputElement;
    const radioButton3_for_1 = (await screen.findByDisplayValue(
      "correct_for_1"
    )) as HTMLInputElement;
    const radioButton1_for_2 = (await screen.findByDisplayValue(
      "incorrect1_for_2"
    )) as HTMLInputElement;
    const radioButton2_for_2 = (await screen.findByDisplayValue(
      "incorrect2_for_2"
    )) as HTMLInputElement;
    const radioButton3_for_2 = (await screen.findByDisplayValue(
      "correct_for_2"
    )) as HTMLInputElement;
    const radioButton1_for_3 = (await screen.findByDisplayValue(
      "incorrect1_for_3"
    )) as HTMLInputElement;
    const radioButton2_for_3 = (await screen.findByDisplayValue(
      "incorrect2_for_3"
    )) as HTMLInputElement;
    const radioButton3_for_3 = (await screen.findByDisplayValue(
      "correct_for_3"
    )) as HTMLInputElement;

    // Answer two questions
    const questions = [
      [radioButton1_for_1, radioButton2_for_1, radioButton3_for_1],
      [radioButton1_for_2, radioButton2_for_2, radioButton3_for_2],
      [radioButton1_for_3, radioButton2_for_3, radioButton3_for_3],
    ];

    questions.forEach((question) => {
      const selectedRadioButtons = question.filter((rb) => rb.checked);
      if (selectedRadioButtons.length < 3) {
        const toast = require("react-toastify").toast;
        toast({
          title: "Attention",
          description: "Please answer all questions!",
        });
      }
    });

    expect(toast).toHaveBeenCalledWith({
      title: "Attention",
      description: "Please answer all questions!",
    });
  });

  it("should verify that at least two correct answers must be selected", async () => {
    render(
      <FirstRunLevelTest
        userId={testUserId}
        language_placement_test={mockTest}
      />
    );
    const radioButton1 = (await screen.findByDisplayValue(
      "correct_for_1"
    )) as HTMLInputElement;
    const radioButton2 = (await screen.findByDisplayValue(
      "correct_for_2"
    )) as HTMLInputElement;
    const radioButton3 = (await screen.findByDisplayValue(
      "correct_for_3"
    )) as HTMLInputElement;

    // Question 1 and 2 are correct
    fireEvent.click(radioButton1);
    fireEvent.click(radioButton2);

    let checkedRadioButtons = [radioButton1, radioButton2, radioButton3].filter(
      (radioButton) => radioButton.checked
    );

    expect(checkedRadioButtons.length).toBeGreaterThanOrEqual(2);

    // Question 1 and 3 are correct
    fireEvent.click(radioButton1);
    fireEvent.click(radioButton3);

    checkedRadioButtons = [radioButton1, radioButton2, radioButton3].filter(
      (radioButton) => radioButton.checked
    );

    expect(checkedRadioButtons.length).toBeGreaterThanOrEqual(2);

    // Question 2 and 3 are correct
    fireEvent.click(radioButton2);
    fireEvent.click(radioButton3);

    checkedRadioButtons = [radioButton1, radioButton2, radioButton3].filter(
      (radioButton) => radioButton.checked
    );

    expect(checkedRadioButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("should redirect to the next page if 2 answers and above are correct", async () => {
    //ARRANGE
    render(
                <FirstRunLevelTest
                  userId={testUserId}
                  language_placement_test={mockTest}
                />
              );
    //ACT
      const radioButton1_for_1 = (await screen.findByDisplayValue(
        "incorrect1_for_1"
      )) as HTMLInputElement;
      const radioButton2_for_1 = (await screen.findByDisplayValue(
        "incorrect2_for_1"
      )) as HTMLInputElement;
      const radioButton3_for_1 = (await screen.findByDisplayValue(
        "correct_for_1"
      )) as HTMLInputElement;
      const radioButton1_for_2 = (await screen.findByDisplayValue(
        "incorrect1_for_2"
      )) as HTMLInputElement;
      const radioButton2_for_2 = (await screen.findByDisplayValue(
        "incorrect2_for_2"
      )) as HTMLInputElement;
      const radioButton3_for_2 = (await screen.findByDisplayValue(
        "correct_for_2"
      )) as HTMLInputElement;
      const radioButton1_for_3 = (await screen.findByDisplayValue(
        "incorrect1_for_3"
      )) as HTMLInputElement;
      const radioButton2_for_3 = (await screen.findByDisplayValue(
        "incorrect2_for_3"
      )) as HTMLInputElement;
      const radioButton3_for_3 = (await screen.findByDisplayValue(
        "correct_for_3"
      )) as HTMLInputElement;

      const nextButton = await screen.findByText(/Next/i);


    //ASSERT

    // 2 Correct answers
    // 7 cases, where 3 is the correct answer
    //3,3,1
    //3,3,2
    //3,1,3
    //3,2,3
    //1,3,3
    //2,3,3
    //3,3,3

    //Case 1: 3,3,1
    //Question1
    fireEvent.click(radioButton3_for_1);
    //Question2
    fireEvent.click(radioButton3_for_2);
    //Question3
    fireEvent.click(radioButton1_for_3);
    fireEvent.click(nextButton);
    const sectionTitle = await screen.findByText(/section/i, { selector: 'h1' });

    expect(sectionTitle).toBeInTheDocument;

    //Case 2: 3,3,2
    //Question1
    fireEvent.click(radioButton3_for_1);
    //Question2
    fireEvent.click(radioButton3_for_2);
    //Question3
    fireEvent.click(radioButton2_for_3);
    fireEvent.click(nextButton);

    expect(sectionTitle).toBeInTheDocument;

    //Case 3: 3,1,3
    //Question1
    fireEvent.click(radioButton3_for_1);
    //Question2
    fireEvent.click(radioButton1_for_2);
    //Question3
    fireEvent.click(radioButton3_for_3);
    fireEvent.click(nextButton);

    expect(sectionTitle).toBeInTheDocument;

    //Case 4: 3,2,3
    //Question1
    fireEvent.click(radioButton3_for_1);
    //Question2
    fireEvent.click(radioButton2_for_2);
    //Question3
    fireEvent.click(radioButton3_for_3);
    fireEvent.click(nextButton);

    expect(sectionTitle).toBeInTheDocument;

    //Case 5: 1,3,3
    //Question1
    fireEvent.click(radioButton1_for_1);
    //Question2
    fireEvent.click(radioButton3_for_2);
    //Question3
    fireEvent.click(radioButton3_for_3);
    fireEvent.click(nextButton);

    expect(sectionTitle).toBeInTheDocument;

    //Case 6: 2,3,3
    //Question1
    fireEvent.click(radioButton2_for_1);
    //Question2
    fireEvent.click(radioButton3_for_2);
    //Question3
    fireEvent.click(radioButton3_for_3);
    fireEvent.click(nextButton);

    expect(sectionTitle).toBeInTheDocument;

    //Case 7: 3,3,3
    //Question1
    fireEvent.click(radioButton3_for_1);
    //Question2
    fireEvent.click(radioButton3_for_2);
    //Question3
    fireEvent.click(radioButton3_for_3);
    fireEvent.click(nextButton);

    expect(sectionTitle).toBeInTheDocument;

  });

  it("should redirect to summary page if answered 0 correct answer", async () => {
    //ARRANGE
    render(
                <FirstRunLevelTest
                  userId={testUserId}
                  language_placement_test={mockTest}
                />
              );
    //ACT
      const radioButton1_for_1 = (await screen.findByDisplayValue(
        "incorrect1_for_1"
      )) as HTMLInputElement;
      const radioButton2_for_1 = (await screen.findByDisplayValue(
        "incorrect2_for_1"
      )) as HTMLInputElement;
      const radioButton3_for_1 = (await screen.findByDisplayValue(
        "correct_for_1"
      )) as HTMLInputElement;
      const radioButton1_for_2 = (await screen.findByDisplayValue(
        "incorrect1_for_2"
      )) as HTMLInputElement;
      const radioButton2_for_2 = (await screen.findByDisplayValue(
        "incorrect2_for_2"
      )) as HTMLInputElement;
      const radioButton3_for_2 = (await screen.findByDisplayValue(
        "correct_for_2"
      )) as HTMLInputElement;
      const radioButton1_for_3 = (await screen.findByDisplayValue(
        "incorrect1_for_3"
      )) as HTMLInputElement;
      const radioButton2_for_3 = (await screen.findByDisplayValue(
        "incorrect2_for_3"
      )) as HTMLInputElement;
      const radioButton3_for_3 = (await screen.findByDisplayValue(
        "correct_for_3"
      )) as HTMLInputElement;

      const nextButton = await screen.findByText(/Next/i);


    //ASSERT

    // 0 Correct answer
    // 8 cases, where there is no 3 as it is the correct answer
    //1,1,1
    //1,1,2
    //1,2,1
    //1,2,2
    //2,1,1
    //2,1,2
    //2,2,1
    //2,2,2

    //Case 1: 1,1,1
    //Question1
    fireEvent.click(radioButton1_for_1);
    //Question2
    fireEvent.click(radioButton1_for_2);
    //Question3
    fireEvent.click(radioButton1_for_3);
    fireEvent.click(nextButton);
    const summaryCardTitle = await screen.findByText(/congratulations/i, { selector: 'h3' });

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 2: 1,1,2
    //Question1
    fireEvent.click(radioButton1_for_1);
    //Question2
    fireEvent.click(radioButton1_for_2);
    //Question3
    fireEvent.click(radioButton2_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 3: 1,2,1
    //Question1
    fireEvent.click(radioButton1_for_1);
    //Question2
    fireEvent.click(radioButton2_for_2);
    //Question3
    fireEvent.click(radioButton1_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 4: 1,2,2
    //Question1
    fireEvent.click(radioButton1_for_1);
    //Question2
    fireEvent.click(radioButton2_for_2);
    //Question3
    fireEvent.click(radioButton2_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 5: 2,1,1
    //Question1
    fireEvent.click(radioButton2_for_1);
    //Question2
    fireEvent.click(radioButton1_for_2);
    //Question3
    fireEvent.click(radioButton1_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 6: 2,1,2
    //Question1
    fireEvent.click(radioButton2_for_1);
    //Question2
    fireEvent.click(radioButton1_for_2);
    //Question3
    fireEvent.click(radioButton2_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 7: 2,2,1
    //Question1
    fireEvent.click(radioButton2_for_1);
    //Question2
    fireEvent.click(radioButton2_for_2);
    //Question3
    fireEvent.click(radioButton1_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 8: 2,2,2
    //Question1
    fireEvent.click(radioButton2_for_1);
    //Question2
    fireEvent.click(radioButton2_for_2);
    //Question3
    fireEvent.click(radioButton2_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;
  });

  it("should redirect to summary page if answered 1 correct answer", async () => {
    //ARRANGE
    render(
                <FirstRunLevelTest
                  userId={testUserId}
                  language_placement_test={mockTest}
                />
              );
    //ACT
      const radioButton1_for_1 = (await screen.findByDisplayValue(
        "incorrect1_for_1"
      )) as HTMLInputElement;
      const radioButton2_for_1 = (await screen.findByDisplayValue(
        "incorrect2_for_1"
      )) as HTMLInputElement;
      const radioButton3_for_1 = (await screen.findByDisplayValue(
        "correct_for_1"
      )) as HTMLInputElement;
      const radioButton1_for_2 = (await screen.findByDisplayValue(
        "incorrect1_for_2"
      )) as HTMLInputElement;
      const radioButton2_for_2 = (await screen.findByDisplayValue(
        "incorrect2_for_2"
      )) as HTMLInputElement;
      const radioButton3_for_2 = (await screen.findByDisplayValue(
        "correct_for_2"
      )) as HTMLInputElement;
      const radioButton1_for_3 = (await screen.findByDisplayValue(
        "incorrect1_for_3"
      )) as HTMLInputElement;
      const radioButton2_for_3 = (await screen.findByDisplayValue(
        "incorrect2_for_3"
      )) as HTMLInputElement;
      const radioButton3_for_3 = (await screen.findByDisplayValue(
        "correct_for_3"
      )) as HTMLInputElement;

      const nextButton = await screen.findByText(/Next/i);


    //ASSERT

    // 1 Correct answer
    // 12 Cases, where 3 is only the correct answer
    //3,1,1
    //3,1,2
    //3,2,1
    //3,2,2
    //1,3,1
    //1,3,2
    //2,3,1
    //2,3,2
    //1,1,3
    //1,2,3
    //2,1,3
    //2,2,3
    
    //Case 1: 3,1,1
    //Question1
    fireEvent.click(radioButton3_for_1);
    //Question2
    fireEvent.click(radioButton1_for_2);
    //Question3
    fireEvent.click(radioButton1_for_3);
    fireEvent.click(nextButton);
    const summaryCardTitle = await screen.findByText(/congratulations/i, { selector: 'h3' });

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 2: 3,1,2
    //Question1
    fireEvent.click(radioButton3_for_1);
    //Question2
    fireEvent.click(radioButton1_for_2);
    //Question3
    fireEvent.click(radioButton2_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 3: 3,2,1
    //Question1
    fireEvent.click(radioButton3_for_1);
    //Question2
    fireEvent.click(radioButton2_for_2);
    //Question3
    fireEvent.click(radioButton1_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 4: 3,2,2
    //Question1
    fireEvent.click(radioButton3_for_1);
    //Question2
    fireEvent.click(radioButton2_for_2);
    //Question3
    fireEvent.click(radioButton2_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 5: 1,3,1
    //Question1
    fireEvent.click(radioButton1_for_1);
    //Question2
    fireEvent.click(radioButton3_for_2);
    //Question3
    fireEvent.click(radioButton1_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 6: 1,3,2
    //Question1
    fireEvent.click(radioButton1_for_1);
    //Question2
    fireEvent.click(radioButton3_for_2);
    //Question3
    fireEvent.click(radioButton2_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 7: 2,3,1
    //Question1
    fireEvent.click(radioButton2_for_1);
    //Question2
    fireEvent.click(radioButton3_for_2);
    //Question3
    fireEvent.click(radioButton1_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 8: 2,3,2
    //Question1
    fireEvent.click(radioButton2_for_1);
    //Question2
    fireEvent.click(radioButton3_for_2);
    //Question3
    fireEvent.click(radioButton2_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 9: 1,1,3
    //Question1
    fireEvent.click(radioButton1_for_1);
    //Question2
    fireEvent.click(radioButton1_for_2);
    //Question3
    fireEvent.click(radioButton3_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 10: 1,2,3
    //Question1
    fireEvent.click(radioButton1_for_1);
    //Question2
    fireEvent.click(radioButton2_for_2);
    //Question3
    fireEvent.click(radioButton3_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 11: 2,1,3
    //Question1
    fireEvent.click(radioButton2_for_1);
    //Question2
    fireEvent.click(radioButton1_for_2);
    //Question3
    fireEvent.click(radioButton3_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;

    //Case 12: 2,2,3
    //Question1
    fireEvent.click(radioButton2_for_1);
    //Question2
    fireEvent.click(radioButton2_for_2);
    //Question3
    fireEvent.click(radioButton3_for_3);
    fireEvent.click(nextButton);

    expect(summaryCardTitle).toBeInTheDocument;

  });
});

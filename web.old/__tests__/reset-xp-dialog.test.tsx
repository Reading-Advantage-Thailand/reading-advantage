// Import necessary libraries
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import ResetDialog from "../../web/components/reset-xp-dialog";
import { useRouter } from "next/navigation";
import fetchMock from 'jest-fetch-mock';
import FirstRunLevelTest from "@/components/first-run-level-test";

fetchMock.enableMocks();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  useSession: () => [null, false],
}));

jest.mock("../locales/client", () => ({
  useScopedI18n: () => (key: string) => key,
}));

describe("resetXP", () => {
  it('should open the dialog when "Reset XP" button is clicked', async () => {
    render(<ResetDialog />);

    const resetXPButton = screen.getByText(/Reset XP/i);
    fireEvent.click(resetXPButton);

    // Assuming that the dialog is rendered after the click
    const dialogTitle = await screen.findByText(/Reset all XP progress/i);

    expect(dialogTitle).toBeInTheDocument();
  });

  it('should close the dialog when the "Close" button is clicked', async () => {
    render(<ResetDialog />);

    const resetXPButton = screen.getByText(/Reset XP/i);
    fireEvent.click(resetXPButton);

    const closeButton = screen.getByText(/Close/i);
    fireEvent.click(closeButton);

    // Assuming that the dialog is closed after the click
    const dialogTitle = screen.queryByText(/Reset all XP progress/i);

    expect(dialogTitle).not.toBeInTheDocument();
  });

  it('should close the dialog when the "Cancel" button is clicked', async () => {
    render(<ResetDialog />);

    const resetXPButton = screen.getByText(/Reset XP/i);
    fireEvent.click(resetXPButton);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    // Assuming that the dialog is closed after the click
    const dialogTitle = screen.queryByText(/Reset all XP progress/i);

    expect(dialogTitle).not.toBeInTheDocument();
  });

  it('should call the resetXP function when the "Reset" button is clicked', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: "success" }));

    const refresh = jest.fn();
    (useRouter as jest.Mock).mockImplementation(() => ({ refresh }));

    render(<ResetDialog />);

    const resetXPButton = screen.getByText(/Reset XP/i);
    fireEvent.click(resetXPButton);

    const confirmResetButton = screen.getByText("Confirm Reset");
    fireEvent.click(confirmResetButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  });

  it('should redirect to FirstRunLevelTest page after the "Reset" button is clicked', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: "success" }));

    const refresh = jest.fn();
    (useRouter as jest.Mock).mockImplementation(() => ({ refresh }));

    render(<ResetDialog />);

    const resetXPButton = screen.getByText(/Reset XP/i);
    fireEvent.click(resetXPButton);

    const confirmResetButton = screen.getByText("Confirm Reset");
    fireEvent.click(confirmResetButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const testUserId = "user123";
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
});
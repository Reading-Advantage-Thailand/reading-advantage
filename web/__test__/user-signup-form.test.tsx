import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import SignInPage from "@/app/[locale]/(auth)/auth/signin/page";
import { useRouter } from "next/router";
import { UserSignInForm } from "@/components/user-signin-form";
import { userEvent } from "@testing-library/user-event";
import { signIn } from "next-auth/react";

// Mock the firebase/auth module
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn().mockReturnValue({}),
  signInWithPopup: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  GoogleAuthProvider: jest.fn(), // Mock the GoogleAuthProvider
}));

// Mock next-auth signIn function
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("SignIn Page", () => {
  const mockUser = {
    user: {
      uid: "12345",
      email: "user@example.com",
      password: "password123",
      displayName: "Test User",
      getIdToken: jest.fn().mockResolvedValue("mock-id-token"),
    },
  };
  const mockRouter = jest.fn(); // Mock push method for redirection

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouter }); // Mock useRouter to use the mockPush function
  });

  it("Test render", () => {
    render(<SignInPage />);

    expect(
      screen.getByPlaceholderText(/name@example.com/i)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/google/i)).toBeInTheDocument();
    expect(screen.getAllByText(/sign in/i)[0]).toBeInstanceOf(HTMLElement);
  });

  describe("Firebase OAuth Login", () => {
    it("should trigger Google login on button click", async () => {
      // Arrange
      const { getByText } = render(<UserSignInForm />);
      (signInWithPopup as jest.Mock).mockResolvedValue(mockUser);
      const mockAuth = { currentUser: mockUser.user };
      (getAuth as jest.Mock).mockReturnValue(mockAuth);

      // Act
      fireEvent.click(getByText("Google"));

      // Assert
      await waitFor(() => {
        expect(signInWithPopup).toHaveBeenCalled();
      });
    });
    it("should login with Google with redirect", async () => {
      // Mock the Firebase signInWithPopup function
      (signInWithPopup as jest.Mock).mockResolvedValue(mockUser);
      const { getByText } = render(<UserSignInForm />);

      //Act
      await act(async () => {
        fireEvent.click(getByText("Google"));
      });

      // Assert
      expect(signInWithPopup).toHaveBeenCalledTimes(1);

      await expect(
        (signInWithPopup as jest.Mock).mock.results[0].value
      ).resolves.toEqual(mockUser);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith("credentials", {
          idToken: "mock-id-token",
          callbackUrl: "/",
        });
      });
    });
    it("should handle OAuth login failure", async () => {
      // Mock the Firebase signInWithPopup to reject with an error
      (signInWithPopup as jest.Mock).mockRejectedValue(
        new Error("OAuth failed")
      );
      const { getByText } = render(<UserSignInForm />);

      // Act
      await act(async () => {
        fireEvent.click(getByText("Google"));
      });

      // Assert that no redirection happened
      expect(signInWithPopup).not.toHaveBeenCalledTimes(0);

      // Assert that no redirection happened
      expect(mockRouter).not.toHaveBeenCalled();
    });
  });

  describe("Firebase Email/Password Login", () => {
    const onSubmit = jest.fn();

    afterEach(() => {
      onSubmit.mockClear();
    });

    it("should login with email and password with redirect", async () => {
      // Mock the Firebase signInWithEmailAndPassword function
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUser);
      const { getByPlaceholderText, getByRole, queryByPlaceholderText } =
        render(<UserSignInForm />);

      // Simulate user typing email and password

      const emailInput = getByPlaceholderText(/name@example.com/i);
      const passwordInput = getByPlaceholderText(/password/i);
      await userEvent.type(emailInput, "user@example.com");
      await userEvent.type(passwordInput, "password123");

      // Simulate form submission

      await userEvent.click(getByRole("button", { name: "Sign in" }));

      // Check values in the input fields
      expect(queryByPlaceholderText(/name@example.com/)).toHaveValue(
        "user@example.com"
      );
      expect(queryByPlaceholderText(/password/)).toHaveValue("password123");

      //Assert that signInWithEmailAndPassword was called with the correct arguments
      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          {},
          "user@example.com",
          "password123"
        );
      });

      // Check if next-auth's signIn was called with the correct idToken
      expect(signIn).toHaveBeenCalledWith("credentials", {
        idToken: "mock-id-token",
        callbackUrl: "/",
      });
    });
    it("should show an error message on login failure", async () => {
      // Mock signInWithEmailAndPassword to reject (simulate login failure)
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(
        new Error("Login failed")
      );

      // Render login page
      const { getByPlaceholderText, getByRole, getByText } = render(
        <UserSignInForm />
      );

      await act(async () => {
        // Simulate typing into email and password fields
        fireEvent.change(getByPlaceholderText(/name@example.com/i), {
          target: { value: "wrong@example.com" },
        });
        fireEvent.change(getByPlaceholderText(/password/i), {
          target: { value: "wrongpassword" },
        });

        // Simulate form submission
        userEvent.click(getByRole("button", { name: "Sign in" }));
      });

      // Assert that signInWithEmailAndPassword was called with the wrong credentials
      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          {}, // This is the mocked auth instance
          "wrong@example.com",
          "wrongpassword"
        );
      });

      // Assert that an error message is displayed
      await waitFor(() => {
        expect(getByText(/Something went wrong./i)).toBeInTheDocument();
      });

      // Assert that no redirection happened
      expect(mockRouter).not.toHaveBeenCalled();
    });
  });
});

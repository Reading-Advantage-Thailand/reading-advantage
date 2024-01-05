import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import FlashCard from "@/components/flash-card";

describe("Form", () => {
  it("renders successfully", () => {
    const { container } = render(
      <FlashCard userId="w9FZImkGDmTPPn7x5urEtSr7Ch12" />
    );
    expect(container).toBeInTheDocument();
  });
});






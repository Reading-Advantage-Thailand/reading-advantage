import { render, screen } from "@testing-library/react";
import React from "react";
import { getScopedI18n } from "@/locales/server";
import { Header } from "@/components/header";

jest.mock('../locales/server', () => ({
  getScopedI18n: () => (key: any, variables: any) => {
    return `${key} ${JSON.stringify(variables)}`;
  },
}));

describe("StudentHistoryForTeacher", () => {
  let t;

  beforeEach(async () => {
    t = await getScopedI18n('pages.student.historyPage');
    render(<Header heading={t('title', {userName: 'Test User'})} />);
  });

  it('renders correctly', () => {
    render(<Header heading="Test Heading" />);
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });

  it('renders correctly with translation', async () => {
    expect(screen.getByText(`title {"userName":"Test User"}`)).toBeInTheDocument();
  });

});

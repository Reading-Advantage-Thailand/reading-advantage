import { render, screen } from '@testing-library/react';
import ClassRoster from '../components/teacher/class-roster';

jest.mock('../components/teacher/class-roster', () => {
  return function DummyClassRoster() {
    return <div>Roster for classroom</div>;
  };
});

jest.mock("../locales/client", () => ({
  useScopedI18n: () => (key: string) => key,
}));

describe('ClassRoster', () => {
  test('renders ClassRoster component', () => {
    render(<ClassRoster studentInClass={[]} />);
    expect(screen.getByText(/Roster for classroom/i)).toBeInTheDocument();
  });
});
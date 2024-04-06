import {
  render,
  fireEvent,
  waitFor,
  screen,
  act,
} from "@testing-library/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import FirstRoleSelection from "../components/first-role-selection";
import {
  SelectedRoleContext,
  SelectedRoleProvider,
} from "../contexts/userRole-context";
import { UserRole } from "@/types/constants";
import React from "react";
import RoleSelected from "@/components/teacher/role-selected";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("axios");

jest.mock("axios", () => ({
  patch: jest.fn().mockResolvedValue({ status: 200, data: {} }),
}));

describe('FirstRoleSelection', () => {
  it('renders the page', () => {
    const { getByText } = render(<FirstRoleSelection userId="test-user-id" role={''} />);
    expect(getByText('What do you want to do?')).toBeInTheDocument();
  });

  it('sends role data to the database when save is clicked', async () => {
    jest.spyOn(axios, 'patch').mockResolvedValueOnce({ data: {} });

    const selectedRole = 'STUDENT';
    const setSelectedrole = jest.fn();

    const { getByText } = render(
      <SelectedRoleContext.Provider value={[selectedRole, setSelectedrole]}>
        <FirstRoleSelection userId="test-user-id" role={''} />
      </SelectedRoleContext.Provider>
    );

    fireEvent.click(getByText('I want to learn'));
    await waitFor(() => {
        fireEvent.click(getByText('Save'));
    })
    expect(axios.patch).toHaveBeenCalledWith(
        "/api/users/test-user-id/roles",
        {
          headers: {"Content-Type": "application/json"},
          selectedRole: selectedRole,
          userId: "test-user-id"
        }
      );
  });

  it('redirects to the correct page when the student role is selected', async () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push,
    });

    const setSelectedRole = jest.fn();
    const selectedRole = 'STUDENT';

     // Mock the API call
  (axios.patch as jest.Mock).mockResolvedValue({
    status: 200,
    data: {},
  });

    const { getByText } = render(
      <SelectedRoleContext.Provider value={[selectedRole, setSelectedRole]}>
        <FirstRoleSelection userId="test-user-id" role={''} />
      </SelectedRoleContext.Provider>
    );

    fireEvent.click(screen.getByText('I want to learn'));
    fireEvent.click(getByText('Save'));

    await waitFor(() => {
        expect(push).toHaveBeenCalledWith('/level');
    });
  });

  it('redirects to the correct page when the teacher role is selected', async () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push,
    });

    const setSelectedRole = jest.fn();
    const selectedRole = 'TEACHER';

     // Mock the API call
  (axios.patch as jest.Mock).mockResolvedValue({
    status: 200,
    data: {},
  });

    const { getByText } = render(
      <SelectedRoleContext.Provider value={[selectedRole, setSelectedRole]}>
        <FirstRoleSelection userId="test-user-id" role={''} />
      </SelectedRoleContext.Provider>
    );

    fireEvent.click(screen.getByText('I want to teach'));
    fireEvent.click(getByText('Save'));

    await waitFor(() => {
        expect(push).toHaveBeenCalledWith('/teacher/my-classes');
    });
  });

});

describe('SelectedRoleProvider', () => {
  type UserRole = 'role1' | 'role2';

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
  });

  it('should retrieve the selectedRole from localStorage on initial render', () => {
    const savedRoles: UserRole[] = ['role1', 'role2'];
    Storage.prototype.getItem = jest.fn(() => JSON.stringify(savedRoles));

    act(() => {
      render(
        <SelectedRoleProvider>
          <div />
        </SelectedRoleProvider>
      );
    });

    expect(localStorage.getItem).toHaveBeenCalledWith('selectedRole');
  });

  it('should store the selectedRole in localStorage when it changes', () => {
    const savedRoles: UserRole[] = ['role1', 'role2'];
    let setSelectedRole: (roles: UserRole[]) => void = () => {};

    act(() => {
      render(
        <SelectedRoleProvider>
          <SelectedRoleContext.Consumer>
            {([_, setRole]) => {
              setSelectedRole = setRole;
              return null;
            } }
          </SelectedRoleContext.Consumer>
        </SelectedRoleProvider>
      );
    });

    act(() => {
      setSelectedRole(savedRoles);
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('selectedRole', JSON.stringify(savedRoles));
  });
});

describe("RoleSelected", () => {
  const userId = "test-user-id";
  const roles = [UserRole.ADMIN, UserRole.STUDENT, UserRole.TEACHER];
  const setSelectedRole = jest.fn();
  const selectedRole = roles;

  it("renders checkboxes for roles", () => {
    const { getByLabelText } = render(
      <SelectedRoleContext.Provider value={[selectedRole, setSelectedRole]}>
        <RoleSelected userId={userId} role={""} />
      </SelectedRoleContext.Provider>
    );
    roles.forEach((role) => {
      expect(getByLabelText(role)).toBeInTheDocument();
    });
  });

  it('handles role selection', () => {
    const { getByLabelText } = render(
      <SelectedRoleContext.Provider value={[selectedRole, setSelectedRole]}>
        <RoleSelected userId={userId} role={''} />
      </SelectedRoleContext.Provider>
    );

    fireEvent.click(getByLabelText(UserRole.ADMIN));
    expect(setSelectedRole).toHaveBeenCalled();
  });

  it('handles role change', async () => {
    const { getByText } = render(
      <SelectedRoleContext.Provider value={[selectedRole, setSelectedRole]}>
        <RoleSelected userId={userId} role={''} />
      </SelectedRoleContext.Provider>
    );

    fireEvent.click(getByText('Save'));

    await waitFor(() => expect(axios.patch).toHaveBeenCalled());
  });

  it("can be selected multiple roles", () => {
    const { getByLabelText } = render(
      <SelectedRoleContext.Provider value={[selectedRole, setSelectedRole]}>
        <RoleSelected userId={userId} role={""} />
      </SelectedRoleContext.Provider>
    );
  
    const adminCheckbox = getByLabelText(UserRole.ADMIN);
    const teacherCheckbox = getByLabelText(UserRole.TEACHER);
    const studentCheckbox = getByLabelText(UserRole.STUDENT);
  
    fireEvent.click(adminCheckbox);
    fireEvent.click(teacherCheckbox);
    fireEvent.click(studentCheckbox);
  
    expect(adminCheckbox).toBeChecked();
    expect(teacherCheckbox).toBeChecked();
    expect(studentCheckbox).toBeChecked();
  });

  it('updates the selected roles and makes a request to update the user roles', async () => {
    const setSelectedRole = jest.fn();
    const userId = 'testUserId';
    const mockAxios = axios as jest.Mocked<typeof axios>;
    mockAxios.patch.mockResolvedValue({ status: 200, data: {} });

    const { getByLabelText, getByText } = render(
      <SelectedRoleContext.Provider value={[selectedRole, setSelectedRole]}>
        <RoleSelected userId={userId} role={""} />
      </SelectedRoleContext.Provider>
    );

    // onSelectRole
    act(() => {
      fireEvent.click(getByLabelText(UserRole.ADMIN));
    });
  
    expect(setSelectedRole.mock.calls[0][0]).toEqual(expect.any(Function));

    // handleRoleChange
    act(() => {
      fireEvent.click(getByLabelText(UserRole.TEACHER));
      fireEvent.click(getByLabelText(UserRole.STUDENT));
      fireEvent.click(getByLabelText(UserRole.ADMIN));
      
    });
    fireEvent.click(getByText('Save'));
    const expectedRoles = ['ADMINISTRATOR', 'TEACHER', 'STUDENT'].sort();

    expect(mockAxios.patch).toHaveBeenCalledWith(`/api/users/${userId}/roles`, {
      selectedRole: expectedRoles,
      userId,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Rendering checkboxes and button
    Object.values(UserRole).forEach(role => {
      expect(getByLabelText(role)).toBeInTheDocument();
    });
    expect(getByText('Save')).toBeInTheDocument();
  });

});


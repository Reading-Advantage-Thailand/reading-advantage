import { render, fireEvent, waitFor, screen, act } from '@testing-library/react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import FirstRoleSelection from '../components/first-role-selection';
import { SelectedRoleContext, SelectedRoleProvider } from '../contexts/userRole-context';
import FirstRunLevelTest from '@/components/first-run-level-test';
import { UserRole } from "@/types/constants";
import React from 'react';

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
  }));
  
  jest.mock("axios");

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


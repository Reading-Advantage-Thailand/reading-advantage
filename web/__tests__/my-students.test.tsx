import React, { useState, useEffect } from 'react';
import { render, fireEvent, waitFor, getByText } from '@testing-library/react';
import MyStudents from '../components/teacher/my-students';
import { I18nProviderClient } from '../locales/client';
import { screen } from "@testing-library/dom";
import { useI18n } from '../locales/client';

jest.mock('../locales/client', () => ({
    ...jest.requireActual('react'),
    useI18n: () => ({
      t: (key: any) => key, 
    }),
  }));

describe('MyStudents page', () => {
//   test('can render the page', () => {
//     render(
//         <I18nProviderClient locale="en">
//           <MyStudents userId="" matchedStudents={[]} />
//         </I18nProviderClient>
//       );
//       expect(screen.getByText("My Classroom")).toBeInTheDocument();
//   });

test('can search', async () => {
    const { getByPlaceholderText, getByText } = render(
      <I18nProviderClient locale="en">
        <MyStudents userId={''} matchedStudents={[]} />
      </I18nProviderClient>
    );
    const searchInput = getByPlaceholderText('Search'); 

    fireEvent.change(searchInput, { target: { value: 'John' } }); 

    await waitFor(() => {
        expect(getByText('John')).toBeInTheDocument(); 
    });
  });

//   test('can sort by name', async () => {
//     const { getByText } = render(<MyStudents userId={''} matchedStudents={[]} />);
//     const sortButton = getByText('Name'); // adjust this to your sort button's text

//     fireEvent.click(sortButton); // simulate clicking the sort button

//     await waitFor(() => {
//       // adjust this to check that the first student's name in the sorted list is displayed
//       expect(getByText('Adam')).toBeInTheDocument(); // assuming 'Adam' would be the first name when sorted
//     });
//   });
});
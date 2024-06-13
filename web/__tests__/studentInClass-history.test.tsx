import { render, screen } from '@testing-library/react';
import StudentHistoryForTeacher from '@/app/[locale]/(teacher)/teacher/class-roster/[classroomId]/history/[studentId]/page';
import { fetchData } from "../utils/fetch-data";
import { ClassroomData } from '../lib/classroom-utils';
import { User } from 'next-auth';
import { getCurrentUser } from '../lib/session';
import React from 'react';
import { getScopedI18n } from '@/locales/server';
import * as studentAPI from '@/lib/classroom-utils';

jest.mock('../locales/server', () => ({
    getScopedI18n: jest.fn(() => {
      // return the mocked function here
      return (key: string) => {
        const translations: { [key: string]: string } = {
          'title': 'Mocked Title',
          // add other translation keys here
        };
        return translations[key];
      };
    }),
  }));

jest.mock('../utils/fetch-data', () => ({
  fetchData: jest.fn().mockResolvedValue({
    results: [
      { rated: 4 },
      { rated: 2 },
    ],
  }),
}));

jest.mock('../lib/classroom-utils', () => ({
  ClassroomData: jest.fn().mockResolvedValue({
    studentsMapped: [
      { studentId: 'test-student-id', studentName: 'Test Student' },
    ],
  }),
}));

jest.mock('../lib/session', () => ({
  getCurrentUser: jest.fn().mockResolvedValue({
    cefrLevel: 'A1',
    level: 1,
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    image: 'test-image-url',
    verified: true,
    xp: 100,
    role: 'teacher',
  }) as jest.MockedFunction<typeof getCurrentUser>,
}));

describe('StudentHistoryForTeacher', () => {
    it('receives and uses params', async () => {
      const mockClassroomData = {
        studentsMapped: [
          { studentId: 'test-student-id', studentName: 'Test Student' },
        ],
        allClassroom: null,
        allStudent: null,
        allTeachers: null,
        teacherId: null,
        studentInEachClass: null,
        matchedStudents: null,
        classrooms: null,
        studentEmail: null,
      };
      // studentAPI.fetchStudentHistory.mockResolvedValue(mockClassroomData);
        render(<StudentHistoryForTeacher params={{
          studentId: '',
          classroomId: ''
        }}  />);
        
        // Check if the component is rendered
        expect(screen.getByText('Test Student')).toBeInTheDocument();
      });

    //   it ('render correctly', async () => {
    //     render(<StudentHistoryForTeacher params={{ studentId: '1', classroomId: '1' }} />);
    //     expect(screen.getByText('Mocked Title')).toBeInTheDocument();
    //   }
    // );

});

// jest.mock('../lib/session');
// jest.mock('../utils/fetch-data');
// jest.mock('../lib/classroom-utils');

// test('renders StudentHistoryForTeacher', async () => {
//   const mockClassroomData = {
//     studentsMapped: [
//       { studentId: '123', studentName: 'John Doe' },
//       { studentId: '456', studentName: 'Jane Doe' },
//     ],
//     allClassroom: null,
//     allStudent: null,
//     allTeachers: null,
//     teacherId: null,
//     studentInEachClass: null,
//     matchedStudents: null,
//     classrooms: null,
//     studentEmail: null,
//   };
//   (ClassroomData as jest.MockedFunction<typeof ClassroomData>).mockResolvedValue(mockClassroomData);

//   render(<StudentHistoryForTeacher params={{ studentId: '123', classroomId: '456' }} />);

//   // Add your assertions here
//   // For example, you can check if the component renders the correct user name
//   expect(screen.getByText('John Doe')).toBeInTheDocument();
// });
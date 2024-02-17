import getCorrectAnswer from '../components/first-run-level-test';
import { useRouter } from 'next/router'
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import FirstRunLevelTest from '../components/first-run-level-test';

// jest.mock('next/router', () => ({
//     ...jest.requireActual('next/router'),
//     useRouter: () => ({
//       route: '/',
//       pathname: '',
//       query: '',
//       asPath: '',
//     //   push: jest.fn(),
//     //   replace: jest.fn(),
//     push: jest.fn().mockResolvedValue(true),
//     replace: jest.fn().mockResolvedValue(true),
//     }),
//   }))

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

// describe('getCorrectAnswer function', () => {
//   test('collects only correct answers from the key "A" in data response', () => {
//     render(<FirstRunLevelTest userId={''} language_placement_test={[]}  />);
//     // Mock the language_placement_test data
//     const language_placement_test = [
//         {
//           level: "A1",
//           points: 0,
//           questions: [
//               { prompt:'question1', options: { A: 'correct1', B: 'incorrect1' } },
//               { prompt:'question2', options: { A: 'correct2', B: 'incorrect2' } },
//               { prompt:'question3', options: { A: 'correct3', B: 'incorrect3' } },
//             ],
//       },
//       {
//         level: "A2",
//         points: 1,
//         questions: [
//             { prompt:'question4', options: { A: 'correct4', B: 'incorrect4' } },
//             { prompt:'question5', options: { A: 'correct5', B: 'incorrect5' } },
//             { prompt:'question6', options: { A: 'correct6', B: 'incorrect6' } },
//         ],
//       },
//     ];

//     // Call the function with the updated mock data and function
//    // Call the function with the updated mock data and function
//  const correctAnswers = getCorrectAnswer({
//      userId: 'user123',
//      language_placement_test: language_placement_test,
//  });

//  // Expected correct answers
//  const expectedAnswers = ['correct1', 'correct2', 'correct3', 'correct4', 'correct5', 'correct6'];

//    // Check if the function returns the correct answers
//    expect(correctAnswers).toEqual(expectedAnswers);
//   });
// });


describe('getCorrectAnswer', () => {
    it('should collect the correct answer in key "A" for each question', () => {
        type Props = {
            userId: string;
            language_placement_test: any[];
            questions: any[]; // Add the 'questions' property to the 'Props' type definition
        };

        const questions = [
            { A: 'correct1', B: 'incorrect1', C: 'incorrect2', D: 'incorrect3' },
            { A: 'correct2', B: 'incorrect4', C: 'incorrect5', D: 'incorrect6' },
            // add more questions as needed
        ];

        const expected = ['correct1', 'correct2']; // expected result

        const result = getCorrectAnswer({
            userId: '',
            language_placement_test: [],
            // questions: questions,
        });

        expect(result).toEqual(expected);
    });
});
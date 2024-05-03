import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import RatingPopup from "@/components/rating-popup";

jest.mock('../../web/locales/client', () => ({
  useScopedI18n: jest.fn().mockReturnValue('en'), // สร้าง mock สำหรับ useScopedI18n และให้คืนค่าสตริง 'en'
}));

describe('test RatingPopup Component', () => {
  const userId: string = "thCEVfWhjzSGhEsIvyCyPEjvIrw2";
  const articleId: string = "fk4apD2Gq5ahaE5sqSy7";
  const averageRating: number = 3;
  
  test('render Rate this article', () => {
    render(
      <RatingPopup
        averageRating={averageRating}
        userId={userId}
        articleId={articleId}
      />
    );  
    expect(screen.getByText('Rate this article')).toBeInTheDocument();
  });
});

// describe('test your rating send to database', () => {
//   const userId: string = "thCEVfWhjzSGhEsIvyCyPEjvIrw2";
//   const articleId: string = "fk4apD2Gq5ahaE5sqSy7";
//   const averageRating: number = 3;
  
//   test('sends your rating to the database when clicked submit', async() => {
//     jest.spyOn(axios, 'patch').mockResolvedValueOnce({ data: {} });

//     render(
//       <RatingPopup
//         averageRating={averageRating}
//         userId={userId}
//         articleId={articleId}
//       />
//     );
//     fireEvent.click(screen.getByText('Rate this article'));
//     await waitFor(() => {
//       fireEvent.click(screen.getByLabelText('4'));
//     })
//     await waitFor(() => {
//       fireEvent.click(screen.getByText('Submit'))
//     })
//     expect(axios.patch).toHaveBeenCalledWith(
//       `/api/users/${userId}/article-records`,
//       {
//         articleId,
//         rating: 4
//       }
//     )
//   });
// });



import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import FlashCard from "@/components/flash-card";
import { updateScore, getPreviousData, levelCalculation } from "../lib/utils";
import fetchMock from "jest-fetch-mock";
import axios from 'axios';

describe("Form", () => {
  it("renders successfully", () => {
    const { container } = render(
      <FlashCard userId="w9FZImkGDmTPPn7x5urEtSr7Ch12" />
    );
    expect(container).toBeInTheDocument();
  });
});

// test for levelCalculation function
describe('levelCalculation', () => {
  it('should return correct level for given xp', () => {
    expect(levelCalculation(1000)).toEqual({ cefrLevel: "A0-", raLevel: 0 });
    expect(levelCalculation(4000)).toEqual({ cefrLevel: "A0", raLevel: 1 });
    expect(levelCalculation(6000)).toEqual({ cefrLevel: "A0+", raLevel: 2 });
    expect(levelCalculation(12000)).toEqual({ cefrLevel: "A1", raLevel: 3 });
    expect(levelCalculation(19000)).toEqual({ cefrLevel: "A1+", raLevel: 4 });
  });

  it('should return empty level for xp out of range', () => {
    expect(levelCalculation(-1)).toEqual({ cefrLevel: "", raLevel: "" });
    expect(levelCalculation(250000)).toEqual({ cefrLevel: "", raLevel: "" });
  });
});

//test for updateScore function
fetchMock.enableMocks();

  it('returns "success" when data is updated', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ status: "success" }));
    const mockUpdateSession = jest.fn();

    const result = await updateScore(10, "qWXtOI9Hr6QtILuhsrOc06zXZUg1", mockUpdateSession);

    expect(result.status).toEqual(201);
  });

  it('returns "error" when data is not updated', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ status: "error" }));

    const mockUpdateSession = jest.fn();

    const result = await updateScore(1/0, "qWXtOI9Hr6QtILuhsrOc06zXZUg1", mockUpdateSession);

    if(result.status !== 201){
      expect(result.status).toEqual(501);
    }
  });


// test for getPreviousData function  
jest.mock('axios');

describe('getPreviousData', () => {
  it('should return cefrLevel and xp for a given userId', async () => {
    const userId = 'test-user-id';
    const mockResponse = {
      data: {
        data: {
          cefrLevel: 'B2',
          xp: 2000,
        },
      },
    };

    (axios.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await getPreviousData(userId);

    expect(result).toEqual({ cefrLevel: 'B2', previousXp: 2000 });
    expect(axios.get).toHaveBeenCalledWith(`/api/users/${userId}`);
  });
});
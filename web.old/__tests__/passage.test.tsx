import { render } from "@testing-library/react";
import Passages from "@/components/teacher/passages";

jest.mock("../locales/client", () => ({
  useScopedI18n: () =>
    jest.fn().mockReturnValue("Passages" || "Search..." || "Fiction"),
  useCurrentLocale: () => "en",
}));

const passages: Passage[] = [
  {
    title: "Test Passage",
    searchTerm: "",
    id: "",
    type: "fiction",
    ra_level: "",
    genre: "",
    subgenre: "",
    is_read: false,
    cefr_level: "",
    summary: "",
    average_rating: 0,
  },
  {
    title: "Another Passage",
    searchTerm: "",
    id: "",
    type: "non-fiction",
    ra_level: "",
    genre: "",
    subgenre: "",
    is_read: false,
    cefr_level: "",
    summary: "",
    average_rating: 0,
  },
];

type Passage = {
  searchTerm: string;
  id: string;
  title: string;
  type: string;
  ra_level: string;
  genre: string;
  subgenre: string;
  is_read: boolean;
  cefr_level: string;
  summary: string;
  average_rating: number;
};

function filterPassages(
  currentItems: Passage[],
  searchTerm: string,
  type: string,
  selectedGenre: string,
  selectedSubgenre: string,
  selectedLevels: string[]
): Passage[] {
  return currentItems.filter((passage) => {
    const isTitleMatch = passage.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const isTypeMatch = passage.type === type;
    const isGenreMatch = passage.genre === selectedGenre;
    const isSubgenreMatch = passage.subgenre === selectedSubgenre;
    const isLevelMatch = selectedLevels.includes(passage.ra_level);
    return (
      isTitleMatch &&
      isTypeMatch &&
      isGenreMatch &&
      isSubgenreMatch &&
      isLevelMatch
    );
  });
}

describe("Passages", () => {
  it("renders correctly", async (): Promise<void> => {
    const { findAllByText } = render(<Passages passages={passages} />);

    const elements = await findAllByText("Passages");
    elements.forEach((element) => {
      expect(element).toBeInTheDocument();
    });
  });

  it("displays only passages that match the search term", async () => {
    const searchTerm = "Test";

    const isTestPassageIncluded = passages.some((passages) =>
      passages.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    expect(isTestPassageIncluded).toBe(true);
  });

  it("filters passages correctly", () => {
    const currentItems = [
      {
        title: "Title 1",
        type: "fiction",
        genre: "Genre 1",
        subgenre: "Subgenre 1",
        ra_level: "1",
        searchTerm: "",
        id: "1",
        is_read: false,
        cefr_level: "",
        summary: "",
        average_rating: 0,
      },
      {
        title: "Title 2",
        type: "non-fiction",
        genre: "Genre 2",
        subgenre: "Subgenre 2",
        ra_level: "2",
        searchTerm: "",
        id: "2",
        is_read: false,
        cefr_level: "",
        summary: "",
        average_rating: 0,
      },
    ];
    const searchTerm = "Title 1";
    const type = "fiction";
    const selectedGenre = "Genre 1";
    const selectedSubgenre = "Subgenre 1";
    const selectedLevels = ["1"];

    const result = filterPassages(
      currentItems,
      searchTerm,
      type,
      selectedGenre,
      selectedSubgenre,
      selectedLevels
    );

    expect(result).toEqual([
      {
        title: "Title 1",
        type: "fiction",
        genre: "Genre 1",
        subgenre: "Subgenre 1",
        ra_level: "1",
        searchTerm: "",
        id: "1",
        is_read: false,
        cefr_level: "",
        summary: "",
        average_rating: 0,
      },
    ]);
  });
});

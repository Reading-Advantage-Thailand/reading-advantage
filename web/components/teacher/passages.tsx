"use client";
import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Checkbox } from "@mui/material";
import { Button } from "../ui/button";
import { Header } from "../header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { CaretSortIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useScopedI18n } from "@/locales/client";
import ArticleShowcaseCard from "../article-showcase-card";

interface CustomCheckboxProps {
  label: string;
  selected: boolean;
  onSelectionChange: (label: string) => void;
}

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
  created_at: string;
  is_approved: boolean;
};

type PassagesProps = {
  passages: Passage[];
};

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  label,
  selected,
  onSelectionChange,
}) => {
  return (
    <div
      className={`border-2 ${
        selected ? "bg-primary text-white" : "border-gray-300"
      } p-2 m-1 cursor-pointer w-[40px]`}
      onClick={() => onSelectionChange(label)}
    >
      {label}
    </div>
  );
};

export default function Passages({ passages }: PassagesProps) {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedSubgenre, setSelectedSubgenre] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [filteredPassages, setFilteredPassages] = useState<Passage[]>([]);
  const [prevSelectedGenre, setPrevSelectedGenre] = useState(selectedGenre);
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedItems, setSelectedItems] = useState(0);
  const currentItems = passages;
  const t = useScopedI18n("components.articleRecordsTable");
  const tp = useScopedI18n("components.passages");
  const [sortOption, setSortOption] = useState("");
  const [sortOrder, setSortOrder] = useState('Ascending');

  const FICTION = "fiction";
  const NON_FICTION = "nonfiction";


  //   const filteredAndSortedPassages = useMemo(() => {
//     let result = passages.filter(passage => 
//       passage.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) &&
//       (!selectedGenre || passage.genre === selectedGenre) &&
//       (!selectedSubgenre || passage.subgenre === selectedSubgenre) &&
//       (selectedLevels.length === 0 || selectedLevels.includes(passage.ra_level.toString()))
//     );

//     if (sortOption) {
//       result.sort((a, b) => {
//         const compareValue = sortOption === "rating" 
//           ? a.average_rating - b.average_rating
//           : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
//         return sortOrder === "Ascending" ? compareValue : -compareValue;
//       });
//     }

//     return result;
//   }, [passages, debouncedSearchTerm, selectedGenre, selectedSubgenre, selectedLevels, sortOption, sortOrder]);

//   const currentItems = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return filteredAndSortedPassages.slice(startIndex, startIndex + itemsPerPage);
//   }, [filteredAndSortedPassages, currentPage]);

//   const handleSortChange = useCallback((value: React.SetStateAction<string>) => {
//     setSortOption(value);
//     setSortOrder(prevOrder => prevOrder === "Ascending" ? 'Descending' : 'Ascending');
//   }, []);

//   const handleSelectionChange = useCallback((level: string) => {
//     setSelectedLevels(prevLevels => 
//       prevLevels.includes(level)
//         ? prevLevels.filter(l => l !== level)
//         : [...prevLevels, level]
//     );
//   }, []);


  const getSubgenres = (selectedGenre: string) => {
    let subgenresData: Set<string> = new Set();
    filteredPassages.forEach((passage) => {
      if (passage.genre === selectedGenre) subgenresData.add(passage.subgenre);
    });
    return Array.from(subgenresData);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setType((prevType) =>
      prevType === event.target.value ? "" : event.target.value
    );
  };

  const handleSelectionChange = (level: string) => {
    setSelectedLevels((prevLevels) => {
      if (prevLevels.includes(level)) {
        return prevLevels.filter((lvl) => lvl !== level);
      } else {
        return [...prevLevels, level];
      }
    });
  };

  const handleSortChange = (value: string) => {
    if (sortOption === value) {
      setSortOrder(sortOrder === "Ascending" ? 'Descending' : 'Ascending');
    } else {
      setSortOrder('Ascending');
    }
    setSortOption(value);
  };

  const sortPassages = (passages: any[]) => {
    return passages.sort((a, b) => {
      if (sortOption === "rating") {
        return sortOrder === "Ascending"
          ? a.average_rating - b.average_rating
          : b.average_rating - a.average_rating;
      } else if (sortOption === "date") {
        return sortOrder === "Ascending"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return 0;
      }
    });
  };

  const displayedItems = isFiltered
    ? filteredPassages.slice((currentPage - 1) * 10, currentPage * 10)
    : passages.slice((currentPage - 1) * 10, currentPage * 10);

  const filterPassages = (
    currentItems: Passage[],
    searchTerm: string,
    type: string,
    selectedGenre: string,
    selectedSubgenre: string,
    selectedLevels: string[]
  ) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const lowerCaseType = type.toLowerCase();
    const lowerCaseSelectedGenre = selectedGenre.toLowerCase();
    const lowerCaseSelectedSubgenre = selectedSubgenre.toLowerCase();

    const filteredItems = currentItems.filter((passage) => {
      const titleMatch =
        !searchTerm ||
        passage.title.toLowerCase().includes(lowerCaseSearchTerm);
      const typeMatch =
        !type ||
        passage.type.toLowerCase() ===
          (lowerCaseType === FICTION ? FICTION : NON_FICTION);
      const genreMatch =
        !selectedGenre ||
        passage.genre.toLowerCase() === lowerCaseSelectedGenre;
      const subgenreMatch =
        !selectedSubgenre ||
        passage.subgenre.toLowerCase() === lowerCaseSelectedSubgenre;
      const levelMatch =
        selectedLevels.length === 0 ||
        selectedLevels.includes(passage.ra_level.toString());

      return (
        titleMatch && typeMatch && genreMatch && subgenreMatch && levelMatch
      );
    });
    setCurrentPage(1);
    setSelectedItems(filteredItems.length);
    return filteredItems;
  };

  useEffect(() => {
    if (prevSelectedGenre !== selectedGenre) {
      setSelectedSubgenre("");
    }

    let filtered = filterPassages(
      currentItems,
      searchTerm,
      type,
      selectedGenre,
      selectedSubgenre,
      selectedLevels
    );
    setFilteredPassages(filtered);
    setIsFiltered(currentItems.length !== filtered.length);
  }, [
    selectedGenre,
    currentItems,
    searchTerm,
    type,
    selectedSubgenre,
    selectedLevels,
    prevSelectedGenre,
  ]);

  useEffect(() => {
    setPrevSelectedGenre(selectedGenre);
  }, [selectedGenre]);

  return (
    <>
      <Header heading={tp("heading")} />
      <Input
        placeholder={t("search")}
        className="w-full mt-4"
        value={searchTerm}
        onChange={handleSearchChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
        <div className="md:pr-4">
          {/* sort date and rating */}
          <div className="mb-4">
            <p className="font-bold">
              {tp("sortBy")} {sortOrder}
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                handleSortChange("rating");
              }}
            >
              {tp("rating")}
              <CaretSortIcon className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                handleSortChange("date");
              }}
            >
              {tp("date")}
              <CaretSortIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Fitered by type */}
          <div className="mb-4">
            <p className="font-bold">{tp("type")}</p>
            <div className="ml-4">
              <div className="flex items-center">
                <Checkbox
                  value="fiction"
                  checked={type === "fiction"}
                  onChange={handleTypeChange}
                />
                <p>{tp("fiction")}</p>
              </div>
              <div className="flex items-center">
                <Checkbox
                  value="non-fiction"
                  checked={type === "non-fiction"}
                  onChange={handleTypeChange}
                />
                <p>{tp("nonFiction")}</p>
              </div>
            </div>
          </div>

          {/* Filtered by topic */}
          <div className="mb-4">
            <p className="font-bold">{tp("topic")}</p>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost">
                  {selectedGenre || tp("selectGenre")}
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="overflow-y-auto max-h-[300px] w-[200px]">
                {[
                  ...new Set(
                    filteredPassages.map((passages) => passages.genre)
                  ),
                ].map((genre) => (
                  <DropdownMenuItem
                    onSelect={() => setSelectedGenre(genre)}
                    key={genre}
                  >
                    {genre}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* <div className=""> */}
              {selectedGenre && (
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost">
                      {selectedSubgenre || tp("selectSubGenre")}
                      <ChevronDownIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="overflow-y-auto max-h-[300px] w-[200px]">
                    {getSubgenres(selectedGenre).map((subgenre) => (
                      <DropdownMenuItem
                        onSelect={() => setSelectedSubgenre(subgenre)}
                        key={subgenre}
                      >
                        {subgenre}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            {/* </div> */}
            <div className="mt-4 flex gap-2">
            {selectedGenre && (
              <Button variant="default" onClick={() => setSelectedGenre("")}>
                {tp("resetGenre")}
              </Button>
            )}
            {selectedSubgenre && (
              <Button variant="default" onClick={() => setSelectedSubgenre("")}>
                {tp("resetSubGenre")}
              </Button>
            )}
            </div>
          </div>

          {/* Filtered by level */}
          <div className="">
            <p className="font-bold">{tp("level")}</p>
            <div className="grid grid-cols-7 w-full text-center">
              {Array.from({ length: 26 }, (_, i) => i + 1).map((level) => (
                <CustomCheckbox
                  key={level}
                  label={String(level)}
                  selected={selectedLevels.includes(String(level))}
                  onSelectionChange={handleSelectionChange}
                />
              ))}
            </div>
          </div>
        </div>

        {/* data card */}
        {isFiltered ? (
          <div className="grid grid-cols-1">
            {sortPassages(filteredPassages)
              .slice((currentPage - 1) * 10, currentPage * 10)
              .map((passage: Passage, index: number) => {
                return (
                  <div
                    key={index}
                    className="captoliza ml-4 mb-4 grid sm:grid-cols-1 grid-flow-row gap-4"
                  >
                    <ArticleShowcaseCard key={index} article={passage} />
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="grid grid-cols-1">
            {sortPassages(passages)
              .slice((currentPage - 1) * 10, currentPage * 10)
              .map((passage: Passage, index: number) => {
                return (
                  <div
                    key={index}
                    className="captoliza ml-4 mb-4 grid sm:grid-cols-1 grid-flow-row gap-4"
                  >
                    <ArticleShowcaseCard key={index} article={passage} />
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {t("select", {
            selected: displayedItems.length + (currentPage - 1) * 10,
            total: isFiltered ? filteredPassages.length : passages.length,
          })}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentPage(currentPage > 1 ? currentPage - 1 : 1);
              setSelectedItems(
                currentPage > 1 ? currentPage - 1 : 1 - 1 * itemsPerPage
              );
            }}
            disabled={currentPage === 1}
          >
            {t("previous")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentPage(
                currentPage <
                  Math.ceil(
                    (isFiltered ? filteredPassages.length : passages.length) /
                      itemsPerPage
                  )
                  ? currentPage + 1
                  : currentPage
              );
              setSelectedItems(
                currentPage <
                  Math.ceil(
                    (isFiltered ? filteredPassages.length : passages.length) /
                      itemsPerPage
                  )
                  ? selectedItems + displayedItems.length
                  : isFiltered
                  ? filteredPassages.length
                  : passages.length
              );
            }}
            disabled={
              currentPage ===
              Math.ceil(
                (isFiltered ? filteredPassages.length : passages.length) /
                  itemsPerPage
              )
            }
          >
            {t("next")}
          </Button>
        </div>
      </div>
    </>
  );
}

console.log('hello world');

// 'use client'
// import React, { useState, useCallback, useMemo } from "react";
// import { useDebounce } from "use-debounce";
// import { Input } from "../ui/input";
// import { Button } from "../ui/button";
// import { Header } from "../header";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "../ui/dropdown-menu";
// import { CaretSortIcon, ChevronDownIcon } from "@radix-ui/react-icons";
// import { useScopedI18n } from "@/locales/client";
// import ArticleShowcaseCard from "../article-showcase-card";

// // ... (keep the type definitions)
// type Passage = {
//   searchTerm: string;
//   id: string;
//   title: string;
//   type: string;
//   ra_level: string;
//   genre: string;
//   subgenre: string;
//   is_read: boolean;
//   cefr_level: string;
//   summary: string;
//   average_rating: number;
//   created_at: string;
//   is_approved: boolean;
// };

// type PassagesProps = {
//   passages: Passage[];
// };


// export default function OptimizedPassages({ passages }: PassagesProps) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
//   const [selectedGenre, setSelectedGenre] = useState("");
//   const [selectedSubgenre, setSelectedSubgenre] = useState("");
//   const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortOption, setSortOption] = useState("");
//   const [sortOrder, setSortOrder] = useState('Ascending');

//   const itemsPerPage = 10;
//   const t = useScopedI18n("components.articleRecordsTable");
//   const tp = useScopedI18n("components.passages");

//   const filteredAndSortedPassages = useMemo(() => {
//     let result = passages.filter(passage => 
//       passage.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) &&
//       (!selectedGenre || passage.genre === selectedGenre) &&
//       (!selectedSubgenre || passage.subgenre === selectedSubgenre) &&
//       (selectedLevels.length === 0 || selectedLevels.includes(passage.ra_level.toString()))
//     );

//     if (sortOption) {
//       result.sort((a, b) => {
//         const compareValue = sortOption === "rating" 
//           ? a.average_rating - b.average_rating
//           : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
//         return sortOrder === "Ascending" ? compareValue : -compareValue;
//       });
//     }

//     return result;
//   }, [passages, debouncedSearchTerm, selectedGenre, selectedSubgenre, selectedLevels, sortOption, sortOrder]);

//   const currentItems = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return filteredAndSortedPassages.slice(startIndex, startIndex + itemsPerPage);
//   }, [filteredAndSortedPassages, currentPage]);

//   const handleSortChange = useCallback((value: React.SetStateAction<string>) => {
//     setSortOption(value);
//     setSortOrder(prevOrder => prevOrder === "Ascending" ? 'Descending' : 'Ascending');
//   }, []);

//   const handleSelectionChange = useCallback((level: string) => {
//     setSelectedLevels(prevLevels => 
//       prevLevels.includes(level)
//         ? prevLevels.filter(l => l !== level)
//         : [...prevLevels, level]
//     );
//   }, []);

//   // ... (render JSX, keeping most of the existing structure but using the optimized variables and functions)

//   return (
//     <>
//       <Header heading={tp("heading")} />
//       <Input
//         placeholder={t("search")}
//         className="w-full mt-4"
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//       />

//       {/* ... (rest of the JSX, updated to use the new optimized variables and functions) */}

//       <div className="grid grid-cols-1">
//         {currentItems.map((passage, index) => (
//           <ArticleShowcaseCard key={passage.id} article={passage} />
//         ))}
//       </div>

//       {/* ... (pagination controls, updated to use filteredAndSortedPassages.length) */}
//     </>
//   );
// }

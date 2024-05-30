"use client";
import React, { useState, useRef, useEffect } from "react";
import { Input } from "../ui/input";
import { Checkbox } from "@mui/material";
import { Button } from "../ui/button";
import { Header } from "../header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { CaretSortIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useScopedI18n } from "@/locales/client";
import ArticleShowcaseCard from "../article-showcase-card";
import { set } from "lodash";

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
  const [sortOrder, setSortOrder] = useState("asc");

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
    setType(prevType => prevType === event.target.value ? "" : event.target.value);
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
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortOrder("asc");
    }
    setSortOption(value);
  };


  const sortPassages = (passages: any[]) => {
    return passages.sort((a, b) => {
      if (sortOption === "rating") {
        return sortOrder === 'asc' ? a.average_rating - b.average_rating : b.average_rating - a.average_rating;
      } else if (sortOption === "date") {
        return sortOrder === 'asc' ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime() : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return 0;
      }
    });
  };

  // const filterPassages = (
  //   currentItems: Passage[],
  //   searchTerm: string,
  //   type: string,
  //   selectedGenre: string,
  //   selectedSubgenre: string,
  //   selectedLevels: string[]
  // ) => {
  //   let filteredPassages = [...currentItems];

  //   if (searchTerm) {
  //     filteredPassages = filteredPassages.filter((passage) =>
  //       passage.title.toLowerCase().includes(searchTerm.toLowerCase())
  //     );
  //   }

  //   if (type) {
  //     filteredPassages = filteredPassages.filter((passage) => {
  //       if (type.toLowerCase() === "fiction") {
  //         return passage.type.toLowerCase() === "fiction";
  //       }
  //       if (type.toLowerCase() === "non-fiction") {
  //         return passage.type.toLowerCase() === "nonfiction";
  //       }
  //       return false;
  //     });
  //   }

  //   if (selectedGenre) {
  //     filteredPassages = filteredPassages.filter(
  //       (passage) => passage.genre.toLowerCase() === selectedGenre.toLowerCase()
  //     );
  //   }

  //   if (selectedSubgenre) {
  //     filteredPassages = filteredPassages.filter(
  //       (passage) =>
  //         passage.subgenre.toLowerCase() === selectedSubgenre.toLowerCase()
  //     );
  //   }

  //   if (selectedLevels.length > 0) {
  //     filteredPassages = filteredPassages.filter((passage) =>
  //       selectedLevels.includes(passage.ra_level.toString())
  //     );
  //   }

  //   if (selectedLevels.length > 0 && searchTerm) {
  //     filteredPassages = currentItems.filter((passage) => {
  //       const levelMatch = selectedLevels.includes(passage.ra_level.toString());
  //       const titleMatch = passage.title
  //         .toLowerCase()
  //         .includes(searchTerm.toLowerCase());
  //       return levelMatch && titleMatch;
  //     });
  //   }
  
  //   return filteredPassages;
  // };

  const displayedItems = isFiltered
    ? filteredPassages.slice((currentPage - 1) * 10, currentPage * 10)
    : passages.slice((currentPage - 1) * 10, currentPage * 10);

  const FICTION = "fiction";
const NON_FICTION = "nonfiction";

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
    const titleMatch = !searchTerm || passage.title.toLowerCase().includes(lowerCaseSearchTerm);
    const typeMatch = !type || passage.type.toLowerCase() === (lowerCaseType === FICTION ? FICTION : NON_FICTION);
    const genreMatch = !selectedGenre || passage.genre.toLowerCase() === lowerCaseSelectedGenre;
    const subgenreMatch = !selectedSubgenre || passage.subgenre.toLowerCase() === lowerCaseSelectedSubgenre;
    const levelMatch = selectedLevels.length === 0 || selectedLevels.includes(passage.ra_level.toString());

    return titleMatch && typeMatch && genreMatch && subgenreMatch && levelMatch;
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
              <p className="font-bold">{tp("sortBy")} {sortOrder}</p>
                <Button variant="ghost" onClick={() => {
                      handleSortChange('rating');
                }}>
                  {tp("rating")}
                  <CaretSortIcon className="ml-2 h-4 w-4" />               
                   </Button>
                <Button variant="ghost" onClick={() => {
                  handleSortChange('date');
                }}>
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
            <div className="flex flex-col w-full md:w-[50%] items-start ml-4">
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

{selectedSubgenre && (
            <DropdownMenuItem
              onSelect={() => setSelectedSubgenre('')}
            >
             reset subgenre
            </DropdownMenuItem>
          )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {selectedGenre && (
    <Button variant="default" onClick={() => setSelectedGenre('')}>
      {/* {tp("resetGenre")} */}
      reset genre
    </Button>
  )}
  {selectedSubgenre && (
    <Button variant="default" onClick={() => setSelectedSubgenre('')}>
      {/* {tp("resetSubGenre")} */}
      reset subgenre
    </Button>
  )}
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
              // setSelectedItems(
              //   currentPage > 1
              //     ? selectedItems - displayedItems.length
              //     : isFiltered
              //     ? filteredPassages.length
              //     : passages.length
              // );
              setSelectedItems(
                currentPage > 1 ? currentPage -1 : 1 - (1) * itemsPerPage
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
            disabled={ currentPage === Math.ceil(
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

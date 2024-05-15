"use client";
import React, { useState, useRef, useEffect, use } from "react";
import { Input } from "../ui/input";
import { Checkbox } from "@mui/material";
import { Button } from "../ui/button";
import { articleShowcaseType } from "@/types";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { Rating } from "@mui/material";
import { Header } from "../header";
import { ArticleShowcase } from "../models/article-model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useScopedI18n } from "@/locales/client";
import { set } from "lodash";
import { Divide } from "lucide-react";

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
  ra_level: number;
  genre: string;
  subgenre: string;
  is_read: boolean;
  cefr_level: string;
  summary: string;
  average_rating: number;
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
  const [searchQuery, setSearchQuery] = useState("");

  const currentItems = passages;
  const formRef = useRef<HTMLFormElement>(null);
  const t = useScopedI18n("components.articleRecordsTable");

  const getGenres = () => {
    let genresData: Set<string> = new Set();
    passages.forEach((passage) => {
      genresData.add(passage.genre);
    });
    return Array.from(genresData);
  };
  const genres = getGenres();

  const getSubgenres = (selectedGenre: string) => {
    let subgenresData: Set<string> = new Set();
    passages.forEach((passage) => {
      if (passage.genre === selectedGenre) subgenresData.add(passage.subgenre);
    });
    return Array.from(subgenresData);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setType(event.target.value);
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

  const filterPassages = (
    currentItems: Passage[],
    searchTerm: string,
    type: string,
    selectedGenre: string,
    selectedSubgenre: string,
    selectedLevels: string[]
  ) => {
    let filteredPassages = [...currentItems];

    if (searchTerm) {
      filteredPassages = filteredPassages.filter((passage) =>
        passage.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (type) {
      filteredPassages = filteredPassages.filter((passage) => {
        passage.type.toLowerCase() === type.toLowerCase();
        if (type === "fiction") {
          return passage.type === "fiction";
        }
        if (type === "non-fiction") {
          return passage.type === "nonfiction";
        }
      });
    }

    if (selectedGenre) {
      filteredPassages = filteredPassages.filter(
        (passage) => passage.genre.toLowerCase() === selectedGenre.toLowerCase()
      );
    }

    if (selectedSubgenre) {
      filteredPassages = filteredPassages.filter(
        (passage) =>
          passage.subgenre.toLowerCase() === selectedSubgenre.toLowerCase()
      );
    }

    if (selectedLevels.length > 0) {
      filteredPassages = filteredPassages.filter((passage) =>
        selectedLevels.includes(passage.ra_level.toString())
      );
    }

    if (selectedLevels.length > 0 && searchTerm) {
      filteredPassages = currentItems.filter((passage) => {
        const levelMatch = selectedLevels.includes(passage.ra_level.toString());
        const titleMatch = passage.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return levelMatch && titleMatch;
      });
    }

    return filteredPassages;
  };

  const displayedItems = isFiltered
    ? filteredPassages.slice((currentPage - 1) * 10, currentPage * 10)
    : passages.slice((currentPage - 1) * 10, currentPage * 10);

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
      <Header heading="Passages Page" />
            <Input
              placeholder={"Search..."}
              className="w-full mt-4"
              value={searchTerm}
              onChange={handleSearchChange}
            />
      <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
          <form ref={formRef} onSubmit={handleSubmit} className="md:pr-4">
            <div className="mb-4">
              <p className="font-bold">Type</p>
              <div className="ml-4">
                <div className="flex items-center">
                  <Checkbox
                    value="fiction"
                    checked={type === "fiction"}
                    onChange={handleTypeChange}
                  />
                  <p>Fiction</p>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    value="non-fiction"
                    checked={type === "non-fiction"}
                    onChange={handleTypeChange}
                  />
                  <p>Non Fiction</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="font-bold">Topic</p>
              <div className="flex flex-col w-full md:w-[50%] items-start ml-4">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost">
                      {selectedGenre || "Select Genre"}
                      <ChevronDownIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {genres.map((genre) => (
                      <DropdownMenuItem
                        onSelect={() => setSelectedGenre(genre)}
                        key={genre}
                      >
                        {genre}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {selectedGenre && (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost">
                        {selectedSubgenre || "Select Subgenre"}
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
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
              </div>
            </div>

            <div className="">
              <p className="font-bold">Level</p>
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
          </form>

        {/* data card */}
        {isFiltered ? (
          <div className="grid grid-cols-1">
            {filteredPassages
              .slice((currentPage - 1) * 10, currentPage * 10)
              .map((passage: Passage, index: number) => {
                return (
                  <div key={index} className="captoliza ml-4 mb-4 grid sm:grid-cols-1 grid-flow-row gap-4">
                    <Link href={`/student/read/${passage.id}`}>
                      <div
                        className="w-full flex flex-col gap-1 h-[20rem] bg-cover bg-center p-3 rounded-md hover:scale-105 transition-all duration-300 bg-black "
                        style={{
                          backgroundImage: `url('https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/images/${passage.id}.png')`,
                          boxShadow:
                            "inset 80px 10px 90px 10px rgba(0, 0, 0, 0.9)",
                          opacity: passage.is_read ? 0.3 : 1,
                        }}
                      >
                        <Badge
                          className="shadow-lg max-w-max"
                          variant="destructive"
                        >
                          Reading Advantage Level: {passage.ra_level}
                        </Badge>
                        <Badge
                          className="shadow-lg max-w-max"
                          variant="destructive"
                        >
                          CEFR Level: {passage.cefr_level}
                        </Badge>
                        <Badge
                          className="shadow-lg max-w-max"
                          variant="destructive"
                        >
                          <Rating
                            name="read-only"
                            value={passage.average_rating}
                            readOnly
                          />
                        </Badge>
                        <div className="mt-auto">
                          <p className="text-xl drop-shadow-lg font-bold text-white">
                            {passage.title}
                          </p>
                          <p className="text-sm drop-shadow-lg line-clamp-4">
                            {passage.summary}
                          </p>
                        </div>
                      </div>
                      {passage.is_read && (
                        <div className="flex justify-center">
                          <Badge className="relative m-auto -top-[11rem] text-md left-0 right-0 shadow-lg max-w-max bg-slate-200 text-slate-900">
                            Previously Read
                          </Badge>
                        </div>
                      )}
                    </Link>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="grid grid-cols-1">
            {passages
              .slice((currentPage - 1) * 10, currentPage * 10)
              .map((passage: Passage, index: number) => {
                return (
                  <div key={index} className="captoliza ml-4 mb-4 grid sm:grid-cols-1 grid-flow-row gap-4">
                    <Link href={`/student/read/${passage.id}`}>
                      <div
                        className="w-full flex flex-col gap-1 h-[20rem] bg-cover bg-center p-3 rounded-md hover:scale-105 transition-all duration-300 bg-black "
                        style={{
                          backgroundImage: `url('https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/images/${passage.id}.png')`,
                          boxShadow:
                            "inset 80px 10px 90px 10px rgba(0, 0, 0, 0.9)",
                          opacity: passage.is_read ? 0.3 : 1,
                        }}
                      >
                        <Badge
                          className="shadow-lg max-w-max"
                          variant="destructive"
                        >
                          Reading Advantage Level: {passage.ra_level}
                        </Badge>
                        <Badge
                          className="shadow-lg max-w-max"
                          variant="destructive"
                        >
                          CEFR Level: {passage.cefr_level}
                        </Badge>
                        <Badge
                          className="shadow-lg max-w-max"
                          variant="destructive"
                        >
                          <Rating
                            name="read-only"
                            value={passage.average_rating}
                            readOnly
                          />
                        </Badge>
                        <div className="mt-auto">
                          <p className="text-xl drop-shadow-lg font-bold text-white">
                            {passage.title}
                          </p>
                          <p className="text-sm drop-shadow-lg line-clamp-4">
                            {passage.summary}
                          </p>
                        </div>
                      </div>
                      {passage.is_read && (
                        <div className="flex justify-center">
                          <Badge className="relative m-auto -top-[11rem] text-md left-0 right-0 shadow-lg max-w-max bg-slate-200 text-slate-900">
                            Previously Read
                          </Badge>
                        </div>
                      )}
                    </Link>
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
            selected: selectedItems,
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
                currentPage > 1
                  ? selectedItems - displayedItems.length
                  : isFiltered
                  ? filteredPassages.length
                  : passages.length
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
            disabled={currentPage === selectedItems}
          >
            {t("next")}
          </Button>
        </div>
      </div>
    </>
  );
}

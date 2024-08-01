"use client";

import React from "react";
import { Rating, Stack } from "@mui/material";
import axios from "axios";
import { useScopedI18n } from "@/locales/client";
import { toast } from "./ui/use-toast";
import { Article } from "./models/article-model";
import { levelCalculation } from "@/lib/utils";

interface RateDialogProps {
  disabled?: boolean;
  averageRating: number;
  userId: string;
  articleId: string;
  article: Article;
  userXP: number;
  userLevel: number;
}

export default function RatingPopup({
  disabled = false,
  averageRating,
  userId,
  articleId,
  article,
  userXP,
  userLevel,
}: RateDialogProps) {
  const t = useScopedI18n("components.rate");
  const [value, setValue] = React.useState<number | null>(-1);
  const [modalIsOpen, setModalIsOpen] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [oldRating, setOldRating] = React.useState(0);

  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    // timeout: 1000,
  });

  React.useEffect(() => {
    ratedFetch();
  }, [userId, articleId]);

  const ratedFetch = async () => {
    try {
      const result = await instance.get(
        `/api/users/${userId}/article-records/${articleId}`
      );
      const data = result.data.userArticleRecord.rated;
      setOldRating(data);
    } catch (error) {
      console.log("Error fetching rating: ", error);
    }
  };

  const onUpdateUser = async () => {
    let xp;
    if (value === -1) return;
    if (value !== 0 && oldRating === 0) {
      xp = 10;
      // const response = await instance.patch(
      //   `/api/users/${userId}/article-records`,
      //   {
      //     articleId,
      //     rating: value,
      //     xpAward: xp,
      //   }
      // );
      const response = await fetch(`/api/v1/users/${userId}/activitylog`, {
        method: "POST",
        body: JSON.stringify({
          articleId: articleId || "STSTEM",
          activityType: "article_rating",
          activityStatus: "completed",
          xpEarned: xp,
          initialXp: userXP,
          finalXp: userXP + xp,
          initialLevel: userLevel,
          finalLevel: levelCalculation(userXP + xp).raLevel,
          details: {
            title: article.title,
            raLevel: article.ra_level,
            CEFRLevel: article.cefr_level,
          },
        }),
      });
      const data = await response.json();
      console.log(data);
      console.log(data.message === "Success");
      if (data.message === "Success") {
        toast({
          title: t("toast.success"),
          imgSrc: true,
          description: "Congratulations, you earned 10 XP.",
        });
        setModalIsOpen(false);
      }
      setLoading(false);
    } else if (value !== 0 && oldRating !== 0) {
      xp = 0;
      // const response = await instance.patch(
      //   `/api/users/${userId}/article-records`,
      //   {
      //     articleId,
      //     rating: value,
      //     xpAward: xp,
      //   }
      // );
      const response = await fetch(`/api/v1/users/${userId}/records`, {
        method: "POST",
        body: JSON.stringify({
          articleId: articleId || "STSTEM",
          activityType: "article_rating",
          activityStatus: "completed",
          xpEarned: xp,
          initialXp: userXP,
          finalXp: userXP + xp,
          initialLevel: userLevel,
          finalLevel: levelCalculation(userXP + xp).raLevel,
          details: {
            title: article.title,
            raLevel: article.ra_level,
            CEFRLevel: article.cefr_level,
          },
        }),
      });
      const data = await response.json();
      console.log(data);
      console.log(data.message === "Success");
      if (data.message === "Success") {
        toast({
          title: t("toast.success"),
          imgSrc: true,
          description: "you not earned XP.",
        });
        setModalIsOpen(false);
      }
      setLoading(false);
    }
  };

  const handleChange = (
    _event: React.ChangeEvent<{}>,
    newValue: number | null
  ) => {
    setValue(newValue ? newValue : 0);
  };

  const toggleModal = async () => {
    setModalIsOpen(!modalIsOpen);
    await fetch(`/api/v1/users/${userId}/records`, {
      method: "POST",
      body: JSON.stringify({
        articleId: articleId || "STSTEM",
        activityType: "article_rating",
        activityStatus: "in_progress",
        xpEarned: 0,
        initialXp: userXP,
        finalXp: userXP,
        initialLevel: userLevel,
        finalLevel: userLevel,
        details: {
          title: article.title,
          raLevel: article.ra_level,
          CEFRLevel: article.cefr_level,
        },
      }),
    });
  };

  return (
    <div className="">
      <div
        className="sm:pl-[4.0%] pl-6 mt-4 py-2 font-bold text-3xl
    flex sm:flex-row flex-wrap gap-4 items-center border-[1px] 
    dark:border-[#1e293b] border-gray-300 rounded-xl
  "
      >
        <h1 onClick={toggleModal} className="cursor-pointer">
          Rate this article
        </h1>
        <Stack onClick={toggleModal} className="cursor-pointer">
          <Rating
            value={averageRating}
            onChange={handleChange}
            precision={0.5}
            size="large"
            className="dark:bg-white py-1 px-4 rounded-xl"
            readOnly
          />
        </Stack>
      </div>

      {/* modal */}
      {modalIsOpen ? (
        <div
          className="w-full h-screen top-0 right-0 fixed 
        z-40 bg-white bg-opacity-80 dark:bg-black dark:bg-opacity-80"
        >
          <div className="flex h-screen justify-center items-center">
            <div
              className=" bg-white px-4 w-[450px]
             rounded-2xl py-6 shadow-2xl dark:bg-[#1e293b]"
            >
              <div
                className="flex justify-between mb-2 mx-4 
            "
              >
                <h1 className="font-bold text-xl">{t("title")}</h1>
                <button
                  onClick={() => setModalIsOpen(false)}
                  className="text-xl font-semibold -mt-4 p-1"
                >
                  x
                </button>
              </div>
              <p className="mx-4">{t("content")}</p>
              <div className="flex justify-center mt-6">
                <Rating
                  // sx={{
                  //   // change unselected color
                  //   "& .MuiRating-iconEmpty": {
                  //     color: "#f6a904",
                  //   },
                  // }}
                  value={value}
                  onChange={handleChange}
                  precision={0.5}
                  size="large"
                  className="dark:bg-white py-2 px-4 rounded-xl"
                />
              </div>
              <div className="mt-6 mx-4 flex justify-end items-end">
                <button
                  onClick={onUpdateUser}
                  className="bg-black text-white px-4 py-2 rounded-md 
              shadow-sm dark:bg-white dark:text-[#1e293b]"
                >
                  {t("submitButton")}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

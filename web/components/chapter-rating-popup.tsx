"use client";

import React from "react";
import { Rating, Stack } from "@mui/material";
import { useScopedI18n } from "@/locales/client";
import { toast } from "./ui/use-toast";
import {
  UserXpEarned,
  ActivityStatus,
  ActivityType,
} from "./models/user-activity-log-model";
import { useRouter } from "next/navigation";
import { StoryChapter } from "./models/article-model";

interface RateDialogProps {
  disabled?: boolean;
  averageRating: number;
  userId: string;
  articleId: string;
  story: StoryChapter;
}

export default function ChapterRatingPopup({
  disabled = false,
  averageRating,
  userId,
  articleId,
  story,
}: RateDialogProps) {
  const t = useScopedI18n("components.rateChapter"); 
  const [value, setValue] = React.useState<number | null>(-1);
  const [modalIsOpen, setModalIsOpen] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [oldRating, setOldRating] = React.useState(0);
  const router = useRouter();

  React.useEffect(() => {
    ratedFetch();
  }, [userId, articleId]);

  const ratedFetch = async () => {
    try {
      const ratingData = await fetch(
        `/api/v1/users/${userId}/activitylog`
      ).then((data) => data.json());
      const filterRating = ratingData.results.filter(
        (data: any) =>
          data.articleId === articleId &&
          data.activityType === ActivityType.ChapterRating
      );

      setOldRating(filterRating[0].details.rating);
    } catch (error) {
      console.log("Error fetching rating: ", error);
    }
  };

  const onUpdateUser = async () => {
    if (value === -1) return;
    if (value !== 0 && oldRating === 0) {
      const ratingActivity = await fetch(
        `/api/v1/users/${userId}/activitylog`,
        {
          method: "POST",
          body: JSON.stringify({
            articleId: articleId,
            activityType: ActivityType.ChapterRating,
            activityStatus: ActivityStatus.Completed,
            xpEarned: UserXpEarned.Chapter_Rating,
            details: {
              title: story.chapter.title,
              raLevel: story.ra_Level,
              cefr_level: story.cefr_level,
              rating: value,
            },
          }),
        }
      );
      const readActivity = await fetch(`/api/v1/users/${userId}/activitylog`, {
        method: "POST",
        body: JSON.stringify({
          articleId: articleId,
          activityType: ActivityType.ChapterRead,
          activityStatus: ActivityStatus.Completed,
          details: {
            title: story.chapter.title,
            raLevel: story.ra_Level,
            cefr_level: story.cefr_level,
            type: story.type,
            genre: story.genre,
            subgenre: story.subgenre,
          },
        }),
      });

      const resRatingActivity = await ratingActivity.json();
      const resReadActivity = await readActivity.json();
      if (resRatingActivity.status === 200 && resReadActivity.status === 200) {
        toast({
          title: t("toast.success"),
          imgSrc: true,
          description: `Congratulations!, You received ${UserXpEarned.Chapter_Rating} XP for completing this activity.`,
        });
        router.refresh();
        setModalIsOpen(false);
      }
      setLoading(false);
    } else if (value !== 0 && oldRating !== 0) {
      await fetch(`/api/v1/users/${userId}/activitylog`, {
        method: "POST",
        body: JSON.stringify({
          articleId: articleId,
          activityType: ActivityType.ChapterRead,
          activityStatus: ActivityStatus.Completed,
          xpEarned: UserXpEarned.Chapter_Rating,
          details: {
            title: story.chapter.title,
            raLevel: story.ra_Level,
            cefr_level: story.cefr_level,
            rating: value,
          },
        }),
      });
      toast({
        title: t("toast.success"),
        imgSrc: true,
        description: "you not earned XP.",
      });
      setModalIsOpen(false);

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
    await fetch(`/api/v1/users/${userId}/activitylog`, {
      method: "POST",
      body: JSON.stringify({
        articleId: articleId,
        activityType: "chapter_rating",
        activityStatus: "in_progress",
        details: {
          title: story.chapter.title,
          raLevel: story.ra_Level,
          cefr_level: story.cefr_level,
        },
      }),
    });
  };

  return (
    <div id="onborda-rating">
      <div
        className="sm:pl-[4.0%] pl-6 mt-4 py-2 font-bold text-3xl
    flex sm:flex-row flex-wrap gap-4 items-center border-[1px] 
    dark:border-[#1e293b] border-gray-300 rounded-xl
  "
      >
        <h1 onClick={toggleModal} className="cursor-pointer">
          Rate this chapter
        </h1>
        <Stack onClick={toggleModal} className="cursor-pointer">
          <Rating
            value={averageRating || 0}
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

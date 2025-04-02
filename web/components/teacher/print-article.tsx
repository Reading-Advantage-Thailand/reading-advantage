"use client";
import React, { useRef, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { useReactToPrint } from "react-to-print";
import { Article } from "@/components/models/article-model";
import { useCurrentLocale, useScopedI18n } from "@/locales/client";
import { Locale } from "@/configs/locale-config";

export default function PrintArticle({
  articleId,
  article,
}: {
  articleId: string;
  article: Article;
}) {
  const [laqQuestions, setLAQQuestions] = useState([]);
  const [saqQuestions, setSAQQuestions] = useState([]);
  const [maqQuestions, setMAQQuestions] = useState([]);
  const [wordList, setWordList] = useState([]);
  const [translated, setTranslated] = useState([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const locale = useCurrentLocale();
  const t = useScopedI18n("components.article");

  useEffect(() => {
    const fetchLAQQuestions = async () => {
      const response = await fetch(
        `/api/v1/articles/${articleId}/questions/laq`
      );
      const data = await response.json();
      if (data.message) {
        console.error(data.message);
      } else {
        setLAQQuestions(data.result.question);
      }
    };
    const fetchSAQQuestions = async () => {
      const response = await fetch(
        `/api/v1/articles/${articleId}/questions/sa`
      );
      const data = await response.json();
      if (data.message) {
        console.error(data.message);
      } else {
        setSAQQuestions(data.result.question);
      }
    };
    const fetchMAQQuestions = async () => {
      const response = await fetch(
        `/api/v1/articles/${articleId}/questions/mcq`
      );
      const data = await response.json();
      if (data.message) {
        console.error(data.message);
      } else {
        setMAQQuestions(data.results);
      }
    };
    const fetchWordList = async () => {
      const response = await fetch(`/api/v1/assistant/wordlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ article, articleId }),
      });
      const data = await response.json();
      if (data.message) {
        console.error(data.message);
      } else {
        setWordList(data.word_list);
      }
    };
    const fetchTranslate = async () => {
      type ExtendedLocale = "th" | "cn" | "tw" | "vi" | "zh-CN" | "zh-TW";
      let targetLanguage: ExtendedLocale = locale as ExtendedLocale;
      switch (locale) {
        case "cn":
          targetLanguage = "zh-CN";
          break;
        case "tw":
          targetLanguage = "zh-TW";
          break;
      }
      const response = await fetch(`/api/v1/assistant/translate/${articleId}`, {
        method: "POST",
        body: JSON.stringify({ type: "passage", targetLanguage }),
      });
      const data = await response.json();

      setTranslated(data.translated_sentences);
    };
    fetchTranslate();
    fetchWordList();
    fetchSAQQuestions();
    fetchMAQQuestions();
    fetchLAQQuestions();
  }, []);

  const paragraphs = article.passage.split("\n\n");

  return (
    <div>
      <Button onClick={() => reactToPrintFn()}>{t("printButton")}</Button>
      <div className="hidden">
        <div
          ref={contentRef}
          className="w-[210mm] h-[297mm] mx-auto p-12 bg-white shadow-lg rounded-lg print:p-6 print:shadow-none print:w-full print:h-full"
        >
          <header className="text-center mb-6">
            <h1 className="text-2xl font-bold">{article.title}</h1>
            <p className="text-gray-600 text-sm">
              RALevel : {article.ra_level} / Cefr Level : {article.cefr_level}
            </p>
            <p className="text-gray-700 mt-2">{article.summary}</p>
          </header>

          <div className="flex gap-6 items-start mb-6">
            <div className="w-1/3 bg-gray-100 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Vocabulary List</h3>
              <ul className="list-disc list-inside text-gray-700">
                {wordList?.map(
                  (
                    wordlist: {
                      vocabulary: string;
                      definition: { [key in Locale]: string };
                    },
                    index: number
                  ) => (
                    <li key={index}>
                      <span className="text-sm">{wordlist.vocabulary}</span>
                      {" - "}
                      <span className="text-sm">
                        {wordlist.definition[locale as Locale]}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="w-2/3 flex justify-center">
              <img
                src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/images/${articleId}.png`}
                alt="Article Illustration"
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </div>

          <article className="text-gray-800  leading-relaxed mb-6 p-4">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="mb-4 article-paragraph">
                {paragraph}
              </p>
            ))}
          </article>

          <div className="break-before-page"></div>

          <section className="p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">
              Multiple Choice Questions
            </h3>
            <div className="space-y-4">
              {maqQuestions?.map(
                (
                  question: { question: string; options: string[] },
                  index: number
                ) => (
                  <div key={index} className="maq-question">
                    <p className="font-medium">
                      {index + 1}. {question.question}
                    </p>
                    <div className="space-y-1 ">
                      {question.options.map((option, optionIndex: number) => (
                        <label key={optionIndex} className="flex items-center">
                          <input
                            type="radio"
                            name={`q${index + 1}`}
                            className="mr-2"
                          />
                          {String.fromCharCode(65 + optionIndex)}. {option}
                        </label>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </section>

          <div className="break-before-page"></div>

          <div className="p-6">
            <section className=" mb-6">
              <h3 className="text-xl font-semibold">Short Answer Question</h3>
              <p className="mt-2 text-gray-700">{saqQuestions}:</p>
              <div className="border-b border-gray-400 h-8 my-2"></div>
              <div className="border-b border-gray-400 h-8 my-2"></div>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold">Long Answer Question</h3>
              <p className="mt-2 text-gray-700">{laqQuestions}:</p>
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="border-b border-gray-400 h-8"></div>
                ))}
              </div>
            </section>
          </div>
          {locale !== "en" && (
            <>
              <div className="break-before-page"></div>

              <section className="p-6">
                <h3 className="text-xl font-semibold">Translation</h3>
                <p className="text-gray-800 leading-relaxed mt-6 text-sm">
                  {translated?.map((paragraph, index) => (
                    <p key={index} className="mb-4 translation-paragraph ">
                      {paragraph}
                    </p>
                  ))}
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

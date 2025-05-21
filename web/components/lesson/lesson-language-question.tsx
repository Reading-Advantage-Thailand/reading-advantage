"use client";
import { useCallback, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useScopedI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, MessageSquare, Send, Loader2, X } from "lucide-react";
import { Article } from "@/components/models/article-model";
import { useQuestionStore } from "@/store/question-store";
import { cn } from "@/lib/utils";

interface Message {
  text: string;
  sender: "user" | "bot";
}

interface Props {
  article: Article;
  skipPhase: () => void;
  onCompleteChange: (complete: boolean) => void;
}

export default function LessonLanguageQuestion({
  article,
  skipPhase,
  onCompleteChange,
}: Props) {
  const t = useScopedI18n("components.chatBot");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { mcQuestion, saQuestion, laqQuestion } = useQuestionStore();
  const inputLength = userInput.trim().length;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loadingPage, setLoadingPage] = useState(false);

  const handleSendMessage = useCallback(async () => {
    if (userInput) {
      const newMessage: Message = { text: userInput, sender: "user" };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setLoading(true);

      try {
        const res = await fetch(`/api/v1/assistant/chatbot-question`, {
          method: "POST",
          body: JSON.stringify({
            messages: updatedMessages,
            title: article.title,
            passage: article.passage,
            summary: article.summary,
            image_description: article.image_description,
            isInitial: false,
          }),
        });

        const data = await res.json();

        const response: Message = {
          text: data?.text,
          sender: "bot",
        };
        setMessages((msgs) => [...msgs, response]);
      } catch (error) {
        setMessages((msgs) => [
          ...msgs,
          { text: "Error: Could not fetch response.", sender: "bot" },
        ]);
      } finally {
        setLoading(false);
      }

      setUserInput(""); // clear input
    }
  }, [userInput, messages, article, mcQuestion, saQuestion, laqQuestion]);

  useEffect(() => {
    const initBotMessage = async () => {
      setLoading(true);
      try {
        const questionListMAQ = mcQuestion.results.map((item) => item.question);
        const blacklistedQuestions = [
          ...questionListMAQ,
          saQuestion?.result?.question,
          laqQuestion?.result?.question,
        ];

        const res = await fetch(`/api/v1/assistant/chatbot-question`, {
          method: "POST",
          body: JSON.stringify({
            messages: [],
            title: article.title,
            passage: article.passage,
            summary: article.summary,
            image_description: article.image_description,
            blacklistedQuestions,
            isInitial: true,
          }),
        });

        const data = await res.json();
        const initialMessage: Message = {
          text: `${data?.text}`,
          sender: "bot",
        };
        setMessages([initialMessage]);
      } catch (error) {
        setMessages([
          { text: "Error: Could not fetch initial question.", sender: "bot" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    initBotMessage();
  }, []);

  return (
    <>
      <div className="xl:h-[450px] w-full md:w-[700px] lg:w-[550px] xl:w-[700px] mt-5 pb-6">
        {loadingPage ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
            <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
          </div>
        ) : (
          <div className="rounded-lg pb-6">
            <div className="rounded-lg">
              <div className="flex-1 justify-end overflow-y-auto p-4 h-96">
                <div className="flex flex-1 flex-col gap-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                        message.sender === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.sender !== "user" ? (
                        <div>
                          <Bot />
                          <span>{message.text}</span>
                        </div>
                      ) : (
                        <span>{message.text}</span>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </div>
              <div className="p-2 border-t-[1px]">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (inputLength === 0) return;
                    handleSendMessage();
                  }}
                  className="flex w-full items-center space-x-2"
                >
                  <Input
                    placeholder="Type your message..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="flex-1 focus-visible:ring-0"
                    autoComplete="off"
                  />
                  {loading ? (
                    <Button
                      disabled
                      className="bg-blue-600 disabled:bg-gray-600"
                    >
                      <Loader2 className="animate-spin" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="icon"
                      disabled={inputLength === 0 || loading}
                      className="bg-blue-600 disabled:bg-gray-600 w-12"
                    >
                      <Send />
                      <span className="sr-only">Send</span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => {
                      onCompleteChange(true);
                      skipPhase();
                    }}
                    className="ml-2 hover:bg-gray-600"
                  >
                    Skip
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

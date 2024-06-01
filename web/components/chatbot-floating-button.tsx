"use client";
import { useCallback, useState, useRef, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { useScopedI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, MessageSquare } from "lucide-react";
import { Article } from "@/components/models/article-model";

interface Message {
  text: string;
  sender: "user" | "bot";
}

interface Props {
  article: Article;
}
export default function ChatBotFloatingChatButton({ article }: Props) {
  const t = useScopedI18n("components.chatBot");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  

  const handleSendMessage = useCallback(async () => {
    if (userInput) {
      const newMessage: Message = {
        text: userInput,
        sender: "user",
      };
      setMessages([...messages, newMessage]);
      setLoading(true); // Start loading     

    try {
      const resOpenAi = await axios.post(`/api/assistant/chatbot`, {
        newMessage,
        article,
      });

      const response: Message = {
        text: ` : ${resOpenAi?.data?.text}`,
        sender: "bot",
      };
      setMessages((messages) => [...messages, response]);
    } catch (error) {
      setMessages((msgs) => [
        ...msgs,
        { text: "Error: Could not fetch response.", sender: "bot" },
      ]);
    } finally {
      setLoading(false); // Stop loading
    }

      setUserInput(""); // Clear input after sending
    }
  }, [messages, userInput, article]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <div className="fixed bottom-4 right-4 flex items-center space-x-2 z-50">
        {!isOpen && (
          <div className="flex bg-blue-500 rounded-full shadow-lg py-2 px-4 items-center">
            <Image
              src={"/magic-wand-and-hat.svg"}
              alt="Magic wand and hat"
              width={30}
              height={30}
            />
            <span className=" text-white text-sm ml-2">
              {`${t("textSuggestion")}`}
            </span>
          </div>
        )}
        <Button
          onClick={() => {
            setIsOpen(!isOpen);
            setUserInput("");
            setMessages([]);
          }}
          className={`text-white ${
            isOpen ? "bg-red-500" : "bg-blue-500 hover:bg-blue-600 "
          } p-2 rounded-full focus:outline-none shadow-lg transition-colors`}
        >
          {isOpen ? "Close" : <MessageSquare className="w-6 h-6" />}
        </Button>
        {isOpen && (
          <div className="fixed bottom-14 right-5 w-96 h-96 bg-white border border-gray-300 p-4 shadow-xl rounded-lg overflow-hidden">
            <div className="flex flex-col justify-between h-full overflow-hidden">
              <div className="overflow-y-auto flex-1">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`rounded-lg text-white m-2 p-2 flex  ${
                      message.sender === "user"
                        ? "bg-blue-500 self-end"
                        : "bg-gray-500 self-start"
                    }`}
                  >
                    {message.sender === "bot" && (
                      <div>
                        <Bot className="mr-2 text-white" />
                      </div>
                    )}

                    <span>{message.text}</span>
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
                <div ref={messagesEndRef} />
              </div>
              {messages.length !== 2 && !loading && (
                <div className="shrink-0 flex m-2">
                  <Input
                    placeholder="Type your message..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="dark:text-black"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="ml-2 bg-blue-500 dark:bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 focus:outline-none"
                  >
                    Send
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

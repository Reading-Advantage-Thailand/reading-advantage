"use client";
import { useCallback, useState, useRef, useEffect } from "react";
import { useScopedI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, MessageSquare } from "lucide-react";

interface Message {
  text: string;
  sender: "user" | "bot";
}
export default function FloatingChatButton() {
  const t = useScopedI18n("components.chatBot");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = useCallback(() => {
    if (userInput) {
      const newMessage: Message = {
        text: userInput,
        sender: "user",
      };
      setMessages([...messages, newMessage]);
      // Send userInput to an OpenAI API or other backend here
      // Simulate a response for this example
      const response: Message = {
        text: ` : ${userInput}`,
        sender: "bot",
      };
      setMessages((messages) => [...messages, response]);
      setUserInput(""); // Clear input after sending
    }
  }, [messages, userInput]);

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
          <span className="bg-blue-500 text-white text-sm py-2 px-4 rounded-full shadow-lg">
            {`👋 ${t("textSuggestion")}`}
          </span>
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
              <div className="overflow-y-auto flex-1 break-all">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`rounded-lg text-white m-2 p-2 flex  ${
                      message.sender === "user"
                        ? "bg-blue-500 self-end"
                        : "bg-gray-500 self-start"
                    }`}
                  >
                   
                    {message.sender === "bot" && message.text.length <= 200 && (
                      <Bot className="mr-2 text-white" />
                    )}
                    <p>{message.text}</p>                  
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              {messages.length !== 2 && (
                <div className="shrink-0 flex m-2">
                  <Input
                    placeholder="Type your message..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="ml-2 bg-blue-500 text-white p-2 rounded-lg focus:outline-none"
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

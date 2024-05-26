"use client";
import { useCallback, useState } from "react";
import { useScopedI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface Message {
  text: string;
  sender: "user" | "bot";
}
export default function FloatingChatButton() {
  const t = useScopedI18n("components.chatBot");
   const [isOpen, setIsOpen] = useState(false);
   const [messages, setMessages] = useState<Message[]>([]);
   const [userInput, setUserInput] = useState<string>("");

   const handleSendMessage = useCallback(() => {
     const newMessage: Message = {
       text: userInput,
       sender: "user",
     };
     setMessages([...messages, newMessage]);
     // Send userInput to an OpenAI API or other backend here
     // Simulate a response for this example
     const response: Message = {
       text: `Echo: ${userInput}`,
       sender: "bot",
     };
     setMessages((messages) => [...messages, response]);
     setUserInput(""); // Clear input after sending
   }, [messages, userInput]);

   return (
     <div className="fixed bottom-4 right-4 flex items-center space-x-2 z-50">
       {!isOpen && (
         <span className="bg-blue-500 text-white text-sm py-2 px-4 rounded-full shadow-lg">
           {`👋 ${t("textSuggestion")}`}
         </span>
       )}
       <Button
         onClick={() => setIsOpen(!isOpen)}
         className={`text-white ${
           isOpen ? "bg-red-500" : "bg-blue-500 hover:bg-blue-600 "
         } p-2 rounded-full focus:outline-none shadow-lg transition-colors`}
       >
         {isOpen ? "Close" : <MessageSquare className="w-6 h-6" />}
       </Button>
       {isOpen && (
         <div className="absolute bottom-12 right-0 w-72 h-96 bg-white border border-gray-300 p-4 shadow-xl rounded-lg">
           <div className="overflow-y-auto flex-1">
             {messages.map((message, index) => (
               <div
                 key={index}
                 className={`rounded-lg text-white break-words m-1 p-2 ${
                   message.sender === "user"
                     ? "bg-blue-500 self-end"
                     : "bg-gray-500 self-start"
                 }`}
               >
                 {message.text}
               </div>
             ))}
           </div>
           {/* Additional chat functionality goes here */}
           <div className="flex mt-2">
             <input
               type="text"
               value={userInput}
               onChange={(e) => setUserInput(e.target.value)}
               className="flex-1 border-2 border-gray-300 p-2 rounded-lg focus:outline-none"
               placeholder="Type your message..."
             />
             <button
               onClick={handleSendMessage}
               className="ml-2 bg-blue-500 text-white p-2 rounded-lg focus:outline-none"
             >
               Send
             </button>
           </div>
         </div>
       )}
     </div>
   );
}

"use client";
import { useState } from "react";
import { useScopedI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function FloatingChatButton() {
  const t = useScopedI18n("components.chatBot");
   const [isOpen, setIsOpen] = useState(false);

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
           <p>Hello, how can I help you?</p>
           {/* Additional chat functionality goes here */}
         </div>
       )}
     </div>
   );
}

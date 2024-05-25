"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleChat = () => setIsOpen(!isOpen);
  return (
    <>
      <Button
        className="fixed bottom-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
        onClick={toggleChat}
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
          {/* Chat interface goes here */}
          <div className="absolute bottom-0 right-4 w-96 h-80 bg-white rounded-lg p-4 shadow-lg">
            {/* Content of chat interface */}
            <p>Chat content here...</p>
          </div>
        </div>
      )}
    </>
  );
}

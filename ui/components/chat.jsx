// components/chat-box.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";
import { Send } from "lucide-react";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const sendMessage = () => {
    if (!text.trim()) return;
    setMessages([...messages, text]);
    setText("");
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b py-0 pb-4 [.border-b]:pb-4">
        <CardTitle>Chat</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="h-100 overflow-y-auto rounded text-sm">
          {messages.length === 0 && (
            <p className="text-muted-foreground">Không có tin nhắn…</p>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="mb-2">
              <span className="block bg-zinc-200 dark:bg-zinc-800 rounded-lg px-3 py-1 w-fit">
                {msg}
              </span>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2 items-end"
        >
          <Textarea
            placeholder="Nhập tin nhắn…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <Button
            type="submit"
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center cursor-pointer"
          >
            <Send />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

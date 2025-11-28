// components/chat-box.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";
import { Send } from "lucide-react";

import MarkdownMessage from "./markdown-message";
import { useTodos } from "@/context/todo.context";
export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { addTodo, updateTodo, deleteTodo } = useTodos();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto scroll khi messages thay đổi
  useEffect(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50; // cách đáy < 50px

    if (isNearBottom) scrollToBottom();
  }, [messages]);

  const handleLLMAction = (actions) => {
    if (!actions || actions.length === 0) return;

    actions.forEach((ac) => {
      console.log("Handling LLM action:", ac);

      switch (ac.action) {
        case "add_todo":
          if (ac.created && typeof ac.created === "object") addTodo(ac.created);
          break;

        case "update_todo":
          if (ac.updated && typeof ac.updated === "object")
            updateTodo(ac.updated.id, ac.updated);
          break;
        case "delete_todo":
          if (ac.deleted && typeof ac.deleted === "object")
            deleteTodo(ac.deleted.id);
          break;

        case "get_todos":
          // Không cần thao tác gì, chỉ để LLM lấy danh sách hiện tại
          break;

        case "add_many_todo":
          if (ac.created && Array.isArray(ac.created)) {
            ac.created.forEach((t) => addTodo(t));
          }
          break;

        case "delete_many_todo":
          if (ac.deleted && Array.isArray(ac.deleted)) {
            ac.deleted.forEach((t) => deleteTodo(t.id));
          }
          break;

        default:
          break;
      }
    });
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setText("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      const data = await res.json();

      console.log("LLM Response:", data);
      const llmMessage = { role: "assistant", content: data.answer };
      setMessages((prev) => [...prev, llmMessage]);
      handleLLMAction(data.actions);
    } catch (err) {
      console.error("Error calling LLM:", err);
      const errorMessage = { role: "assistant", content: "Có lỗi xảy ra 😢" };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full gap-0">
      <CardHeader className="border-b py-0 pb-4 [.border-b]:pb-4">
        <CardTitle>Chat</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-0" ref={containerRef}>
        <div className="h-100 overflow-y-auto rounded text-sm  px-6 py-6">
          {messages.length === 0 && (
            <p className="text-muted-foreground">Không có tin nhắn…</p>
          )}

          {messages.map((msg, i) => (
            <div
              key={`${msg.role}-${i}`}
              className={`mb-2 flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <span
                className={`block rounded-lg px-3 py-1 w-fit max-w-[70%] break-words ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white"
                }`}
              >
                <MarkdownMessage content={msg.content} role={msg.role} />
              </span>
            </div>
          ))}

          {loading && (
            <div className="mb-2">
              <span className="block bg-zinc-200 dark:bg-zinc-800 rounded-lg px-3 py-1 w-fit italic text-gray-500">
                Đang trả lời…
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2 items-end px-6 "
        >
          <Textarea
            className={"max-h-60 resize-none flex-1"}
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
            disabled={!text.trim()}
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center cursor-pointer"
          >
            <Send />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

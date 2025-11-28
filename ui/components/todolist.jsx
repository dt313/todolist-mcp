// components/todo-list.tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  const addTodo = () => {
    if (!text.trim()) return;
    setTodos([...todos, { text, done: false }]);
    setText("");
  };

  const toggleTodo = (index) => {
    const newTodos = [...todos];
    newTodos[index].done = !newTodos[index].done;
    setTodos(newTodos);
  };

  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle>Todo List</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {todos.length === 0 && (
            <p className="text-muted-foreground">Chưa có công việc nào…</p>
          )}

          {todos.map((todo, i) => (
            <div key={i} className="flex items-center gap-2">
              <Checkbox
                checked={todo.done}
                onCheckedChange={() => toggleTodo(i)}
              />
              <span className={todo.done ? "line-through opacity-60" : ""}>
                {todo.text}
              </span>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTodo();
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Thêm công việc…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <Button type="submit">Thêm</Button>
        </form>
      </CardContent>
    </Card>
  );
}

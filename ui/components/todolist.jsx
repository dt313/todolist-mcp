// components/todo-list.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TodoItem from "./todo-item";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useTodos } from "@/context/todo.context";
export default function TodoList() {
  const { todos, addTodo, updateTodo, deleteTodo } = useTodos();
  const [text, setText] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  const addTodoItem = async () => {
    if (!text.trim()) return;
    if (!selectedDate) return alert("Bạn chưa chọn ngày!");

    const newTodo = {
      title: text,
      date: selectedDate.toISOString(),
      done: false,
    };

    const res = await fetch("http://localhost:3000/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    });

    const saved = await res.json();

    addTodo(saved);
    setText("");
    setSelectedDate(null);
  };

  const toggleTodo = (id) => {
    const newTodos = [...todos];
    const index = newTodos.findIndex((t) => t.id === id);
    newTodos[index].done = !newTodos[index].done;

    console.log(newTodos[index]);

    fetch(`http://localhost:3000/todos/${newTodos[index].id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ done: newTodos[index].done }),
    });

    updateTodo(id, { done: newTodos[index].done });
  };

  const deleteTodoItem = (id) => {
    const newTodos = [...todos];

    fetch(`http://localhost:3000/todos/${id}`, {
      method: "DELETE",
    });

    deleteTodo(id);
  };

  const updateTodoItem = (id, title, date) => {
    const newTodos = [...todos];
    const index = newTodos.findIndex((t) => t.id === id);
    newTodos[index].title = title;
    newTodos[index].date = date || newTodos[index].date;

    fetch(`http://localhost:3000/todos/${newTodos[index].id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTodos[index]),
    });

    updateTodo(newTodos[index].id, newTodos[index]);
  };

  return (
    <Card className="w-full gap-0">
      <CardHeader className="border-b py-0 pb-4 [.border-b]:pb-4">
        <CardTitle>Todolist</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-0">
        <div className="space-y-2 max-h-100 overflow-y-auto px-6 py-6">
          {todos.length === 0 && (
            <p className="text-muted-foreground">Chưa có công việc nào…</p>
          )}

          {todos.map((todo, i) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={() => toggleTodo(todo.id)}
              onDelete={() => deleteTodoItem(todo.id)}
              onUpdate={(title, date) => updateTodoItem(todo.id, title, date)}
            />
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTodoItem();
          }}
          className="flex gap-2 px-6"
        >
          <Input
            placeholder="Thêm công việc…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 w-fit"
              >
                <CalendarIcon size={16} />
                {selectedDate
                  ? format(selectedDate, "dd/MM/yyyy")
                  : "Chọn ngày…"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
              />
            </PopoverContent>
          </Popover>

          <Button type="submit" disabled={!selectedDate || !text.trim()}>
            Thêm
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

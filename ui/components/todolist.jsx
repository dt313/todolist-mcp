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
export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchTodos = async () => {
      const res = await fetch("http://localhost:3000/todos");
      const data = await res.json();
      setTodos(data);
    };
    fetchTodos();
  }, []);
  const addTodo = async () => {
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

    setTodos([...todos, saved]);
    setText("");
    setSelectedDate(null);
  };

  const toggleTodo = (index) => {
    const newTodos = [...todos];
    newTodos[index].done = !newTodos[index].done;

    fetch(`http://localhost:3000/todos/${newTodos[index].id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTodos[index]),
    });

    setTodos(newTodos);
  };

  const deleteTodo = (index) => {
    const newTodos = [...todos];

    fetch(`http://localhost:3000/todos/${newTodos[index].id}`, {
      method: "DELETE",
    });

    newTodos.splice(index, 1);
    setTodos(newTodos);
  };

  const updateTodo = (index, title) => {
    const newTodos = [...todos];
    newTodos[index].title = title;

    fetch(`http://localhost:3000/todos/${newTodos[index].id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTodos[index]),
    });

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
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={() => toggleTodo(i)}
              onDelete={() => deleteTodo(i)}
              onUpdate={(title) => updateTodo(i, title)}
            />
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

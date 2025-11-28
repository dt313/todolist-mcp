"use client";

import { useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Check, X, CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(todo.title);
  const [date, setDate] = useState(new Date(todo.date));
  const inputRef = useRef(null);

  const saveEdit = () => {
    onUpdate(value, date.toISOString());
    setIsEditing(false);
  };
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isEditing) {
      const newDate = todo.date ? new Date(todo.date) : null;
      if (!date || newDate.getTime() !== date.getTime()) {
        setDate(newDate);
      }
    }
  }, [isEditing, todo.date]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsEditing(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClickEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="flex items-center gap-3">
      {!isEditing && (
        <Checkbox checked={todo.done} onCheckedChange={onToggle} />
      )}

      {!isEditing ? (
        <span
          className={todo.done ? "line-through opacity-60 flex-1" : "flex-1"}
        >
          {todo.title} – {format(new Date(todo.date), "dd/MM/yyyy")}
        </span>
      ) : (
        <form
          className="flex gap-2 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            saveEdit();
          }}
        >
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            ref={inputRef}
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-fit flex items-center gap-2"
              >
                <CalendarIcon size={16} />
                {format(date, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
              />
            </PopoverContent>
          </Popover>

          <Button size="icon" variant="ghost" type="submit">
            <Check size={16} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditing(false)}
          >
            <X size={16} />
          </Button>
        </form>
      )}

      {!isEditing && (
        <>
          <Button size="icon" variant="ghost" onClick={handleClickEdit}>
            <Pencil size={16} />
          </Button>
          <Button size="icon" variant="destructive" onClick={onDelete}>
            <Trash2 size={16} />
          </Button>
        </>
      )}
    </div>
  );
}

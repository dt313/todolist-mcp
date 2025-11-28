"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Tạo context
const TodoContext = createContext();

// Provider
export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);

  const addTodo = (todo) => {
    setTodos((prev) => [...prev, todo]);
  };

  const updateTodo = (id, updated) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
  };

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const fetchTodos = async () => {
      const res = await fetch("http://localhost:3000/todos");
      const data = await res.json();
      setTodos(data || []);
    };
    fetchTodos();
  }, []);

  return (
    <TodoContext.Provider
      value={{ todos, setTodos, addTodo, updateTodo, deleteTodo }}
    >
      {children}
    </TodoContext.Provider>
  );
};

// Hook tiện lợi
export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) throw new Error("useTodos must be used within a TodoProvider");
  return context;
};

import express from "express";
import path from "path";
import fs from "fs";
import { z } from "zod";
const PORT = 3000;
const DATA_FILE = path.resolve("data.json");

const app = express();
app.use(express.json());

const todoSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// GET tất cả todo
app.get("/todos", (req, res) => {
  const todos = readData();
  res.json(todos);
});

// GET todo theo id
app.get("/todos/:id", (req, res) => {
  const todos = readData();
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ error: "Todo not found" });
  res.json(todo);
});

app.post("/todos", (req, res) => {
  const parseResult = todoSchema.safeParse(req.body);
  if (!parseResult.success)
    return res.status(400).json({ error: parseResult.error.errors });

  const { title, date } = parseResult.data;
  const todos = readData();

  // Check duplicate
  const duplicate = todos.find((t) => t.title === title && t.date === date);
  if (duplicate) {
    return res
      .status(400)
      .json({ error: "Todo with same title and date already exists" });
  }

  const id = todos.length > 0 ? todos[todos.length - 1].id + 1 : 1;
  const newTodo = { id, title, date };

  todos.push(newTodo);
  writeData(todos);

  res.status(201).json(newTodo);
});

// PUT cập nhật todo
app.put("/todos/:id", (req, res) => {
  const todos = readData();
  const index = todos.findIndex((t) => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Todo not found" });

  const updateSchema = todoSchema.partial(); // cho phép update một phần
  const parseResult = updateSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ errors: parseResult.error.errors });
  }

  const updatedData = { ...todos[index], ...parseResult.data };

  // Check duplicate với các todo khác
  const duplicate = todos.find(
    (t) =>
      t.id !== updatedData.id &&
      t.title === updatedData.title &&
      t.date === updatedData.date
  );
  if (duplicate) {
    return res
      .status(400)
      .json({ error: "Todo with same title and date already exists" });
  }

  todos[index] = updatedData;
  writeData(todos);

  res.json(todos[index]);
});

// DELETE todo
app.delete("/todos/:id", (req, res) => {
  const todos = readData();
  const index = todos.findIndex((t) => t.id === parseInt(req.params.id));

  if (index === -1) return res.status(404).json({ error: "Todo not found" });

  const deleted = todos.splice(index, 1);
  writeData(todos);

  res.json(deleted[0]);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

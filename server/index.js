import express from "express";
import { z } from "zod";
import { Ollama } from "ollama";
import dotenv from "dotenv";
import cors from "cors";
import { toolsMap } from "./mcp.js";
import { readData, writeData } from "./file.js";
const PORT = 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
dotenv.config({ path: "./.env" });
const todoSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

const ollama = new Ollama({
  host: "https://ollama.com",
  headers: { Authorization: "Bearer " + process.env.OLLAMA_API_KEY },
});

const app = express();
app.use(cors());
app.use(express.json());

// System prompt để hướng dẫn LLM
const systemPrompt = `Bạn là AI assistant quản lý todo list.

QUAN TRỌNG: Nếu user yêu cầu NHIỀU hành động (thêm + cập nhật, xóa + thêm, etc.):
1. Thực hiện từng hành động TUẦN TỰ, mỗi lần 1 tool call
2. Sau khi nhận kết quả tool, tiếp tục gọi tool tiếp theo
3. Chỉ trả response cuối cùng khi ĐÃ HOÀN THÀNH TẤT CẢ hành động
4. Nếu có nhiều action thid đánh số thứ tự trong response để user dễ theo dõi

Tools có sẵn:
- get_todos: Lấy tất cả todo (show ,xem, lấy danh sách, etc.)
- add_todo: Thêm todo mới (cần title, date) (thêm, tạo, tạo mới)
- update_todo: Cập nhật todo (cần id, title?, date?) (cập nhật, sửa, chỉnh sửa)
- delete_todo: Xóa todo (cần id) (xóa, remove)
- complete_todo: Đánh dấu hoàn thành (cần id) (hoàn thành, done, complete)

Luôn map đúng intent sang tool.`;

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

// LLM Endpoint with Tool Calling
app.post("/ask", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    // Khởi tạo conversation history
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ];

    let continueLoop = true;
    let maxIterations = 5; // Giới hạn số lần loop để tránh vòng lặp vô hạn
    let iteration = 0;

    // Loop để xử lý multiple tool calls
    while (continueLoop && iteration < maxIterations) {
      iteration++;
      console.log(`\n=== Iteration ${iteration} ===`);

      // Gửi request đến LLM
      const response = await ollama.chat({
        model: "gpt-oss:120b",
        messages: messages,
        tools: Array.from(toolsMap.values()).map((tool) => ({
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
          },
        })),
        stream: false,
      });

      console.log("Tool calls:", response.message.tool_calls);

      // Thêm response của LLM vào history
      messages.push(response.message);

      // Kiểm tra xem LLM có gọi tool không
      if (
        response.message.tool_calls &&
        response.message.tool_calls.length > 0
      ) {
        // Thực hiện tất cả tool calls
        for (const toolCall of response.message.tool_calls) {
          const tool = toolsMap.get(toolCall.function.name);
          if (tool) {
            const args = toolCall.function.arguments;
            console.log(`Executing ${toolCall.function.name} with args:`, args);

            const result = await tool.execute(args);
            console.log(`Result:`, result);

            // Thêm kết quả tool vào history
            if (result.success === false && result.error) {
              // Thêm lỗi vào messages để LLM trả về user
              messages.push({
                role: "tool",
                content: `TOOL_ERROR: ${result.error}`,
                tool_call_id: toolCall.id,
              });
            } else {
              messages.push({
                role: "tool",
                content: JSON.stringify(result),
                tool_call_id: toolCall.id,
              });
            }
          }
        }
        // Tiếp tục loop để LLM có thể gọi thêm tool hoặc tạo response cuối cùng
        continueLoop = true;
      } else {
        // LLM không gọi tool nữa, kết thúc loop
        continueLoop = false;

        // Trả về response cuối cùng
        return res.json({
          answer: response.message.content,
          iterations: iteration,
        });
      }
    }

    // Nếu đạt max iterations, tạo response cuối cùng
    if (iteration >= maxIterations) {
      const finalResponse = await ollama.chat({
        model: "gpt-oss:120b",
        messages: messages,
        stream: false,
      });

      return res.json({
        answer: finalResponse.message.content,
        iterations: iteration,
        note: "Reached max iterations",
      });
    }
  } catch (err) {
    console.error("LLM Error:", err);
    res.status(500).json({ error: "LLM error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} in ${NODE_ENV} mode`);
});

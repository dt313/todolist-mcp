import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readData, writeData } from "./file.js";

let toolsMap = new Map();
const mcp = new McpServer({
  name: "todos-mcp-server",
  version: "1.0.0",
});

// Register MCP Tools và lưu vào Map
const getTodosConfig = {
  name: "get_todos",
  description: "Lấy tất cả todo từ database",
  inputSchema: {
    type: "object",
    properties: {},
  },
  execute: async () => {
    const todos = readData();
    return { todos };
  },
};

mcp.registerTool("get_todos", getTodosConfig);
toolsMap.set("get_todos", getTodosConfig);

const addTaskConfig = {
  name: "add_todo",
  description: "Thêm todo mới vào database",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Tiêu đề todo" },
      date: { type: "string", description: "Ngày thực hiện (YYYY-MM-DD)" },
    },
    required: ["title", "date"],
  },
  execute: async ({ title, date }) => {
    const todos = readData();
    // Check duplicate
    const duplicate = todos.find((t) => t.title === title && t.date === date);
    if (duplicate) {
      return {
        success: false,
        error: "Todo with same title and date already exists",
      };
    }
    const id = todos.length > 0 ? todos[todos.length - 1].id + 1 : 1;
    const newTodo = { id, title, date };
    todos.push(newTodo);
    writeData(todos);
    return { success: true, todo: newTodo };
  },
};

mcp.registerTool("add_todo", addTaskConfig);
toolsMap.set("add_todo", addTaskConfig);

const deleteTaskConfig = {
  name: "delete_todo",
  description: "Xóa todo theo id",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "number", description: "ID của todo cần xóa" },
    },
    required: ["id"],
  },
  execute: async ({ id }) => {
    const todos = readData();
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return { success: false, error: "Todo not found" };

    const deleted = todos.splice(index, 1);
    writeData(todos);
    return { success: true, deleted: deleted[0] };
  },
};

mcp.registerTool("delete_todo", deleteTaskConfig);
toolsMap.set("delete_todo", deleteTaskConfig);

const updateTodoConfig = {
  name: "update_todo",
  description: "Cập nhật thông tin todo",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "number", description: "ID của todo cần cập nhật" },
      title: {
        type: "string",
        description: "Tiêu đề mới (nếu không muốn thay đổi, bỏ trống)",
      },
      date: {
        type: "string",
        description: "Ngày mới (nếu không muốn thay đổi, bỏ trống)",
      },
    },
    required: ["id"],
  },
  execute: async ({ id, title, date }) => {
    const todos = readData();
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return { success: false, error: "Todo not found" };

    const duplicate = todos.find((t) => t.title === title && t.date === date);
    if (duplicate) {
      return {
        success: false,
        error: "Todo with same title and date already exists",
      };
    }
    todos[index] = {
      ...todos[index],
      title: title || todos[index].title,
      date: date || todos[index].date,
    };

    writeData(todos);
    return { success: true, todo: todos[index] };
  },
};

mcp.registerTool("update_todo", updateTodoConfig);
toolsMap.set("update_todo", updateTodoConfig);

export { mcp, toolsMap };

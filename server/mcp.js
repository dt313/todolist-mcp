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
    const newTodo = { id, title, date, done: false };
    todos.push(newTodo);
    writeData(todos);
    return { success: true, created: newTodo };
  },
};

mcp.registerTool("add_todo", addTaskConfig);
toolsMap.set("add_todo", addTaskConfig);

const addManyTodoConfig = {
  name: "add_many_todo",
  description: "Thêm nhiều todo vào database cùng lúc",
  inputSchema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        description: "Danh sách nhiều todo",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            date: { type: "string" },
          },
          required: ["title", "date"],
        },
      },
    },
    required: ["items"],
  },

  execute: async ({ items }) => {
    let todos = readData();

    const created = [];
    const skipped = [];

    for (const { title, date } of items) {
      // Check duplicate
      const duplicate = todos.find((t) => t.title === title && t.date === date);

      if (duplicate) {
        skipped.push({
          title,
          date,
          reason: "Duplicate title + date",
        });
        continue;
      }

      // Create ID
      const id = todos.length > 0 ? todos[todos.length - 1].id + 1 : 1;

      const newTodo = { id, title, date, done: false };
      todos.push(newTodo);
      created.push(newTodo);
    }

    // Save once
    writeData(todos);

    return {
      success: true,
      created,
      skipped,
      count_created: created.length,
      count_skipped: skipped.length,
    };
  },
};

mcp.registerTool("add_many_todo", addManyTodoConfig);
toolsMap.set("add_many_todo", addManyTodoConfig);

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
      done: {
        type: "boolean",
        description:
          "Trạng thái hoàn thành mới (nếu không muốn thay đổi, bỏ trống)",
      },
    },
    required: ["id"],
  },
  execute: async ({ id, title, date, done }) => {
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
      done: done !== undefined ? done : todos[index].done,
    };

    writeData(todos);
    return { success: true, updated: todos[index] };
  },
};

mcp.registerTool("update_todo", updateTodoConfig);
toolsMap.set("update_todo", updateTodoConfig);

const deleteManyTodoConfig = {
  name: "delete_many_todo",
  description: "Xóa nhiều todo theo danh sách ID",
  inputSchema: {
    type: "object",
    properties: {
      ids: {
        type: "array",
        items: { type: "number" },
        description: "Danh sách ID cần xóa",
      },
    },
    required: ["ids"],
  },

  execute: async ({ ids }) => {
    const todos = readData();

    // Lọc các todo bị xóa
    const deleted = todos.filter((t) => ids.includes(t.id));

    if (deleted.length === 0) {
      return {
        success: false,
        error: "Không tìm thấy todo nào để xóa",
      };
    }

    // Lọc lại danh sách todo sau khi xóa
    const updated = todos.filter((t) => !ids.includes(t.id));

    writeData(updated);

    return {
      success: true,
      deleted,
    };
  },
};

mcp.registerTool("delete_many_todo", deleteManyTodoConfig);
toolsMap.set("delete_many_todo", deleteManyTodoConfig);

export { mcp, toolsMap };

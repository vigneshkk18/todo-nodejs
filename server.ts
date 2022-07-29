import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import {
  createTodo,
  deleteTodo,
  getTodos,
  Todo,
  TodoPayload,
  updateTodo,
} from "./handlers";

const port = 3001;

const app = express();
app.use(bodyParser.json({ type: "application/json" }));
app.use(cors());

app.get("/todo", async (req, res) => {
  const result = await getTodos();
  res.send(result);
});

app.post("/todo", async (req, res) => {
  const todo = req.body as TodoPayload;
  await createTodo(todo);
  res.send("Todo created");
});

app.put("/todo", async (req, res) => {
  const todo = req.body as Todo;
  if (!todo || !todo.id) res.send("Todo Required!!");
  await updateTodo(todo, res);
  res.send("Todo updated");
});

app.delete("/todo/:todoId", async (req, res) => {
  const todoId = req.params.todoId;
  if (!todoId) res.send("Todo Id Required!!");
  await deleteTodo(todoId, res);
  res.send("Todo Deleted");
});

app.listen(port, () => {
  return console.log(`Server is running at http://localhost:${port}`);
});

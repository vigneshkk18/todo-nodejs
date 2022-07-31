import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";

import {
  createTodo,
  deleteTodo,
  clearCompletedTodos,
  getTodos,
  Todo,
  TodoPayload,
  updateTodos,
} from "./handlers";
import { CustomError } from "./Error";

const port = 3001;

const app = express();
app.use(bodyParser.json({ type: "application/json" }));
app.use(cors());

app.get("/todo", async (req, res, next) => {
  try {
    const result = await getTodos();
    res.status(200).send(result);
  } catch (error: any) {
    next(new CustomError(400, error.message, error.additionalMsg));
  }
});

app.post("/todo", async (req, res, next) => {
  try {
    const todo = req.body as TodoPayload;
    await createTodo(todo);
    res.send("Todo created");
  } catch (error: any) {
    next(new CustomError(400, error.message, error.additionalMsg));
  }
});

app.put("/todo", async (req, res, next) => {
  try {
    let todo = req.body as Todo[];
    if (!todo) throw new CustomError(400, "Todo Required!!");
    if (!(todo instanceof Array)) todo = [todo];
    await updateTodos(todo, res);
    res.send("Todo updated");
  } catch (error: any) {
    next(new CustomError(400, error.message, error.additionalMsg));
  }
});

app.delete("/todo", async (req, res, next) => {
  try {
    await clearCompletedTodos();
    res.send("Todos Deleted");
  } catch (error: any) {
    next(new CustomError(400, error.message, error.additionalMsg));
  }
});

app.delete("/todo/:todoId", async (req, res, next) => {
  try {
    const todoId = req.params.todoId;
    if (!todoId) throw new CustomError(400, "Todo Id Required!!");
    await deleteTodo(todoId, res);
    res.send("Todo Deleted");
  } catch (error: any) {
    next(new CustomError(400, error.message, error.additionalMsg));
  }
});

app.use((error: CustomError, _: Request, res: Response, next: NextFunction) => {
  console.error(error);
  res.send({ message: error.message, moreInfo: error.additionalMsg });
  next();
});

app.listen(port, () => {
  return console.log(`Server is running at http://localhost:${port}`);
});

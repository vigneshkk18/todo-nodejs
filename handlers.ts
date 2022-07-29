import { Response } from "express";
import { Client } from "pg";
import shortid from "shortid";

export interface TodoPayload {
  text: string;
  order: number;
  isCompleted?: boolean;
}

export interface Todo extends TodoPayload {
  id: string;
  isCompleted: boolean;
}

export const getTodos = async () => {
  const query = "SELECT * FROM todo";
  const res = await executeQuery(query);
  return res?.map((todo) => {
    return {
      id: todo.id,
      text: todo.text,
      order: +todo.order,
      isCompleted: todo.iscompleted,
    };
  });
};

export const getTodo = async (id: string) => {
  const selectQuery = `SELECT * FROM todo WHERE id='${id}'`;
  const todoRes = await executeQuery(selectQuery);
  return todoRes?.[0];
};

export const createTodo = async (todo: TodoPayload) => {
  const id = shortid.generate();
  const query = `INSERT INTO todo VALUES('${id}','${todo.text}',${todo.order},${
    todo.isCompleted ?? false
  })`;
  await executeQuery(query);
};

export const updateTodo = async (newTodo: Todo, res: Response) => {
  if (!getTodo(newTodo.id)) res.send("Todo doesn't exist");
  const updateQuery = `Update todo SET text = '${newTodo.text}', "order" = ${newTodo.order}, iscompleted = ${newTodo.isCompleted} WHERE id = '${newTodo.id}'`;
  await executeQuery(updateQuery);
};

export const deleteTodo = async (todoId: string, res: Response) => {
  if (!getTodo(todoId)) res.send("Todo doesn't exist");
  const deleteQuery = `DELETE FROM todo WHERE id = '${todoId}'`;
  await executeQuery(deleteQuery);
};

const executeQuery = async (query: string) => {
  const client = new Client({
    host: "localhost",
    user: "vignesh",
    password: "vignesh",
    database: "TODO",
    port: 5432,
  });
  try {
    await client.connect();
    const res = await client.query(query);
    await client.end();
    return res.rows;
  } catch (error) {
    console.error(error);
  }
};

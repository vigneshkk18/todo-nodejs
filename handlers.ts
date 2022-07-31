import { Response } from "express";
import { Client } from "pg";
import shortid from "shortid";
import { CustomError } from "./Error";

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

export const getTodosByIds = async (ids: string[]) => {
  const query = `SELECT * FROM todo where id in (${ids
    .map((id) => `'${id}'`)
    .join(", ")})`;
  return await executeQuery(query);
};

export const createTodo = async (todo: TodoPayload) => {
  const id = shortid.generate();
  const query = `INSERT INTO todo VALUES('${id}','${todo.text}',${todo.order},${
    todo.isCompleted ?? false
  })`;
  await executeQuery(query);
};

export const updateTodos = async (todos: Todo[], res: Response) => {
  const fetchedTodos = await getTodosByIds(todos.map((todo) => todo.id));
  if (!todos || !fetchedTodos || todos.length !== fetchedTodos.length) {
    throw new CustomError(400, "Some of the Todos doesn't Exist");
  }
  const updateQuery = `UPDATE todo as t set
      text = t2.text,
      "order" = t2.torder,
      iscompleted = t2.iscompleted
    from (values
      ${todos
        .map((todo) => {
          return `('${todo.id}','${todo.text}',${todo.order},${todo.isCompleted})`;
        })
        .join(", ")}
    ) as t2(id,text,torder,iscompleted)
    where t2.id = t.id;`;
  await executeQuery(updateQuery);
};

export const deleteTodo = async (todoId: string, res: Response) => {
  if (!getTodosByIds([todoId])) {
    throw new CustomError(400, "Todo doesn't exist");
  }
  const deleteQuery = `DELETE FROM todo WHERE id = '${todoId}'`;
  await executeQuery(deleteQuery);
};

export const clearCompletedTodos = async () => {
  const deleteQuery = "DELETE FROM todo WHERE iscompleted = true";
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
  } catch (error: any) {
    throw new CustomError(400, "Something Went wrong", error.message);
  }
};

export class CustomError extends Error {
  constructor(
    public statuscode: number,
    public message: string,
    public additionalMsg?: string
  ) {
    super();
  }
}

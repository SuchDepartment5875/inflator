import { Request, Response } from "express";
import { getDateOptions } from "./src/handlers/get-date-options/get-date-options";

const express = require("express");
const { calculateLambda } = require("./src/handlers/calculate/calculate");
const cors = require("cors");

const app = express();
const port = 3001;

app.use(
  cors({
    origin: "*",
  })
);

app.get("/calculate", async (req: Request, res: Response) => {
  const result = await calculateLambda({
    queryStringParameters: req.query,
  });

  res.send(result);
});

app.get("/get-date-options", async (req: Request, res: Response) => {
  const result = await getDateOptions();

  res.send(result);
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});

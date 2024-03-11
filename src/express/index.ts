import { Server } from "azle";
import express, { Request, Response } from "express";
import { sample_backend as api } from "../declarations/sample_backend/index";

export default Server(() => {
  const app = express();
  const port = 3000;

  app.get("/persons", async (req: Request, res: Response) => {
    const persons = await api.getPersons();
    return res.status(200).json({ persons });
  });

  return app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});

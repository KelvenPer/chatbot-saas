import { Router } from "express";
import { sseRegister, sseUnregister } from "./messages";

export const sseRouter = Router();

sseRouter.get("/stream", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  const send = (event: string, payload: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  sseRegister(send);

  req.on("close", () => {
    sseUnregister(send);
    res.end();
  });
});

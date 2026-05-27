import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

export function requiresAuth(req:Request, res:Response, next:NextFunction) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "unauthenticated" });
  }
 
  req.userId = userId;
  next();
}

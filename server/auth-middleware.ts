import { Request, Response, NextFunction } from "express";

export interface AuthenticatedUser {
  id: string;
  email: string;
  isAdmin: boolean;
  firstName: string;
  lastName: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  req.user = req.session.user;
  next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (!req.session.user.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  req.user = req.session.user;
  next();
};
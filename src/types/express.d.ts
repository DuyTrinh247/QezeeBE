// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        name?: string;
        email?: string;
      };
    }
  }
}

export {};
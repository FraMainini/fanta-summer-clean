import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertGroupSchema, 
  insertUserSchema, 
  insertChallengeSchema, 
  insertCompletionSchema,
  loginSchema 
} from "@shared/schema";
import session from "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    groupId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'fanta-summer-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Create group
  app.post("/api/groups", async (req, res) => {
    try {
      const groupData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(groupData);
      res.json(group);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Join group / Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, groupCode } = loginSchema.parse(req.body);
      
      const group = await storage.getGroupByInviteCode(groupCode);
      if (!group) {
        return res.status(404).json({ message: "Invalid group code" });
      }

      let user = await storage.getUserByUsernameAndGroup(username, group.id);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          username,
          password,
          groupId: group.id
        });
      } else {
        // Verify password
        if (user.password !== password) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
      }

      req.session.userId = user.id;
      req.session.groupId = group.id;
      
      res.json({ user, group });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      const group = await storage.getGroupById(req.session.groupId!);
      
      if (!user || !group) {
        return res.status(404).json({ message: "User or group not found" });
      }

      res.json({ user, group });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get challenges for current group
  app.get("/api/challenges", requireAuth, async (req, res) => {
    try {
      const challenges = await storage.getChallengesByGroup(req.session.groupId!);
      const userId = req.session.userId!;
      
      // Add completion status for each challenge
      const challengesWithStatus = await Promise.all(
        challenges.map(async (challenge) => {
          const isCompleted = await storage.isUserChallengeCompleted(userId, challenge.id);
          const completions = await storage.getCompletionsByChallenge(challenge.id);
          return {
            ...challenge,
            isCompleted,
            completedCount: completions.length
          };
        })
      );

      res.json(challengesWithStatus);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create challenge
  app.post("/api/challenges", requireAuth, async (req, res) => {
    try {
      const challengeData = insertChallengeSchema.parse({
        ...req.body,
        groupId: req.session.groupId!
      });
      
      const challenge = await storage.createChallenge(challengeData);
      res.json(challenge);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete challenge
  app.delete("/api/challenges/:id", requireAuth, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const challenge = await storage.getChallengeById(challengeId);
      
      if (!challenge || challenge.groupId !== req.session.groupId!) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      await storage.deleteChallenge(challengeId);
      res.json({ message: "Challenge deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Complete challenge
  app.post("/api/challenges/:id/complete", requireAuth, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      const challenge = await storage.getChallengeById(challengeId);
      if (!challenge || challenge.groupId !== req.session.groupId!) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      const isAlreadyCompleted = await storage.isUserChallengeCompleted(userId, challengeId);
      if (isAlreadyCompleted) {
        return res.status(400).json({ message: "Challenge already completed" });
      }

      // Create completion record
      await storage.createCompletion({
        userId,
        challengeId
      });

      // Update user points
      const user = await storage.getUserById(userId);
      const newPoints = user!.points + challenge.points;
      await storage.updateUserPoints(userId, newPoints);

      res.json({ message: "Challenge completed successfully", points: challenge.points });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", requireAuth, async (req, res) => {
    try {
      const users = await storage.getUsersByGroup(req.session.groupId!);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get group stats
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const groupId = req.session.groupId!;
      const challenges = await storage.getChallengesByGroup(groupId);
      const users = await storage.getUsersByGroup(groupId);
      
      const totalPoints = users.reduce((sum, user) => sum + user.points, 0);
      const averageScore = users.length > 0 ? Math.round(totalPoints / users.length) : 0;
      
      // Count today's completions (simplified - in real app would check actual dates)
      const allCompletions = await Promise.all(
        challenges.map(c => storage.getCompletionsByChallenge(c.id))
      );
      const completedToday = allCompletions.flat().length;

      res.json({
        totalChallenges: challenges.length,
        activeMembers: users.length,
        completedToday,
        averageScore,
        groupScore: totalPoints
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import { 
  groups, 
  users, 
  challenges, 
  userChallengeCompletions,
  type Group, 
  type User, 
  type Challenge, 
  type UserChallengeCompletion,
  type InsertGroup, 
  type InsertUser, 
  type InsertChallenge, 
  type InsertCompletion 
} from "@shared/schema";

export interface IStorage {
  // Groups
  createGroup(group: InsertGroup): Promise<Group>;
  getGroupByInviteCode(inviteCode: string): Promise<Group | undefined>;
  getGroupById(id: number): Promise<Group | undefined>;

  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsernameAndGroup(username: string, groupId: number): Promise<User | undefined>;
  updateUserPoints(userId: number, points: number): Promise<User>;
  getUsersByGroup(groupId: number): Promise<User[]>;

  // Challenges
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallengesByGroup(groupId: number): Promise<Challenge[]>;
  deleteChallenge(id: number): Promise<boolean>;
  getChallengeById(id: number): Promise<Challenge | undefined>;

  // Completions
  createCompletion(completion: InsertCompletion): Promise<UserChallengeCompletion>;
  getCompletionsByUser(userId: number): Promise<UserChallengeCompletion[]>;
  getCompletionsByChallenge(challengeId: number): Promise<UserChallengeCompletion[]>;
  isUserChallengeCompleted(userId: number, challengeId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private groups: Map<number, Group>;
  private users: Map<number, User>;
  private challenges: Map<number, Challenge>;
  private completions: Map<number, UserChallengeCompletion>;
  private currentGroupId: number;
  private currentUserId: number;
  private currentChallengeId: number;
  private currentCompletionId: number;

  constructor() {
    this.groups = new Map();
    this.users = new Map();
    this.challenges = new Map();
    this.completions = new Map();
    this.currentGroupId = 1;
    this.currentUserId = 1;
    this.currentChallengeId = 1;
    this.currentCompletionId = 1;
  }

  // Groups
  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const id = this.currentGroupId++;
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const group: Group = { ...insertGroup, id, inviteCode };
    this.groups.set(id, group);
    return group;
  }

  async getGroupByInviteCode(inviteCode: string): Promise<Group | undefined> {
    return Array.from(this.groups.values()).find(group => group.inviteCode === inviteCode);
  }

  async getGroupById(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  // Users
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, points: 0 };
    this.users.set(id, user);
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsernameAndGroup(username: string, groupId: number): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username === username && user.groupId === groupId
    );
  }

  async updateUserPoints(userId: number, points: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser: User = { ...user, points };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getUsersByGroup(groupId: number): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.groupId === groupId)
      .sort((a, b) => b.points - a.points);
  }

  // Challenges
  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = this.currentChallengeId++;
    const challenge: Challenge = { ...insertChallenge, id };
    this.challenges.set(id, challenge);
    return challenge;
  }

  async getChallengesByGroup(groupId: number): Promise<Challenge[]> {
    return Array.from(this.challenges.values()).filter(
      challenge => challenge.groupId === groupId
    );
  }

  async deleteChallenge(id: number): Promise<boolean> {
    return this.challenges.delete(id);
  }

  async getChallengeById(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }

  // Completions
  async createCompletion(insertCompletion: InsertCompletion): Promise<UserChallengeCompletion> {
    const id = this.currentCompletionId++;
    const completion: UserChallengeCompletion = { 
      ...insertCompletion, 
      id, 
      completedAt: new Date() 
    };
    this.completions.set(id, completion);
    return completion;
  }

  async getCompletionsByUser(userId: number): Promise<UserChallengeCompletion[]> {
    return Array.from(this.completions.values()).filter(
      completion => completion.userId === userId
    );
  }

  async getCompletionsByChallenge(challengeId: number): Promise<UserChallengeCompletion[]> {
    return Array.from(this.completions.values()).filter(
      completion => completion.challengeId === challengeId
    );
  }

  async isUserChallengeCompleted(userId: number, challengeId: number): Promise<boolean> {
    return Array.from(this.completions.values()).some(
      completion => completion.userId === userId && completion.challengeId === challengeId
    );
  }
}

export const storage = new MemStorage();

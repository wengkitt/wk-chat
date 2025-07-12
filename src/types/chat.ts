export interface DisplayChat {
  id: string; // Convex _id
  title: string;
  timestamp: Date; // Convex _creationTime is number, convert to Date
  model: string; // Convex modelUsed
}

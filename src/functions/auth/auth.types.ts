export interface AuthSession {
  _id: string;
  user: string;
  role: number;
  group: string;
  iat?: number;
  exp?: number;
  isOwner: boolean;
  isAdmin: boolean;
  isUser: boolean;
}

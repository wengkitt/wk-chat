export interface ApiKey {
  provider: string;
  name: string;
  key: string;
  isValid?: boolean;
  lastUsed?: Date;
}

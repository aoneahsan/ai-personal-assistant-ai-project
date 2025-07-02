import { UserSubscription } from './subscription';

export interface IPCAUser {
  id?: string;
  email?: string;
  name?: string;
  type?: string;
  subscription?: UserSubscription;
  createdAt?: Date;
  updatedAt?: Date;
}

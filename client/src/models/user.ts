import { Entity } from './entity';

export interface User {
  id: number;
  email: string;
  links: Entity[];
}
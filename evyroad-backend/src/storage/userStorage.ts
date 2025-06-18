// Simple in-memory user storage for development/testing
interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

class UserStorage {
  private users: User[] = [];
  private userIdCounter = 1;

  findByEmail(email: string): User | undefined {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  findById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  create(userData: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      id: this.userIdCounter.toString(),
      ...userData,
      email: userData.email.toLowerCase(),
      createdAt: new Date()
    };

    this.users.push(newUser);
    this.userIdCounter++;
    return newUser;
  }

  clear(): void {
    this.users = [];
    this.userIdCounter = 1;
  }

  count(): number {
    return this.users.length;
  }
}

// Export singleton instance
export const userStorage = new UserStorage();
export type { User };

import { Password } from '../api/auth/utils/password.ts';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes } from 'node:crypto';

const FIRST_NAMES = [
  'Lucas', 'Gabriel', 'Matheus', 'Pedro', 'Arthur',
  'Julia', 'Maria', 'Ana', 'Beatriz', 'Laura',
  'Rafael', 'Bruno', 'Carlos', 'Diego', 'Eduardo',
  'Fernanda', 'Gabriela', 'Helena', 'Isabela', 'Larissa',
  'Marcos', 'Nicolas', 'Otavio', 'Paulo', 'Ricardo',
  'Sofia', 'Thais', 'Valentina', 'Vitoria', 'Yasmin',
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues',
  'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
  'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida',
];

const DOMAINS = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePassword(): string {
  return randomBytes(8).toString('hex');
}

function generateUsername(firstName: string, lastName: string): string {
  const num = Math.floor(Math.random() * 999);
  return `${firstName.toLowerCase()}${lastName.toLowerCase()}${num}`;
}

function generateEmail(firstName: string, lastName: string): string {
  const num = Math.floor(Math.random() * 999);
  const domain = randomItem(DOMAINS);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${num}@${domain}`;
}

interface UserSeed {
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

function generateUsers(count: number): UserSeed[] {
  const users: UserSeed[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);

    users.push({
      name: `${firstName} ${lastName}`,
      username: generateUsername(firstName, lastName),
      email: generateEmail(firstName, lastName),
      password: generatePassword(),
      role: 'user',
    });
  }

  return users;
}

async function seedUsers() {
  const db = new DatabaseSync('./lms.sqlite');
  const passwordService = new Password('segredo');

  const users = generateUsers(30);

  console.log('🌱 Seeding 30 users...\n');
  console.log('─'.repeat(80));
  console.log(
    'Name'.padEnd(25) +
      'Email'.padEnd(35) +
      'Password'
  );
  console.log('─'.repeat(80));

  for (const user of users) {
    const passwordHash = await passwordService.hash(user.password);

    try {
      db.prepare(
        `INSERT INTO users (name, username, email, role, password_hash) VALUES (?, ?, ?, ?, ?)`
      ).run(user.name, user.username, user.email, user.role, passwordHash);

      console.log(
        user.name.padEnd(25) +
          user.email.padEnd(35) +
          user.password
      );
    } catch (error) {
      console.log(`⚠️  Skipped (duplicate): ${user.email}`);
    }
  }

  console.log('─'.repeat(80));
  console.log('\n✅ Seed completed!');

  const count = db.prepare('SELECT COUNT(*) as total FROM users').get() as { total: number };
  console.log(`📊 Total users in database: ${count.total}`);

  db.close();
}

seedUsers();

db = db.getSiblingDB('nexon-db');

// bcrypt를 사용하지 못하므로 미리 해시된 비밀번호를 사용
// 'password123!'의 해시값 (SALT_ROUNDS=10 사용)
const hashedPassword =
  '$2b$10$YfZ3oTjp2bb7/X6icpEpPur/t92KXPvHlWDPDp7LW8BK0J/IUah0S';

const adminExists = db.users.findOne({ email: 'admin@nexon.com' });

if (!adminExists) {
  db.users.insertOne({
    name: 'Admin',
    email: 'admin@nexon.com',
    password: hashedPassword,
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  print('Admin user created successfully');
} else {
  print('Admin user already exists');
}

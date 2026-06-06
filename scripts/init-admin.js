const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const password = process.argv[2] || 'admin123';

const hash = bcrypt.hashSync(password, 10);

const users = [
  {
    username: 'admin',
    passwordHash: hash,
    role: 'admin'
  }
];

const filePath = path.join(__dirname, '..', 'data', 'users.json');
fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
console.log(`管理员账号已创建: admin / ${password}`);
console.log('请妥善保管密码，运行后建议立即修改。');

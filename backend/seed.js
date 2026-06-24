require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Room = require('./models/Room');

async function seed() {
  console.log('\n🌱 DevRoom Database Seeder\n' + '─'.repeat(35));
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  await User.deleteMany({});
  await Room.deleteMany({});

  const users = await User.insertMany([
    { name:'Vijesh Dev',   email:'vijesh@devroom.com', password:'password123', bio:'Full Stack Developer', skills:['React','Node.js','MongoDB'], github:'https://github.com/vijesh' },
    { name:'Ayush Coder', email:'ayush@devroom.com',  password:'password123', bio:'Backend Engineer',     skills:['Python','Django','PostgreSQL'], github:'https://github.com/ayush' },
    { name:'Priya JS',    email:'priya@devroom.com',  password:'password123', bio:'Frontend Developer',   skills:['React','TypeScript','CSS'], github:'https://github.com/priya' },
  ]);

  // Hash passwords
  for (const u of users) {
    const bcrypt = require('bcryptjs');
    u.password = await bcrypt.hash('password123', 12);
    await u.save();
  }

  console.log(`👥 Created ${users.length} users`);

  const rooms = await Room.insertMany([
    { title:'JavaScript Practice', language:'javascript', owner:users[0]._id, participants:[users[0]._id, users[1]._id], isPrivate:false, tags:['javascript','practice'],
      code:'// Two Sum Problem\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]' },
    { title:'Python DSA Session', language:'python', owner:users[1]._id, participants:[users[1]._id], isPrivate:false, tags:['python','dsa'],
      code:'# Binary Search\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\nprint(binary_search([1,3,5,7,9,11], 7))  # 3' },
    { title:'React Interview Prep', language:'javascript', owner:users[2]._id, participants:[users[2]._id, users[0]._id], isPrivate:false, tags:['react','interview'],
      code:'// Implement useDebounce hook\nimport { useState, useEffect } from "react";\n\nfunction useDebounce(value, delay) {\n  const [debounced, setDebounced] = useState(value);\n  \n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  \n  return debounced;\n}' },
    { title:'Private Java Room', language:'java', owner:users[0]._id, participants:[users[0]._id], isPrivate:true, password:'1234', tags:['java'],
      code:'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello DevRoom!");\n    }\n}' },
  ]);

  console.log(`🏠 Created ${rooms.length} rooms`);
  console.log('\n' + '─'.repeat(35));
  console.log('✅ Database seeded!\n');
  console.log('  LOGIN CREDENTIALS (password: password123)');
  console.log('  ┌─────────────────────────────────────┐');
  console.log('  │  vijesh@devroom.com                 │');
  console.log('  │  ayush@devroom.com                  │');
  console.log('  │  priya@devroom.com                  │');
  console.log('  └─────────────────────────────────────┘\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });

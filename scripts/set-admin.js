const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Define minimal schema to avoid loading the full app
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isAdmin: Boolean,
  status: String,
  category: String,
  isProfileComplete: Boolean,
  auth_provider: String,
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function setAdmin() {
  const uri = "mongodb+srv://saumitrakulkarni:Saususket%401222@cluster0.mrdlh.mongodb.net/Sthapati4z";
  
  try {
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const email = 'saumitrakulkarni4823@gmail.com';
    const password = 'sthapati@2025';
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          password: hashedPassword,
          isAdmin: true,
          status: 'active',
          isProfileComplete: true,
        },
        $setOnInsert: {
          name: 'Admin User',
          category: 'Architect',
          auth_provider: 'email'
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('Admin user updated:', result.email, 'Is Admin:', result.isAdmin);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

setAdmin();

import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ResetRequest from '../models/ResetRequest.js';

const router = express.Router();

// Memory store for reset requests if MongoDB is offline
let memoryResetRequests = [];

// Memory store for users if MongoDB is offline
let memoryUsers = [
  {
    name: 'System Admin',
    username: 'admin',
    email: 'admin@quiznova.com',
    password: bcrypt.hashSync('adminpassword', 10),
    mobileNumber: '9999999999',
    year: 'Graduated',
    role: 'admin'
  }
];

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password, mobileNumber, year } = req.body;

    if (!name || !username || !email || !password || !mobileNumber || !year) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Regex Validations
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    const mobileRegex = /^[0-9]{10}$/;

    if (!nameRegex.test(name.trim())) {
      return res.status(400).json({ success: false, message: "Full Name must contain only letters and spaces (2-50 chars)." });
    }
    if (!usernameRegex.test(cleanUsername)) {
      return res.status(400).json({ success: false, message: "Username must start with a letter, contain alphanumeric/underscores, and be 3-20 chars." });
    }
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters, containing at least one letter and one number." });
    }
    if (!mobileRegex.test(mobileNumber.trim())) {
      return res.status(400).json({ success: false, message: "Mobile Number must be exactly 10 digits." });
    }
    
    // Assign admin role if email is admin@quiznova.com or admin@quizcraft.com
    const role = (cleanEmail === 'admin@quiznova.com' || cleanEmail === 'admin@quizcraft.com') ? 'admin' : 'user';

    if (User.db && User.db.readyState === 1) {
      const existingUser = await User.findOne({ 
        $or: [
          { username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') } },
          { email: cleanEmail }
        ]
      });

      if (existingUser) {
        return res.status(400).json({ success: false, message: "Username or Email already registered." });
      }

      const newUser = await User.create({ 
        name: name.trim(), 
        username: cleanUsername, 
        email: cleanEmail, 
        password, 
        mobileNumber: mobileNumber.trim(), 
        year: year.trim(),
        role 
      });

      return res.status(201).json({ 
        success: true, 
        data: { name: newUser.name, username: newUser.username, email: newUser.email, mobileNumber: newUser.mobileNumber, year: newUser.year, profilePhoto: newUser.profilePhoto || '', role: newUser.role } 
      });
    } else {
      const existingUser = memoryUsers.find(u => 
        u.username.toLowerCase() === cleanUsername.toLowerCase() || 
        u.email.toLowerCase() === cleanEmail
      );

      if (existingUser) {
        return res.status(400).json({ success: false, message: "Username or Email already registered." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = { 
        name: name.trim(), 
        username: cleanUsername, 
        email: cleanEmail, 
        password: hashedPassword, 
        mobileNumber: mobileNumber.trim(), 
        year: year.trim(), 
        role 
      };

      memoryUsers.push(newUser);
      return res.status(201).json({ 
        success: true, 
        data: { name: newUser.name, username: newUser.username, email: newUser.email, mobileNumber: newUser.mobileNumber, year: newUser.year, profilePhoto: newUser.profilePhoto || '', role: newUser.role } 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ success: false, message: "Please provide username/email and password." });
    }

    const cleanInput = usernameOrEmail.trim();

    if (User.db && User.db.readyState === 1) {
      const user = await User.findOne({
        $or: [
          { username: cleanInput },
          { email: cleanInput.toLowerCase() }
        ]
      });

      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid credentials." });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid credentials." });
      }

      return res.json({ 
        success: true, 
        data: { name: user.name, username: user.username, email: user.email, mobileNumber: user.mobileNumber, year: user.year, profilePhoto: user.profilePhoto || '', role: user.role } 
      });
    } else {
      const user = memoryUsers.find(u => 
        u.username === cleanInput || u.email === cleanInput.toLowerCase()
      );

      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid credentials." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid credentials." });
      }

      return res.json({ 
        success: true, 
        data: { name: user.name, username: user.username, email: user.email, mobileNumber: user.mobileNumber, year: user.year, profilePhoto: user.profilePhoto || '', role: user.role } 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/forgot-password - Student Forgot Password submission
router.post('/forgot-password', async (req, res) => {
  try {
    const { usernameOrEmail } = req.body;
    if (!usernameOrEmail) {
      return res.status(400).json({ success: false, message: "Please provide your username or email." });
    }

    const cleanInput = usernameOrEmail.trim();

    if (User.db && User.db.readyState === 1) {
      const user = await User.findOne({
        $or: [
          { username: cleanInput },
          { email: cleanInput.toLowerCase() }
        ]
      });

      if (!user) {
        return res.status(400).json({ success: false, message: "No registered user found with this username or email." });
      }

      // Check if a request already exists
      const existing = await ResetRequest.findOne({ username: user.username, resolved: false });
      if (!existing) {
        await ResetRequest.create({
          username: user.username,
          email: user.email,
          fullName: user.name,
          resolved: false
        });
      }
    } else {
      const user = memoryUsers.find(u => 
        u.username === cleanInput || u.email === cleanInput.toLowerCase()
      );

      if (!user) {
        return res.status(400).json({ success: false, message: "No registered user found with this username or email." });
      }

      const existing = memoryResetRequests.find(r => r.username === user.username && !r.resolved);
      if (!existing) {
        memoryResetRequests.push({
          _id: `mem_rr_${Date.now()}`,
          username: user.username,
          email: user.email,
          fullName: user.name,
          resolved: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    res.json({ success: true, message: "Password reset request submitted successfully. Please ask your Admin to override your password." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/reset-requests - Get all unresolved reset requests (Admin only)
router.get('/reset-requests', async (req, res) => {
  try {
    let requests;
    if (ResetRequest.db && ResetRequest.db.readyState === 1) {
      requests = await ResetRequest.find({ resolved: false }).sort({ createdAt: 1 });
    } else {
      requests = memoryResetRequests.filter(r => !r.resolved);
    }
    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/reset-password-admin - Admin Password Override for a user
router.post('/reset-password-admin', async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) {
      return res.status(400).json({ success: false, message: "Username and new password are required." });
    }

    const cleanUser = username.trim();

    if (User.db && User.db.readyState === 1) {
      const user = await User.findOne({ username: cleanUser });
      if (!user) return res.status(404).json({ success: false, message: "User not found." });

      user.password = newPassword;
      await user.save(); // pre-save hook will hash it automatically

      // Mark request as resolved
      await ResetRequest.updateMany({ username: cleanUser }, { $set: { resolved: true } });
    } else {
      const userIdx = memoryUsers.findIndex(u => u.username === cleanUser);
      if (userIdx === -1) return res.status(404).json({ success: false, message: "User not found." });

      const salt = await bcrypt.genSalt(10);
      memoryUsers[userIdx].password = await bcrypt.hash(newPassword, salt);

      // Mark request as resolved
      memoryResetRequests = memoryResetRequests.map(r => r.username === cleanUser ? { ...r, resolved: true } : r);
    }

    res.json({ success: true, message: `Password for @${cleanUser} overridden and reset request resolved.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/auth/profile - Edit user profile (Student/Admin)
router.put('/profile', async (req, res) => {
  try {
    const { username, name, mobileNumber, year, profilePhoto, password } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: "Username is required to identify the user." });
    }

    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    const mobileRegex = /^[0-9]{10}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;

    if (name && !nameRegex.test(name.trim())) {
      return res.status(400).json({ success: false, message: "Full Name must contain only letters and spaces (2-50 chars)." });
    }
    if (mobileNumber && !mobileRegex.test(mobileNumber.trim())) {
      return res.status(400).json({ success: false, message: "Mobile Number must be exactly 10 digits." });
    }
    if (password && !passwordRegex.test(password)) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters, containing at least one letter and one number." });
    }

    if (User.db && User.db.readyState === 1) {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      if (name) user.name = name.trim();
      if (mobileNumber) user.mobileNumber = mobileNumber.trim();
      if (year) user.year = year.trim();
      if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
      if (password) {
        user.password = password; // pre-save hook hashes it automatically
      }

      await user.save();

      return res.json({
        success: true,
        message: "Profile updated successfully.",
        data: {
          name: user.name,
          username: user.username,
          email: user.email,
          mobileNumber: user.mobileNumber,
          year: user.year,
          profilePhoto: user.profilePhoto || '',
          role: user.role
        }
      });
    } else {
      // In-memory fallback
      const userIdx = memoryUsers.findIndex(u => u.username === username);
      if (userIdx === -1) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      const user = memoryUsers[userIdx];
      if (name) user.name = name.trim();
      if (mobileNumber) user.mobileNumber = mobileNumber.trim();
      if (year) user.year = year.trim();
      if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      return res.json({
        success: true,
        message: "Profile updated successfully.",
        data: {
          name: user.name,
          username: user.username,
          email: user.email,
          mobileNumber: user.mobileNumber,
          year: user.year,
          profilePhoto: user.profilePhoto || '',
          role: user.role
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

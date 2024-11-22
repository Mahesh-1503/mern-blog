const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');
const app = express();

// Secret key for JWT
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

// Middleware setup
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use('/uploads', express.static(__dirname + '/uploads'));

const salt = bcrypt.genSaltSync(10);

// MongoDB connection with better error handling
mongoose.connect('mongodb+srv://akumar195922:iuV0jBixm9yHzpsD@cluster0.8vtve.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('Connected to MongoDB');
  // Start server only after successful DB connection
  app.listen(4000, () => {
    console.log('Server is running on port 4000');
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);  // Exit if cannot connect to database
});

// Add error handling middleware at the top
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Add connection error handler
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during app termination:', err);
    process.exit(1);
  }
});

// Register endpoint
app.post('/register', async (req, res) => {
  const {username, password} = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, salt);
    const UserDoc = await User.create({
      username,
      password: hashedPassword,
    });
    jwt.sign({username, id:UserDoc._id}, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id: UserDoc._id,
        username,
      });
    });
  } catch(e) {
    res.status(400).json(e);
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const {username, password} = req.body;
  try {
    const userDoc = await User.findOne({username});
    if (!userDoc) {
      return res.status(400).json({ error: 'User not found' });
    }

    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      // Create token and set cookie
      jwt.sign(
        { username, id: userDoc._id }, 
        secret, 
        { expiresIn: '24h' }, // Add token expiration
        (err, token) => {
          if (err) {
            console.error('JWT Sign error:', err);
            return res.status(500).json({ error: 'Error creating token' });
          }
          
          // Set cookie with proper options
          res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
          }).json({
            id: userDoc._id,
            username,
          });
        }
      );
    } else {
      res.status(400).json({ error: 'Wrong password' });
    }
  } catch(e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Profile endpoint
app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.json(info);
  });
});

// Logout endpoint
app.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/'
  }).json({ message: 'Logged out successfully' });
});

// Create post endpoint
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {originalname, path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path+'.'+ext;
    fs.renameSync(path, newPath);

    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, secret, {}, (err, info) => {
        if (err) reject(err);
        resolve(info);
      });
    });

    const {title, summary, content} = req.body;
    if (!title || !summary || !content) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: decoded.id,
    });

    res.json(postDoc);
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ error: 'Error creating post' });
  }
});

// Move search endpoint BEFORE the specific post routes
app.get('/post/search', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json([]);
  }
  try {
    const searchResults = await Post.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ]
    })
    .populate('author', ['username'])
    .sort({ createdAt: -1 });
    
    res.json(searchResults);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Error performing search' });
  }
});

// Then have the get all posts endpoint
app.get('/post', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

// Then have the specific post endpoint
app.get('/post/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    if (!postDoc) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(postDoc);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching post' });
  }
});

// Update post endpoint
app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  }

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {id,title,summary,content} = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json('you are not the author');
    }
    await postDoc.updateOne({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });
    res.json(postDoc);
  });
});

// Add delete post endpoint
app.delete('/post/:id', async (req, res) => {
  const { token } = req.cookies;
  const { id } = req.params;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Verify user token
    const userInfo = await new Promise((resolve, reject) => {
      jwt.verify(token, secret, {}, (err, info) => {
        if (err) reject(err);
        resolve(info);
      });
    });

    // Find the post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author
    const isAuthor = JSON.stringify(post.author) === JSON.stringify(userInfo.id);
    if (!isAuthor) {
      return res.status(403).json({ error: 'You are not authorized to delete this post' });
    }

    // Delete the post's image if it exists
    if (post.cover) {
      try {
        fs.unlinkSync(__dirname + '/' + post.cover);
      } catch (err) {
        console.error('Error deleting image file:', err);
      }
    }

    // Delete the post
    await Post.findByIdAndDelete(id);
    res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Error deleting post' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

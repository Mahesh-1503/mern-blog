mongoose.connect(process.env.MONGODB_URI || 'your_mongodb_connection_string')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err)); 
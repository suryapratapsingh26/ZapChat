import mongoose from 'mongoose';

const DB_CONNECTION = 'mongodb+srv://suryapratap841239:T0bUuICRebg3jEaP@cluster0.2wru0.mongodb.net/chat_db?retryWrites=true&w=majority&appName=Cluster0';

const cleanup = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(DB_CONNECTION);
    console.log('✅ Connected to database successfully');
    
    // Access the users collection directly
    const usersCollection = mongoose.connection.db.collection('users');
    
    // Show current user count
    const userCountBefore = await usersCollection.countDocuments();
    console.log(`📊 Current users in database: ${userCountBefore}`);
    
    // Delete all users
    const result = await usersCollection.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} users`);
    
    // Verify deletion
    const userCountAfter = await usersCollection.countDocuments();
    console.log(`📊 Users remaining: ${userCountAfter}`);
    
    console.log('✅ Cleanup completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
};

cleanup();
const mongoose = require('mongoose');

// This script should be run from the root of the Taru_demo project
// Make sure you have a .env file with MONGODB_URI or have it set in your environment
require('dotenv').config({ path: './.env.local' });

// Define Schema for LearningPath
const ModuleSchema = new mongoose.Schema({
  moduleId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  xpValue: { type: Number, required: true, default: 20 },
});

const LearningPathSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  interest: { type: String, required: true, index: true },
  modules: [ModuleSchema],
});

const LearningPath = mongoose.models.LearningPath || mongoose.model('LearningPath', LearningPathSchema);

// Dummy Data
const learningPaths = [
  {
    title: 'Introduction to Web Development',
    description: 'Learn the basics of building websites and web applications.',
    interest: 'Technology',
    modules: [
      { moduleId: 'tech-101', title: 'HTML Basics', description: 'Learn the structure of web pages.', xpValue: 20 },
      { moduleId: 'tech-102', title: 'CSS Fundamentals', description: 'Style your web pages.', xpValue: 25 },
      { moduleId: 'tech-103', title: 'JavaScript Essentials', description: 'Add interactivity to your sites.', xpValue: 30 },
      { moduleId: 'tech-104', title: 'Intro to React', description: 'Build powerful user interfaces.', xpValue: 40 },
    ],
  },
  {
    title: 'Fundamentals of Digital Art',
    description: 'Explore the world of digital creativity and design.',
    interest: 'Art',
    modules: [
        { moduleId: 'art-101', title: 'Intro to Digital Painting', description: 'Learn digital brushes and layers.', xpValue: 20 },
        { moduleId: 'art-102', title: 'Color Theory for Artists', description: 'Understand how colors work together.', xpValue: 25 },
        { moduleId: 'art-103', title: 'Character Design Basics', description: 'Create your own unique characters.', xpValue: 30 },
    ]
  },
  {
    title: 'The World of Science',
    description: 'Discover the wonders of biology, chemistry, and physics.',
    interest: 'Science',
    modules: [
        { moduleId: 'sci-101', title: 'Biology: The Cell', description: 'The basic building block of life.', xpValue: 20 },
        { moduleId: 'sci-102', title: 'Chemistry: The Atom', description: 'Understanding matter at its core.', xpValue: 25 },
        { moduleId: 'sci-103', title: 'Physics: Forces and Motion', description: 'How the universe moves.', xpValue: 30 },
    ]
  },
  {
    title: 'Exploring Mathematics',
    description: 'Journey through the most important concepts in mathematics.',
    interest: 'Mathematics',
    modules: [
        { moduleId: 'math-101', title: 'Algebra Fundamentals', description: 'The language of symbols.', xpValue: 20 },
        { moduleId: 'math-102', title: 'Geometry and Shapes', description: 'Understanding space and form.', xpValue: 25 },
        { moduleId: 'math-103', title: 'Introduction to Calculus', description: 'The study of change.', xpValue: 35 },
    ]
  }
];

async function seedDB() {
  const MONGO_URI = process.env.MONGODB_URI;
  if (!MONGO_URI) {
    console.error('Error: MONGODB_URI is not defined in your environment variables.');
    process.exit(1);
  }
  
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Database connected. Seeding learning paths...');

    await LearningPath.deleteMany({});
    console.log('Cleared existing learning paths.');

    await LearningPath.insertMany(learningPaths);
    console.log('Database seeded with new learning paths!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seedDB(); 
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Learning Path Schema
const moduleSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  duration: Number,
  difficulty: String,
  xpReward: Number,
  isCompleted: Boolean
});

const learningPathSchema = new mongoose.Schema({
  interest: String,
  title: String,
  description: String,
  modules: [moduleSchema],
  totalDuration: Number,
  totalXP: Number,
  difficulty: String,
  isActive: Boolean
});

const LearningPath = mongoose.model('LearningPath', learningPathSchema);

const learningPaths = [
  {
    interest: 'programming',
    title: 'Python for Beginners',
    description: 'Learn the fundamentals of Python programming with hands-on projects and real-world applications.',
    difficulty: 'Beginner',
    isActive: true,
    modules: [
      {
        id: 'py-001',
        title: 'Introduction to Python',
        description: 'Learn what Python is and why it\'s popular',
        duration: 30,
        difficulty: 'Beginner',
        xpReward: 10,
        isCompleted: false
      },
      {
        id: 'py-002',
        title: 'Variables and Data Types',
        description: 'Understand how to store and manipulate data',
        duration: 45,
        difficulty: 'Beginner',
        xpReward: 15,
        isCompleted: false
      },
      {
        id: 'py-003',
        title: 'Control Flow',
        description: 'Learn about loops and conditional statements',
        duration: 60,
        difficulty: 'Beginner',
        xpReward: 20,
        isCompleted: false
      },
      {
        id: 'py-004',
        title: 'Functions',
        description: 'Create reusable code with functions',
        duration: 45,
        difficulty: 'Beginner',
        xpReward: 15,
        isCompleted: false
      },
      {
        id: 'py-005',
        title: 'Mini Project: Calculator',
        description: 'Build a simple calculator using your Python skills',
        duration: 90,
        difficulty: 'Beginner',
        xpReward: 25,
        isCompleted: false
      }
    ]
  },
  {
    interest: 'mathematics',
    title: 'Algebra Fundamentals',
    description: 'Master the basics of algebra with interactive lessons and practice problems.',
    difficulty: 'Beginner',
    isActive: true,
    modules: [
      {
        id: 'alg-001',
        title: 'Introduction to Variables',
        description: 'Learn how to work with unknown values',
        duration: 40,
        difficulty: 'Beginner',
        xpReward: 12,
        isCompleted: false
      },
      {
        id: 'alg-002',
        title: 'Solving Linear Equations',
        description: 'Find the value of variables in equations',
        duration: 50,
        difficulty: 'Beginner',
        xpReward: 15,
        isCompleted: false
      },
      {
        id: 'alg-003',
        title: 'Graphing Linear Functions',
        description: 'Visualize mathematical relationships',
        duration: 55,
        difficulty: 'Beginner',
        xpReward: 18,
        isCompleted: false
      },
      {
        id: 'alg-004',
        title: 'Systems of Equations',
        description: 'Solve multiple equations simultaneously',
        duration: 70,
        difficulty: 'Intermediate',
        xpReward: 20,
        isCompleted: false
      }
    ]
  },
  {
    interest: 'science',
    title: 'Physics Basics',
    description: 'Explore the fundamental principles of physics through experiments and simulations.',
    difficulty: 'Beginner',
    isActive: true,
    modules: [
      {
        id: 'phy-001',
        title: 'Motion and Forces',
        description: 'Understand how objects move and interact',
        duration: 45,
        difficulty: 'Beginner',
        xpReward: 12,
        isCompleted: false
      },
      {
        id: 'phy-002',
        title: 'Energy and Work',
        description: 'Learn about different forms of energy',
        duration: 50,
        difficulty: 'Beginner',
        xpReward: 15,
        isCompleted: false
      },
      {
        id: 'phy-003',
        title: 'Waves and Sound',
        description: 'Explore wave phenomena and sound',
        duration: 60,
        difficulty: 'Beginner',
        xpReward: 18,
        isCompleted: false
      },
      {
        id: 'phy-004',
        title: 'Electricity and Magnetism',
        description: 'Discover electrical and magnetic forces',
        duration: 75,
        difficulty: 'Intermediate',
        xpReward: 20,
        isCompleted: false
      }
    ]
  },
  {
    interest: 'art',
    title: 'Digital Art Fundamentals',
    description: 'Learn digital drawing and design principles with modern tools.',
    difficulty: 'Beginner',
    isActive: true,
    modules: [
      {
        id: 'art-001',
        title: 'Digital Drawing Basics',
        description: 'Get familiar with digital art tools',
        duration: 40,
        difficulty: 'Beginner',
        xpReward: 10,
        isCompleted: false
      },
      {
        id: 'art-002',
        title: 'Color Theory',
        description: 'Understand how colors work together',
        duration: 35,
        difficulty: 'Beginner',
        xpReward: 12,
        isCompleted: false
      },
      {
        id: 'art-003',
        title: 'Composition Principles',
        description: 'Learn how to arrange elements effectively',
        duration: 45,
        difficulty: 'Beginner',
        xpReward: 15,
        isCompleted: false
      },
      {
        id: 'art-004',
        title: 'Character Design',
        description: 'Create memorable characters',
        duration: 60,
        difficulty: 'Intermediate',
        xpReward: 18,
        isCompleted: false
      }
    ]
  },
  {
    interest: 'music',
    title: 'Music Theory for Beginners',
    description: 'Learn to read music, understand rhythm, and compose simple melodies.',
    difficulty: 'Beginner',
    isActive: true,
    modules: [
      {
        id: 'mus-001',
        title: 'Reading Sheet Music',
        description: 'Learn to read musical notation',
        duration: 50,
        difficulty: 'Beginner',
        xpReward: 12,
        isCompleted: false
      },
      {
        id: 'mus-002',
        title: 'Rhythm and Timing',
        description: 'Master musical timing and rhythm',
        duration: 40,
        difficulty: 'Beginner',
        xpReward: 10,
        isCompleted: false
      },
      {
        id: 'mus-003',
        title: 'Scales and Chords',
        description: 'Understand musical scales and chord progressions',
        duration: 55,
        difficulty: 'Beginner',
        xpReward: 15,
        isCompleted: false
      },
      {
        id: 'mus-004',
        title: 'Composition Basics',
        description: 'Create your own simple melodies',
        duration: 70,
        difficulty: 'Intermediate',
        xpReward: 18,
        isCompleted: false
      }
    ]
  }
];

// Calculate total duration and XP for each path
learningPaths.forEach(path => {
  path.totalDuration = path.modules.reduce((sum, module) => sum + module.duration, 0);
  path.totalXP = path.modules.reduce((sum, module) => sum + module.xpReward, 0);
});

async function seedLearningPaths() {
  try {
    // Clear existing learning paths
    await LearningPath.deleteMany({});
    console.log('Cleared existing learning paths');

    // Insert new learning paths
    const result = await LearningPath.insertMany(learningPaths);
    console.log(`Successfully seeded ${result.length} learning paths`);

    // Display the seeded paths
    result.forEach(path => {
      console.log(`- ${path.title} (${path.interest}): ${path.modules.length} modules, ${path.totalDuration}min, ${path.totalXP} XP`);
    });

  } catch (error) {
    console.error('Error seeding learning paths:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedLearningPaths(); 
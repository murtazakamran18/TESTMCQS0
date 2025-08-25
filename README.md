# MCQ Quiz Web App

A comprehensive Multiple Choice Questions (MCQ) quiz web application with separate interfaces for Teachers and Students. Built with HTML, CSS, JavaScript frontend and Node.js serverless backend deployed on Vercel with MongoDB Atlas database.

## 🎯 Features

### For Teachers
- Secure password-based authentication
- Add new questions with 4 options and correct answer selection
- Edit existing questions
- Delete questions with confirmation
- View all questions in a clean, organized interface
- Responsive design for all devices

### For Students
- Secure password-based authentication
- Take randomized quizzes
- Navigate between questions (Previous/Next)
- Automatic score calculation and percentage display
- Review correct/incorrect answers after quiz completion
- Retake quiz option
- Save results to database

### Technical Features
- **Frontend**: Pure HTML, CSS, JavaScript (no frameworks)
- **Backend**: Node.js serverless functions (Vercel)
- **Database**: MongoDB Atlas
- **Authentication**: Password-based with secure headers
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean cards, smooth animations, professional styling

## 🚀 Live Demo

[Add your Vercel deployment URL here]

**Demo Credentials:**
- Teacher Password: `teacher123`
- Student Password: `student123`

## 📋 Prerequisites

Before setting up the project, ensure you have:

1. **Node.js** (version 16 or higher)
2. **MongoDB Atlas Account** (free tier works)
3. **Vercel Account** (for deployment)
4. **Git** (for version control)

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mcq-quiz-app
npm install
```

### 2. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (free tier M0)

2. **Database Setup**
   - Create a new database named `quizapp`
   - Create two collections:
     - `questions` - stores quiz questions
     - `results` - stores student results

3. **Get Connection String**
   - In Atlas, go to "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<cluster>` with your details

4. **Network Access**
   - In Atlas, go to "Network Access"
   - Add IP Address: `0.0.0.0/0` (for Vercel deployment)
   - Or add your specific IP for local development

### 3. Environment Variables

1. **Create `.env.local` file** in the project root:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=quizapp
TEACHER_PASS=your_secure_teacher_password
STUDENT_PASS=your_secure_student_password
```

2. **Important**: Replace the default passwords with secure ones!

### 4. Local Development

```bash
# Install Vercel CLI
npm install -g vercel

# Start development server
vercel dev
```

The application will be available at `http://localhost:3000`

### 5. Deployment to Vercel

#### Option 1: Deploy with Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option 2: Deploy via GitHub

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Configure Environment Variables**:
   - In Vercel project settings, go to "Environment Variables"
   - Add all the variables from your `.env.local` file:
     - `MONGODB_URI`
     - `MONGODB_DB`
     - `TEACHER_PASS`
     - `STUDENT_PASS`

4. **Deploy**: Vercel will automatically deploy your app

## 📁 Project Structure

```
mcq-quiz-app/
├── api/                          # Serverless API functions
│   ├── add-question.js          # Add new question (Teacher)
│   ├── get-questions-full.js    # Get all questions
│   ├── save-result.js           # Save quiz result (Student)
│   ├── edit-question.js         # Edit existing question (Teacher)
│   └── delete-question.js       # Delete question (Teacher)
├── index.html                   # Landing page (role selection)
├── teacher.html                 # Teacher dashboard
├── student.html                 # Student quiz interface
├── style.css                    # All styles
├── script.js                    # Frontend JavaScript
├── package.json                 # Dependencies and scripts
├── vercel.json                  # Vercel configuration
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## 🔐 Security Features

### Password Authentication
- Teachers and students use separate passwords
- Passwords are validated server-side via headers
- No passwords stored in frontend code
- Session management with localStorage

### API Security
- All API endpoints require valid authentication headers
- Input validation and sanitization
- Error handling without exposing sensitive information
- CORS configuration for security

### Headers Used
- `x-teacher-pass`: For teacher authentication
- `x-class-pass`: For student authentication

## 🎨 Design Features

### UI/UX
- **Modern Design**: Clean cards, gradients, smooth animations
- **Responsive Layout**: Works on mobile, tablet, and desktop
- **Color Coding**: Blue theme for teachers, green for students
- **Interactive Elements**: Hover effects, button animations
- **Professional Typography**: Readable fonts with proper hierarchy

### User Experience
- **Intuitive Navigation**: Clear flow from landing to quiz completion
- **Progress Tracking**: Visual progress bar during quiz
- **Immediate Feedback**: Success/error messages for all actions
- **Question Review**: Students can review their answers
- **Retake Option**: Easy quiz retaking functionality

## 🔧 API Endpoints

### Teacher Endpoints (require `x-teacher-pass` header)

#### Add Question
```http
POST /api/add-question
Content-Type: application/json
x-teacher-pass: your_teacher_password

{
  "question": "What is the capital of France?",
  "options": ["London", "Berlin", "Paris", "Madrid"],
  "answer": 2
}
```

#### Edit Question
```http
POST /api/edit-question
Content-Type: application/json
x-teacher-pass: your_teacher_password

{
  "id": "question_id",
  "question": "Updated question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": 1
}
```

#### Delete Question
```http
POST /api/delete-question
Content-Type: application/json
x-teacher-pass: your_teacher_password

{
  "id": "question_id"
}
```

### Student Endpoints (require `x-class-pass` header)

#### Get Questions
```http
GET /api/get-questions-full
x-class-pass: your_student_password
```

#### Save Result
```http
POST /api/save-result
Content-Type: application/json
x-class-pass: your_student_password

{
  "name": "Student Name",
  "score": 8,
  "total": 10,
  "percentage": 80
}
```

## 📊 Database Schema

### Questions Collection
```javascript
{
  _id: ObjectId,
  question: String,
  options: [String, String, String, String],
  answer: Number, // Index of correct option (0-3)
  createdAt: Date,
  updatedAt: Date
}
```

### Results Collection
```javascript
{
  _id: ObjectId,
  name: String,
  score: Number,
  total: Number,
  percentage: Number,
  createdAt: Date
}
```

## 🧪 Testing

### Local Testing
1. Start the development server: `vercel dev`
2. Test teacher interface with password: `teacher123`
3. Add some sample questions
4. Test student interface with password: `student123`
5. Take the quiz and verify results

### Production Testing
1. Deploy to Vercel
2. Test both interfaces with your custom passwords
3. Verify database operations work correctly
4. Test responsive design on different devices

## 🚨 Troubleshooting

### Common Issues

#### "Unauthorized" Error
- Check environment variables are set correctly in Vercel
- Verify passwords match between frontend and backend
- Ensure MongoDB connection string is correct

#### Questions Not Loading
- Check MongoDB Atlas network access (allow 0.0.0.0/0)
- Verify database and collection names
- Check MongoDB Atlas connection limits

#### API Not Working
- Ensure `vercel.json` is configured correctly
- Check Vercel function logs in dashboard
- Verify API endpoints are deployed

#### Database Connection Issues
- Check MongoDB URI format
- Verify username/password in connection string
- Ensure cluster is running in Atlas

### Development Mode Fallback
The app includes localStorage fallback for development when backend APIs are not available:
- Uses sample questions for testing
- Stores results locally
- Perfect for frontend development

## 🔄 Future Enhancements

### Planned Features
- [ ] Timer for quiz sessions
- [ ] Question categories/subjects
- [ ] Leaderboard functionality
- [ ] Export results as CSV
- [ ] Question difficulty levels
- [ ] Image support in questions
- [ ] Multi-language support
- [ ] Advanced analytics for teachers

### Technical Improvements
- [ ] User management system
- [ ] Session management with JWT
- [ ] Rate limiting for API endpoints
- [ ] Question import/export functionality
- [ ] Batch operations for questions
- [ ] Advanced search and filtering

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or need help:

1. Check this README file
2. Look at the troubleshooting section
3. Check Vercel deployment logs
4. Create an issue in the GitHub repository

## 🎉 Acknowledgments

- MongoDB Atlas for database hosting
- Vercel for serverless deployment
- Modern CSS techniques for responsive design
- Vanilla JavaScript for lightweight frontend

---

**Made with ❤️ for education and learning**
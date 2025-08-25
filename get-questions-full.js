import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-class-pass, x-teacher-pass');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Check authentication (either student or teacher)
    const studentPass = req.headers['x-class-pass'];
    const teacherPass = req.headers['x-teacher-pass'];
    
    const isStudent = studentPass === process.env.STUDENT_PASS;
    const isTeacher = teacherPass === process.env.TEACHER_PASS;
    
    if (!isStudent && !isTeacher) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db(process.env.MONGODB_DB || 'quizapp');
        const questionsCollection = db.collection('questions');
        
        // Get all questions
        const questions = await questionsCollection.find({}).toArray();
        
        return res.status(200).json({ 
            questions: questions || [],
            count: questions.length 
        });
        
    } catch (error) {
        console.error('Error fetching questions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        await client.close();
    }
}
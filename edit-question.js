import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-teacher-pass');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Check teacher authentication
    const teacherPass = req.headers['x-teacher-pass'];
    if (!teacherPass || teacherPass !== process.env.TEACHER_PASS) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const { id, question, options, answer } = req.body;
        
        // Validation
        if (!id || !question || !options || !Array.isArray(options) || options.length !== 4) {
            return res.status(400).json({ error: 'Invalid question data' });
        }
        
        if (typeof answer !== 'number' || answer < 0 || answer > 3) {
            return res.status(400).json({ error: 'Invalid answer index' });
        }
        
        // Connect to MongoDB
        await client.connect();
        const db = client.db(process.env.MONGODB_DB || 'quizapp');
        const questionsCollection = db.collection('questions');
        
        // Update question
        const updateData = {
            question: question.trim(),
            options: options.map(opt => opt.trim()),
            answer: parseInt(answer),
            updatedAt: new Date()
        };
        
        const result = await questionsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }
        
        return res.status(200).json({ success: true });
        
    } catch (error) {
        console.error('Error updating question:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        await client.close();
    }
}
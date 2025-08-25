import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-class-pass');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Check student authentication
    const studentPass = req.headers['x-class-pass'];
    if (!studentPass || studentPass !== process.env.STUDENT_PASS) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const { name, score, total, percentage } = req.body;
        
        // Validation
        if (!name || typeof score !== 'number' || typeof total !== 'number' || typeof percentage !== 'number') {
            return res.status(400).json({ error: 'Invalid result data' });
        }
        
        // Connect to MongoDB
        await client.connect();
        const db = client.db(process.env.MONGODB_DB || 'quizapp');
        const resultsCollection = db.collection('results');
        
        // Insert new result
        const newResult = {
            name: name.trim(),
            score: parseInt(score),
            total: parseInt(total),
            percentage: parseInt(percentage),
            createdAt: new Date()
        };
        
        const result = await resultsCollection.insertOne(newResult);
        
        return res.status(201).json({ 
            success: true, 
            result: { ...newResult, _id: result.insertedId } 
        });
        
    } catch (error) {
        console.error('Error saving result:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        await client.close();
    }
}
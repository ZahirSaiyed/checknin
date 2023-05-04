// pages/api/send-feedback.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

const saveUserInput = async (text: string): Promise<boolean> => {
  console.log('Saving user input:', text); // Add this log
  
  try {
        const client = await clientPromise;
        const collection = client.db("checkins").collection("feedback");
    
        const result = await collection.insertOne({text});
    
        // Check if the insertion was successful and return true if it was
        if (result.acknowledged) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error("Error inserting data into MongoDB:", error);
        return false;
      }
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const inputData = req.body;
    try {
      const result = await saveUserInput(req.body.text);
      res.status(200).json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
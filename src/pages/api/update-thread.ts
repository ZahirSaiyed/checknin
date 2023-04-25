// pages/api/update-threadt.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { OutputData } from './types'; 
import { ObjectId } from 'bson';

const updateThread = async (outputData: OutputData): Promise<boolean> => {
  console.log('Saving user input:', outputData); // Add this log
  
  try {
        const client = await clientPromise;
        const collection = client.db("checkins").collection("users");
        const filter = { _id: new ObjectId(outputData._id) }
        const result = await collection.updateOne(filter, {$set: {replies: outputData.replies}});
    
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
      const result = await updateThread(inputData);
      res.status(200).json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};

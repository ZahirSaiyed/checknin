// pages/api/new-thread.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { InputData } from './types'; 

const saveUserInput = async (inputData: InputData): Promise<boolean> => {
  console.log('Saving user input:', inputData); // Add this log
  
  try {
        const client = await clientPromise;
        const collection = client.db("checkins").collection("users");
    
        const result = await collection.insertOne(inputData);
    
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
      const result = await saveUserInput(inputData)
      if (result) {
      const client = await clientPromise;
      const collection = client.db("checkins").collection("users");

      const checkin = (await collection
        .find({ userId: inputData.userId })
        .sort({ timeStamp: -1 }) // Sort by timeStamp in descending order
        .toArray())[0];

      res.status(200).json({ success: true, checkin});
      } else {
        console.error("MongoDB insertion not acknowledged")
      }
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};


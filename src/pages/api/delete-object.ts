// pages/api/delete-object.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'bson';

const updateAccess = async (collectionName: string, id: string): Promise<boolean> => {
  try {
        const client = await clientPromise;
        const collection = client.db("checkins").collection(collectionName);
        const filter = { _id: new ObjectId(id) }
        const result = await collection.deleteOne(filter);
        return result.acknowledged
      } catch (error) {
        console.error("Error inserting data into MongoDB:", error);
        return false;
      }
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    console.log('Saving user input:', req.body)
    const {id, collection} = req.body;
    try {
      const result = await updateAccess(collection,id);
      res.status(200).json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
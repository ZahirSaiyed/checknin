// pages/api/update-access.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'bson';

const updateAccess = async (id: string, linkAccess: boolean): Promise<boolean> => {
  try {
        const client = await clientPromise;
        const collection = client.db("checkins").collection("users");
        const filter = { _id: new ObjectId(id) }
        const result = await collection.updateOne(filter, {$set: {linkAccess: linkAccess}});
        return result.acknowledged
      } catch (error) {
        console.error("Error inserting data into MongoDB:", error);
        return false;
      }
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    console.log('Saving user input:', req.body)
    const {id, linkAccess} = req.body;
    try {
      const result = await updateAccess(id,linkAccess);
      res.status(200).json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
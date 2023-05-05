// pages/api/update-account.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

const updateAccount = async (email: string, username: string, list: boolean): Promise<boolean> => {
  try {
        const client = await clientPromise;
        const collection = client.db("checkins").collection("accounts");
        const filter = { userId: email }
        const result = await collection.updateMany(filter, {$set: {username: username, list: list}});
        return result.acknowledged
      } catch (error) {
        console.error("Error inserting data into MongoDB:", error);
        return false;
      }
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    console.log('Saving user input:', req.body)
    const {email, username, list} = req.body;
    try {
      const result = await updateAccount(email, username, list);
      res.status(200).json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
// pages/api/update-notifs.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

const updateNotifs = async (id: string, userId: string, notifs: number): Promise<boolean> => {
  try {
        const client = await clientPromise;
        const collection = client.db("checkins").collection("accounts");
        const filter = { userId }
        const accountNotifs = (await collection.find(filter).toArray())[0].notifs ?? {}
        accountNotifs[id] = notifs
        const result = await collection.updateMany(filter, {$set: {notifs: accountNotifs}});
        return result.acknowledged
      } catch (error) {
        console.error("Error inserting data into MongoDB:", error);
        return false;
      }
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    console.log('Saving user input:', req.body)
    const {id, userId, notifs} = req.body;
    try {
      const result = await updateNotifs(id, userId, notifs);
      res.status(200).json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
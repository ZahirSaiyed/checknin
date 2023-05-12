// pages/api/update-users.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'bson';

const updateUsers = async (id: string, user: string): Promise<boolean> => {
  try {
        const client = await clientPromise;
        const collection = client.db("checkins").collection("users");
        const filter = { _id: new ObjectId(id) }
        const thread = (await collection.find({ _id: new ObjectId(id) }).toArray())[0]
        if (thread.shared) {
          thread.shared.push(user)
          const result = await collection.updateOne(filter, {$set: {shared: thread.shared}});
          return result.acknowledged
        } else {
          const shared: string[]  = [user]
          const result = await collection.updateOne(filter, {$set: {shared}});
          return result.acknowledged
        }
      } catch (error) {
        console.error("Error inserting data into MongoDB:", error);
        return false;
      }
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    console.log('Saving user input:', req.body)
    const {id, user } = req.body;
    try {
      const result = await updateUsers(id,user);
      res.status(200).json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};

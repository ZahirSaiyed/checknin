// src/pages/api/get-pods.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'bson';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { userId } = req.body;

    try {
      const client = await clientPromise;
      const collection = client.db("checkins").collection("pods");

      const pods = await collection.find({ members: new ObjectId(userId) }).toArray();

      res.status(200).json({ success: true, pods });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
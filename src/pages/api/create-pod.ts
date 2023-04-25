// src/pages/api/create-pod.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { userId, name } = req.body;

    try {
      const client = await clientPromise;
      const collection = client.db("checkins").collection("pods");

      const result = await collection.insertOne({ userId, name, members: [userId] });

      res.status(200).json({ success: true, podId: result.insertedId });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
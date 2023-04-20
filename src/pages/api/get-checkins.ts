// get-checkins.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { InputData } from './types';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const userId = req.body.userId;

    try {
      const client = await clientPromise;
      const collection = client.db("checkins").collection("users");

      const checkins = await collection
        .find({ userId: userId })
        .sort({ timeStamp: -1 }) // Sort by timeStamp in descending order
        .toArray();

      res.status(200).json({ success: true, checkins });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};

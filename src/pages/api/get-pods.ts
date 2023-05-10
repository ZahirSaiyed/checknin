// get-pods.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const email = req.body.email;

    try {
      const client = await clientPromise;
      const collection = client.db("checkins").collection("pods");
      const pods = await collection
        .find({$or: [{shared: { $all: [email] }}, {userId: email}]})
        .toArray();
      res.status(200).json({ success: true, pods });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
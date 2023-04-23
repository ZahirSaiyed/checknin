// get-checkins.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'bson';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const _id = req.body._id;

    try {
      const client = await clientPromise;
      const collection = client.db("checkins").collection("users");

      const thread = await collection
        .find({ _id: new ObjectId(_id) })
        .toArray();

      res.status(200).json({ success: true, thread });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};

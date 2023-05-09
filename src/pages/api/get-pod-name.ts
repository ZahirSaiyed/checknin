// pages/api/get-pod-name.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'bson';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { pod } = req.body;
    try {
      const client = await clientPromise;
      const podCollection = client.db("checkins").collection("pods");
      const name = (await podCollection.find({ _id: new ObjectId(pod) }).toArray())[0].name
      res.status(200).json({ success: true , name})
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
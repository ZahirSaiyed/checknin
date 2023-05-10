// pages/api/add-pod.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'bson';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const {userId, pod} = req.body;
    try {
      const client = await clientPromise;
      const collection = client.db("checkins").collection("pods");
      const podMembers = (await collection.find({ _id: new ObjectId(pod) }).toArray())[0].shared ?? [pod.userId]
      if (!podMembers.contains(userId)) {
        podMembers.push(userId)
      }
      console.log("HI",podMembers)
      const result = await collection.updateMany({userId }, {$set: { shared: podMembers}})
      res.status(200).json({ success: result.acknowledged })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
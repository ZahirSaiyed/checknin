// src/pages/api/get-pod-checkins.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'bson';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { userId, podId } = req.body;

    try {
      const client = await clientPromise;
      const podCollection = client.db("checkins").collection("pods");
      const checkinCollection = client.db("checkins").collection("users");

      // Check if the user is a member of the pod
      const pod = await podCollection.findOne({ _id: new ObjectId(podId), members: new ObjectId(userId) });

      if (pod) {
        const checkins = await checkinCollection.find({ userId: { $in: pod.members } }).sort({ timeStamp: -1 }).toArray();

        res.status(200).json({ success: true, checkins });
      } else {
        res.status(403).json({ success: false, message: 'User not authorized to access this pod' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
} else {
  res.status(405).json({ success: false, message: 'Method not allowed' });
}
};

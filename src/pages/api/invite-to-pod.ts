// src/pages/api/invite-to-pod.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'bson';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { podId, inviterUserId, expiry } = req.body;

    try {
      const client = await clientPromise;
      const collection = client.db("checkins").collection("podInvitations");

      const result = await collection.insertOne({ podId: new ObjectId(podId), inviterUserId: new ObjectId(inviterUserId), expiry: expiry ? new Date(expiry) : null });

      res.status(200).json({ success: true, invitationId: result.insertedId });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
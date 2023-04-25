// invite-to-pod.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { PodInvitation } from './types';
import { v4 as uuidv4 } from 'uuid';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { podId, inviterUserId, expiry } = req.body;

    const invitationId = uuidv4(); // Generate a unique UUID

    const invitation: PodInvitation = {
      _id: invitationId,
      podId,
      inviterUserId,
      expiry,
    };

    try {
      const client = await clientPromise;
      const collection = client.db('checkins').collection('podInvitations');
      await collection.insertOne(invitation);

      res.status(200).json({ success: true, invitationId });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};

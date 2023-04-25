// src/pages/api/redeem-invitation.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'bson';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { userId, invitationId } = req.body;

    try {
      const client = await clientPromise;
      const invitationCollection = client.db("checkins").collection("podInvitations");
      const podCollection = client.db("checkins").collection("pods");

      // Find the invitation
      const invitation = await invitationCollection.findOne({      _id: new ObjectId(invitationId) });

      // Check if the invitation exists and is not expired
      if (invitation && (!invitation.expiry || invitation.expiry > new Date())) {
        // Add the user to the pod's members array
        const updateResult = await podCollection.updateOne(
          { _id: new ObjectId(invitation.podId) },
          { $addToSet: { members: new ObjectId(userId) } }
        );

        if (updateResult.modifiedCount === 1) {
          res.status(200).json({ success: true });
        } else {
          res.status(500).json({ success: false, message: 'Failed to join the pod' });
        }
      } else {
        res.status(400).json({ success: false, message: 'Invalid or expired invitation' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};


// redeem-invitation.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'bson';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { invitationId, userId } = req.body;

    try {
      const client = await clientPromise;
      const invitationsCollection = client.db('checkins').collection('podInvitations');
      const podsCollection = client.db('checkins').collection('pods');

      // Find the invitation with the given invitationId
      const invitation = await invitationsCollection.findOne({ _id: invitationId });

      if (!invitation) {
        res.status(400).json({ success: false, message: 'Invalid invitation link' });
        return;
      }

      if (invitation.expiry && new Date() > invitation.expiry) {
        res.status(400).json({ success: false, message: 'Invitation link has expired' });
        return;
      }

      // Add the user to the pod's members list
      await podsCollection.updateOne(
        { _id: new ObjectId(invitation.podId) },
        { $addToSet: { members: userId } }
      );

      // Optionally, delete the used invitation
      await invitationsCollection.deleteOne({ _id: invitationId });

      res.status(200).json({ success: true, message: 'Invitation redeemed successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
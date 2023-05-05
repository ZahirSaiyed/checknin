// pages/api/get-account.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const email = req.body.email;
    try {
      const client = await clientPromise;
      const collection = client.db("checkins").collection("accounts");

      const account = (await collection
        .find({ userId: email })
        .toArray())
      if (account.length==0) {
        const result = await collection.insertOne({ userId: email, username: email, list: false})
        if (result.acknowledged) {
            res.status(200).json({ 
                success: true, 
                username: email, 
                list: false,
                pods: []});
        } else {
            res.status(200).json({ success: true, result });
        }
      } else {
        if (account.length > 1) {
            await collection.deleteOne({ userId: email })
        }
        res.status(200).json({ 
            success: true, 
            username: account[0].username, 
            list: account[0].list, 
            pods: account[0].pods ?? []});
      }
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
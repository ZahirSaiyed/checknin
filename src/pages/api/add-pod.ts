// pages/api/add-pod.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'bson';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const {userId, pod} = req.body;
    try {
      const client = await clientPromise;
      const podCollection = client.db("checkins").collection("pods");
      const name = (await podCollection.find({ _id: new ObjectId(pod) }).toArray())[0].name

      const accountCollection = client.db("checkins").collection("accounts");
      const oldPods = (await accountCollection.find({ userId }).toArray())[0].pods
      if (!oldPods || !oldPods.map((tuple: [string,string]) => tuple[1]).includes(pod)) {
        if (oldPods) {
          oldPods.push([name,pod])
          const result = await accountCollection.updateMany({userId }, {$set: { pods: oldPods}})
          res.status(200).json({ success: result.acknowledged })
        } else {
          const result = await accountCollection.updateMany({userId }, {$set: { pods: [[name,pod]]}});
          res.status(200).json({ success: result.acknowledged })
        }
    } res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
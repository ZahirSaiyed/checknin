// pages/api/update-thread.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'bson';
import type { WithId, Document } from 'mongodb'

function canAccess(user: string, thread: WithId<Document>, owner: string) {
  return thread && ((user === owner) 
  || thread.linkAccess
  || thread.shared?.includes(user))
}

const updateThread = async (id: string, user: string, userId: string, ownerId: string, text: string): Promise<boolean> => {
  try {
        const client = await clientPromise;
        const collection = client.db("checkins").collection("users");
        const filter = { _id: new ObjectId(id) }
        const threadReplies = (await collection.find({ _id: new ObjectId(id) }).toArray())[0]
        if (userId != "Nin" && !canAccess(userId, threadReplies, ownerId)) return true
        if (threadReplies.replies) {
          threadReplies.replies.push([user, text])
          const result = await collection.updateOne(filter, {$set: {replies: threadReplies.replies}});
          return result.acknowledged
        } else {
          const replies: [string,string][]  = [[user,text]]
          const result = await collection.updateOne(filter, {$set: {replies: replies}});
          return result.acknowledged
        }
      } catch (error) {
        console.error("Error inserting data into MongoDB:", error);
        return false;
      }
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    console.log('Saving user input:', req.body)
    const {id, user, userId, ownerId, text} = req.body;
    try {
      const result = await updateThread(id,user,userId,ownerId,text);
      res.status(200).json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};

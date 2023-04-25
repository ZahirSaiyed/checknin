import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai';
import { OutputData } from '../api/types';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'bson';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY as string,
});

const openai = new OpenAIApi(configuration);

const basePromptPrefix = "Act like a really good friend who is empathetic, positive, caring, and is always uplifting. Respond to the user's recap of their day";

//This API should be called whenever a thread changes, the bot parses the thread and responds when appropriate
const actOnThread = async (req: NextApiRequest, res: NextApiResponse) => {
  const checkin = req.body as OutputData
  if (!checkin.replies) checkin.replies = [];
  //check if response necessary
  console.log(checkin)
  if (checkin.replies.length == 0 || checkin.replies[checkin.replies.length-1][0] == checkin.userId) {
    const messages : Array<ChatCompletionRequestMessage> = [{role: "system", content: basePromptPrefix},{role: "user", content: req.body.text}];
    req.body.replies?.forEach( ([user,reply]: [string,string]) => {
      if (user=="Nin") {
        messages.push({role: "system", content: reply})
      } else {
        messages.push({role: "user", content: reply})
      }
    })

    const baseCompletion = await openai.createChatCompletion({
      //for reply in user replies, add reply
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 250,
    });

  const basePromptOutput = baseCompletion.data.choices[0].message?.content;
  console.log(baseCompletion.data.choices[0].message?.content);
  

  //Fetch thread and ensure no change during generating, post if so
  const _id = new ObjectId(checkin._id);

  try {
    const client = await clientPromise;
    const collection = client.db("checkins").collection("users");

    const thread = (await collection
      .find({ _id:  _id})
      .toArray())[0];

    if (thread.replies.length == checkin.replies.length) {
      if (basePromptOutput) checkin.replies.push(["Nin",basePromptOutput]);
      const filter = { _id: new ObjectId(_id) }
      const result = await collection.updateOne(filter, {$set: {replies: checkin.replies}})
      res.status(200).json({ success: result.acknowledged, thread })
    } else {
      res.status(200).json({ success: true, thread });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
} else {
  res.status(200).json({ success: true, checkin })
}};

export default actOnThread;

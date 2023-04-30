import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY as string,
});

const openai = new OpenAIApi(configuration);

const basePromptPrefix = "You are the bot 'Nin' on the website Check-N-In. Act like a really good friend who is empathetic, positive, caring, and is always uplifting. Respond to the user's recap of their day which includes a 1-10 rating of their mood. Any replies not written by you are prefixed by their username followed by a colon and a newline.";

const generateAction = async (req: NextApiRequest, res: NextApiResponse) => {

  const messages : Array<ChatCompletionRequestMessage> = [{role: "system", content: basePromptPrefix},{role: "user", content: `${req.body.userId}:\n`+req.body.userInput}];
  req.body.replies?.forEach( ([user,reply]: [string,string]) => {
    if (user=="Nin") {
      messages.push({role: "assistant", content: reply})
    } else {
      messages.push({role: "user", content: `${user}:\n`+reply})
    }
  })

  try {
    const baseCompletion = await openai.createChatCompletion({
      //for reply in user replies, add reply
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 250,
    });

    const basePromptOutput = baseCompletion.data.choices[0].message?.content;
    console.log(baseCompletion.data.choices[0].message?.content);

    res.status(200).json({ success: true, output: basePromptOutput });
  } catch(error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export default generateAction;

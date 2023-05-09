import { useState } from 'react';
import Head from 'next/head';
import { NextPage } from 'next';
import { useSession, signIn } from "next-auth/react"
import { InputData, OutputData } from '../pages/api/types';
import Header from '../components/Header';
import { useRouter } from 'next/router';

const Home: NextPage = () => {
  const {data : session} = useSession();
  const router = useRouter()
  const [textValue, setTextValue] = useState('');
  const [numberValue, setNumberValue] = useState<number | null>(null);
  const [allowSubmit, setAllowSubmit] = useState<boolean>(true);
  const [ninResponse, setNinResponse] = useState<boolean>(router.query.pod ? false : true);

  const fetchPastCheckins = async () => {
    if (session) {
      const response = await fetch('/api/get-checkins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: session?.user?.email ?? 'unknown'}),
      })
      const data = await response.json()
      if (data.success) return data.checkins
    }
  }

  async function getAccount(email: string) {
    const response = await fetch('/api/get-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email
        }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error('Error saving input:', error);
        return;
    } 
    const data = await response.json();
    return data.username
}

  const saveUserInput = async (inputData: InputData) => {
    const response = await fetch('/api/save-input', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputData),
    });
  
    if (!response.ok) {
      const error = await response.json();
      console.error('Error saving input:', error);
    } else {
      return (await fetchPastCheckins())[0];
    }
  };

  const callGenerateEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();

    const emptyReplies : [string, string][] = [] 

    const inputData = {
      userId: session?.user?.email ?? 'unknown', // assuming the user object has an 'id' field
      text: textValue,
      rating: numberValue || 0,
      timeStamp: new Date(),
      replies: emptyReplies,
      linkAccess: router.query.pod ? true : false,
      pod: (router.query.pod as string) ?? "",
    };

    if (ninResponse) {
      console.log("Calling OpenAI...");
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: await getAccount(session?.user?.email as string) ?? 'unknown', userInput: `Mood: ${numberValue}\n`+textValue }),
      });
    
      const data = await response.json();
      const output = data.output;
      console.log("OpenAI replied...", output);
      inputData.replies.push(["Nin",output])
    } else {
      fetch('/api/add-pod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: inputData.userId, pod: inputData.pod }),
      })
    }
    const checkin = (await saveUserInput(inputData)) as OutputData;
    if (inputData.pod != "") router.push(`pod/${inputData.pod}`)
    else if (checkin._id) router.push(`checkin/${checkin._id}`);
    else setAllowSubmit(true);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex flex-col items-center justify-center">
        <Head>
          <title>Check-N-In</title>
          <link rel="shortcut icon" href="../../public/logo.png"/>
        </Head>
        <div className="text-center">
          <h1 className="text-white text-6xl font-bold">Check-N-In</h1>
          <p className="text-white text-xl mt-4 mb-8">
            Track your daily emotions and gain insights.
          </p>
          <button
            onClick={() => signIn()}
            className="bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
          >
            Log In
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-white text-4xl font-bold">Check-N-In</h1>
        <form onSubmit={(e) => {if (allowSubmit) {setAllowSubmit(false); callGenerateEndpoint(e)}}} className="mt-8">
        <p className="text-white mt-4">
          Rate your day out of 10
        </p>
          <input
            className="block w-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-20 rounded p-2 focus:outline-none focus:border-white mt-4 mb-4"
            type="number"
            min="1"
            max="10"
            step="0.01"
            placeholder="Enter a number between 1.0 and 10.0"
            onChange={(e) => setNumberValue(parseFloat(e.target.value))}
          />
        <p className="text-white mt-4">
          What happened today?
        </p>
          <textarea
            className="block w-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-20 rounded p-2 focus:outline-none focus:border-white mt-4 mb-4"
            placeholder="Tell us about your day"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
          />
          <div className="flex">
          <p className="text-white">
          Include Nin AI response?
          </p>
          <input 
              checked={ninResponse}
              onChange={(e) => {setNinResponse(e.target.checked)}}
              type="checkbox" 
              id="email" 
              className="ml-4 mt-1 form-checkbox h-5 w-5 text-gray-600" />
          </div>
          <div className="flex">
          {allowSubmit && (
          <button
            className="mt-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
            type="submit"
          >
            Submit
          </button>)}
          {!allowSubmit && (
          <p className="mt-4">
            Submitting...
          </p>)}
          {router.query.pod && 
          <p className="ml-2 mt-6 text-white">Posting to pod</p>
          }
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
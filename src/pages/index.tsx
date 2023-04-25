import { useState } from 'react';
import Head from 'next/head';
import { NextPage } from 'next';
import { useSession, signIn, signOut } from "next-auth/react"
import { InputData, OutputData } from '../pages/api/types';
import Header from '../components/Header';
import { useRouter } from 'next/navigation';

const Home: NextPage = () => {
  const router = useRouter();
  const {data : session} = useSession();
  const [textValue, setTextValue] = useState('');
  const [numberValue, setNumberValue] = useState<number | null>(null);
  const [allowSubmit, setAllowSubmit] = useState<boolean>(true);

  const newThread = async (inputData: InputData) => {
    const response = await fetch('/api/new-thread', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputData),
    });
  
    if (!response.ok) {
      const error = await response.json();
      console.error('Error saving input:', error);
    } 
    return response.ok
  };

  const fetchPastCheckins = async () => {
    if (session) {
      const response = await fetch("/api/get-checkins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session?.user?.email ?? "unknown" }),
      })
      if (response.ok) {
        return (await response.json()).checkins
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emptyReplies : [string, string][] = [] 

    const inputData = {
      userId: session?.user?.email ?? 'unknown', // assuming the user object has an 'id' field
      text: textValue,
      rating: numberValue || 0,
      timeStamp: new Date(),
      replies: emptyReplies,
    }; 
    if(!await newThread(inputData)) {
      setAllowSubmit(true);
    };
    const checkins = await fetchPastCheckins();
    if (checkins) router.push(`checkin/${checkins[0]._id}`);
    else setAllowSubmit(true);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex flex-col items-center justify-center">
        <Head>
          <title>Check-N-In</title>
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
      <Head>
        <title>Check-N-In</title>
      </Head>
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-white text-4xl font-bold">Check-N-In</h1>
        <p className="text-white mt-4">
          How was your day today? Rate your day out of 10
        </p>
        <form onSubmit={(e) => {if (allowSubmit) {setAllowSubmit(false); handleSubmit(e)}}} className="mt-8">
          <input
            className="block w-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-20 rounded p-2 focus:outline-none focus:border-white"
            type="text"
            placeholder="Enter text here"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
          />
          <input
            className="block w-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-20 rounded p-2 focus:outline-none focus:border-white mt-4"
            type="number"
            min="1"
            max="10"
            step="0.01"
            placeholder="Enter a number between 1 and 10"
            onChange={(e) => setNumberValue(parseFloat(e.target.value))}
          />
          {allowSubmit && (
          <button
            className="mt-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
            type="submit"
          >
            Submit
          </button>)}
        </form>
      </div>
    </div>
  );
};

export default Home;
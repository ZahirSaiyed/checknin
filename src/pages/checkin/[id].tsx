import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { OutputData } from '../../pages/api/types';
import { useSession } from "next-auth/react";
import Link from 'next/link';

const CheckIn: NextPage = () => {
    const {data : session} = useSession();
    const router = useRouter();
    const { id } = router.query;
    const [thread, setThread] = useState<OutputData>();
    const [textValue, setTextValue] = useState('');

    useEffect(() => {fetchThread(id?.toString() || null)}, [session, router]);
    //useEffect(() => {setTextValue("@Nin ")}, [thread])

    const saveThread = async (thread: OutputData) => {
        const response = await fetch('/api/update-thread', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(thread),
        });
        if (!response.ok) {
          const error = await response.json();
          console.error('Error saving input:', error);
        }
      };

    const submitReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (session?.user?.email && thread) {
            if (thread.replies) {
                thread.replies.push([session.user.email,textValue])
            } else {
                thread.replies = [[session.user.email,textValue]]
            }
            console.log("Calling OpenAI...");
            const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userInput: thread.text, replies: thread.replies}),
            });
            const data = await response.json();
            const { output } = data;
            console.log("OpenAI replied...", output);
            thread.replies.push(["Nin",output])
            await saveThread(thread);
            fetchThread(id?.toString() || null);
        }
    }

    const fetchThread = (id : string | null) => {
        if (session && id) {
          fetch('/api/get-thread', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id: id}),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                setThread(data.thread[0]);
              }
            });
        }
    }

    if (thread && session?.user?.email === thread?.userId) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
                <div className="bg-white bg-opacity-20 text-white p-4 rounded"> 
                <p>{new Date(thread.timeStamp).toLocaleString()}</p>
                <p>Mood: {thread.rating}</p>
                <p>{thread.text}</p>
                </div>
                <div className="ml-32 mr-16 mt-8" >
                    <ul className="mt-4 mb-4 space-y-4">
                    {thread?.replies?.map(([user,text], index) => (
        
                        <li 
                        key={index}
                        className="bg-white bg-opacity-20 text-white p-4 rounded"
                        >
                        <b>{user}</b>
                        <p> {text}</p>
                        {/* <button
                            className="ml-2 text-gray-100 text-xs"
                            onClick = {() => setTextValue("@Nin "+textValue)}
                        >
                            Reply
                        </button> */}
                        </li>
                        
                    ))}
                    </ul>
                </div>
                <form onSubmit={(e) => submitReply(e)} className="mt-8 ml-8">
                <input
                    className="block w-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-20 rounded p-2 focus:outline-none focus:border-white"
                    type="text"
                    placeholder="Enter text here"
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                />
                <button
                    className="mt-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                    type="submit"
                >
                    Submit
                </button>
                </form>
            </div>
        )
    } else {
        return (
        <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
            <p>Improper permissions</p>
            <Link href={`/`}>
            <button
                className="mt-4 ml-4 bg-white text-purple-500 font-bold py-1 px-2 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
            >
                Go back
            </button>
            </Link>
        </div>
        )
    }
}

export default CheckIn;
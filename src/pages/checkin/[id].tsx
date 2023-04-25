import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef} from 'react';
import { OutputData } from '../../pages/api/types';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import Header from '../../components/Header';

const CheckIn: NextPage = () => {
    const {data : session} = useSession();
    const router = useRouter();
    const { id } = router.query;
    const [thread, setThread] = useState<OutputData>();
    const [textValue, setTextValue] = useState('');
    const chatBottomRef = useRef<HTMLDivElement | null>(null);
    const refreshThreshold = 10;

    useEffect(() => {fetchThread(id?.toString() || null)}, [session, router]);
    useEffect(() => {
        scrollToBottom();
    }, [thread?.replies ?? []]);

    const scrollToBottom = () => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    

    const updateThread = async (thread: OutputData) => {
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
        if (!textValue.trim()) {
            return;
        }

        if (session?.user?.email && thread) {
        setThread({ ...thread });
        thread.replies.push([thread.userId, textValue])
        setTextValue('');
        scrollToBottom();
        await updateThread(thread);
        fetch('/api/bot', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(thread),
          })
        fetchThread(id?.toString() || null);
        scrollToBottom();
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

    const AITyping = () => (thread?.replies.length == 0 || thread?.replies[thread?.replies.length-1][0] == thread?.userId)
    const isReplyFromAI = (user: string) => user === "Nin";

    if (thread && session?.user?.email === thread?.userId) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
                <Header />
                <div className="bg-white bg-opacity-20 text-white p-4 rounded max-w-2xl mx-auto my-6"> 
                    <p>{new Date(thread.timeStamp).toLocaleString()}</p>
                    <p>Mood: {thread.rating}</p>
                    <p>{thread.text}</p>
                </div>
                <div className="max-w-2xl mx-auto my-6 bg-white bg-opacity-10 rounded-lg h-96 overflow-y-auto space-y-4 p-4">
        {thread?.replies?.map(([user, text], index) => (
            <div
                key={index}
                className={`p-4 rounded ${
                    isReplyFromAI(user)
                    ? "bg-blue-400 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
            >
                <b>{user}</b>
                <p> {text}</p>
            </div>
        ))}
        {AITyping() && (
        <div>
            <p>Nin is typing...</p>
            <button 
                className="mt-1 bg-white text-purple-500 font-bold py-2 px-2 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                type="button"
                onClick={() => fetchThread(id?.toString() || null)}
            >
                Refresh
            </button>
        </div>
        )}
        <div ref={chatBottomRef} />
    </div>
                <style jsx>{`
                    ::-webkit-scrollbar {
                        width: 10px;
                    }
    
                    ::-webkit-scrollbar-track {
                        background-color: rgba(255, 255, 255, 0.1);
                        border-radius: 5px;
                    }
    
                    ::-webkit-scrollbar-thumb {
                        background-color: rgba(255, 255, 255, 0.4);
                        border-radius: 5px;
                    }
                `}</style>
                <form onSubmit={(e) => submitReply(e)} className="max-w-2xl mx-auto my-6 px-4">
                    <label htmlFor="reply-input" className="block text-white mb-2">Your Reply:</label>
                    <input
                        id="reply-input"
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
    }  else {
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
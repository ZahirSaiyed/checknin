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
    const [isAITyping, setIsAITyping] = useState(false);
    const [copied, setCopied] = useState(false);
    const chatBottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {fetchThread(id?.toString() || null)}, [session, router]);
    //useEffect(() => {setTextValue("@Nin ")}, [thread])
    useEffect(() => {
        scrollToBottom();
    }, [thread?.replies ?? []]);

    const scrollToBottom = () => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    

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
        if (!textValue.trim()) {
            return;
        }

        if (session?.user?.email && thread) {
        // Show user input immediately
        thread.replies.push([session.user.email, textValue]);

        setThread({ ...thread });
        setTextValue('');
        setIsAITyping(true); // Set AI typing status to true
        scrollToBottom();

        //console.log("Calling OpenAI...");
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userInput: thread.text, replies: thread.replies }),
        });
        const data = await response.json();

        if (data.success) {
            const output = data.output;
            //console.log("OpenAI replied...", output);

            // Remove user input from thread replies (it will be added back with AI response)
            thread.replies.pop();

            // Add both user input and AI response to the thread replies
            thread.replies.push([session.user.email, textValue], ["Nin", output]);
        }
        await saveThread(thread);
        fetchThread(id?.toString() || null);
        scrollToBottom();
        setIsAITyping(false); // Set AI typing status to false
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

    const handleShare = (e: React.FormEvent) => {
        e.preventDefault();
        if (thread) {
            const data = {
                title: 'Check-N-In',
                url: 'https://checknin.up.railway.app/',
                text: `Check-in: ${thread.rating}\n${thread.text}`
            }
            if (navigator.canShare(data)) {
                navigator.share(data).catch(console.error)
            }
        }
    }

    const isReplyFromAI = (user: string) => user === "Nin";

    if (thread && session?.user?.email === thread?.userId) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
                <Header />
                <div className="bg-white bg-opacity-20 text-white p-4 rounded max-w-2xl mx-auto my-6"> 
                    <p>{new Date(thread.timeStamp).toLocaleString()}</p>
                    <p>Mood: {thread.rating}</p>
                    <p>{thread.text}</p>
                    <button
                        className="mt-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                        type="submit"
                        onClick = {(e) => handleShare(e)}
                    >
                        Share
                    </button>
                    <button
                        className="ml-4 mt-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                        type="submit"
                        onClick = {() => {
                            navigator.clipboard.writeText(`Check-in: ${thread.rating}\n${thread.text}\n\nFrom https://checknin.up.railway.app/`);
                            setCopied(true);
                        }}
                    >
                        Copy
                    </button>
                    {copied && <p>Copied to clipboard!</p>}
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
        {isAITyping && (
            <div className="p-4 rounded bg-blue-400 text-white">
                <b>Nin</b>
                <p>...</p>
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
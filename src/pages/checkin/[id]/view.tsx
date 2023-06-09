import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef} from 'react';
import { OutputData, Pod } from '../../api/types';
import { useSession, signIn } from "next-auth/react";
import Link from 'next/link';
import Header from '../../../components/Header';
import Landing from '../../../components/Landing';
import Head from 'next/head';

const CheckIn: NextPage = () => {
    const {data : session} = useSession();
    const router = useRouter();
    const { id } = router.query;
    const [thread, setThread] = useState<OutputData>();
    const [pod, setPod] = useState<Pod>();
    const [textValue, setTextValue] = useState('');
    const [isAITyping, setIsAITyping] = useState(false);
    const [usernames, setUsernames] = useState<{ [email: string]: string }>({});
    const [feedback, setFeedback] = useState<boolean>(Math.random() < 0.1)
    const [feedbackValue, setFeedbackValue] = useState('');
    const chatBottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {thread && session && updateNotifs()}, [thread, session]);
    useEffect(() => {thread && thread.pod && fetchPod(thread.pod)}, [thread, session]);
    useEffect(() => {fetchThread(id?.toString() || null)}, [session, router]);
    useEffect(() => {session && thread && (session?.user?.email == thread?.userId) && textValue == '' && (!thread.pod || thread.pod == '') && setTextValue("@Nin ")}, [thread, session])
    useEffect(() => {(session?.user?.email && getAccount(session.user.email))}, [session]);
    useEffect(() => {
        const interval = setInterval(() => {
            fetchThread(id?.toString() || null); // Reload the current page
        }, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval); // Cleanup function
      }, []);

    const fetchPod = async (id : string | null) => {
        if (session && id && id != "") {
            const response = await fetch('/api/get-pod', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id: id}),
            })
            const data = await response.json()
            setPod(data.pod);
        }
    }

    async function getAccount(email: string) {
        if(usernames[email]) return usernames[email];
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
        setUsernames(prevState => ({ ...prevState, [email]: data.account.username }))
    }

    const scrollToBottom = () => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const replyToUser = (e: React.FormEvent, user: string) => {
        e.preventDefault();
        setTextValue(`@${user} `)
    }

    const saveReply = async (id: String, user: string, userId: string, text: string, ) => {
        const response = await fetch('/api/update-thread', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({id, user, userId, ownerId: thread?.userId, text}),
        });
        if (!response.ok) {
          const error = await response.json();
          console.error('Error saving input:', error);
        } else {
            fetchThread(id?.toString() || null);
        }
      };

    const updateNotifs = async () => {
        if(thread?.replies) {
            const response = await fetch('/api/update-notifs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({id, userId: session?.user?.email, notifs: 1+thread.replies.length}),
            });
            if (!response.ok) {
            const error = await response.json();
            console.error('Error saving input:', error);
            }
        }
      };

    const submitReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!textValue.trim()) {
            return;
        }
        if (session?.user?.email && thread) {
        // Show user input immediately
        if (!thread.replies) thread.replies = [];
        const username = (await getAccount(session.user.email)) as string
        const owner = (await getAccount(thread.userId)) as string
        thread.replies.push([username, textValue]);
        await saveReply(id as string, username, session.user.email, textValue);
        setTextValue('');
        setThread({ ...thread });
        if (textValue.startsWith("@Nin ")) {
            setTextValue('');
            setIsAITyping(true); // Set AI typing status to true
            scrollToBottom();

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    userId: await getAccount(session?.user?.email) ?? 'unknown', 
                    userInput: `Mood: ${thread.rating}\n`+thread.text, 
                    replies: thread.replies
                }),
            });
            const data = await response.json();

            if (data.success) {
                const output = data.output;
                thread.replies.push(["Nin", output]);
                await saveReply(id as string, "Nin", "Nin", output);
            setIsAITyping(false); // Set AI typing status to false
            }
        }
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
                getAccount(data.thread[0].userId);
              }
            });
        }
    }

    const isReplyFromOP = (user: string) => {
        const email = thread?.userId
        return (user === usernames[email as string])
    }

    function submitFeedback(e: React.FormEvent) {
        fetch('/api/send-feedback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({text: feedbackValue}),
          })
        setFeedback(false);
    }
    
    function getName (user: string) {
        return usernames[user]
    }

    function canAccess() {
        return session && thread && ((session?.user?.email === thread?.userId) 
        || thread.linkAccess
        || thread.shared?.includes(session?.user?.email as string)
        || (pod && pod.shared.includes(session?.user?.email as string))
        || (pod && pod.linkAccess)
        || (pod && pod.userId === session?.user?.email))
    }

    if (feedback && session) {
        return(
            <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
            <Header />
            <div className="container mx-auto p-4">
              <h1 className="text-white text-4xl font-bold">Check-N-In</h1>
              <form onSubmit={(e) => {submitFeedback(e)}} className="mt-8">
              <p className="text-white mt-4">
                Please tell use how we can improve!
              </p>
                <textarea
                  className="block w-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-20 rounded p-2 focus:outline-none focus:border-white mt-4 mb-4"
                  placeholder="I want this new feature, there is this bug, I don't like this..."
                  value={feedbackValue}
                  onChange={(e) => setFeedbackValue(e.target.value)}
                />
                <button
                    className="mt-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                    type="submit"
                >
                    Submit
                </button>
              </form>
            </div>
          </div>)
    }

    if (session && thread && canAccess()) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
                <Header />
                {(session?.user?.email === thread.userId) && (!thread.pod || thread.pod == "")  ?
                <div className="mx-auto p-1 rounded flex justify-center items-center">
                    <p> Access: {thread.linkAccess ? "Public" : "Private"}</p>
                    <button
                    className="ml-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                    type="submit"
                    onClick = {() => router.push(`/checkin/${id}/share`)}
                >
                    Share
                </button>
                </div>
                : 
                <div className="mx-auto p-1 rounded flex justify-center items-center">
                <p> {`Viewing ${getName(thread.userId)}'s checkin`} </p>
                </div>
                }

                <div className="max-w-2xl mx-auto bg-white bg-opacity-10 rounded-lg h-96 overflow-y-auto space-y-4 p-4">
                <div
                className="bg-white bg-opacity-20 text-white p-1 rounded max-w-2xl mx-auto my-1"
                >
                <div>
                    <p>{new Date(thread.timeStamp).toLocaleString()}</p>
                    <p>Mood: {thread.rating}</p>
                    <p>{thread.text}</p>
                </div>
                </div>
        {thread?.replies?.map(([user, text], index) => (
            <div
                key={index}
                className={`p-4 rounded flex justify-between items-center ${
                    isReplyFromOP(user)
                    ? "bg-blue-400 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
            >
                <div>
                    {user=="Nin" ?
                    <div className="flex">
                    <b className="mt-1">{user}</b>
                     <img className="ml-2 rounded-full h-9" src="/nin.jpg" alt=""/>
                     </div> : 
                     <b>{user}</b>}
                
                <p> {text}</p>
                </div>
                <button
                        className="ml-4 mt-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                        onClick = {(e) => replyToUser(e, user)}
                    >
                        Reply
                </button>
            </div>
        ))}
        {isAITyping && (
            <div className="p-4 rounded bg-gray-200 text-gray-800">
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
                <form onSubmit={(e) => submitReply(e)} className="max-w-2xl mx-auto my-6 px-4 flex">
                    <input
                        id="reply-input"
                        className="block w-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-20 rounded p-2 focus:outline-none focus:border-white"
                        type="text"
                        placeholder="Enter text here"
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                    />
                    <button
                        className="ml-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                        type="submit"
                    >
                        Reply
                    </button>
                </form>
            </div>
        )
    }  else if (!session) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex flex-col items-center justify-center">
              <Head>
                <title>Check-N-In</title>
              </Head>
              <Landing />
            </div>)
    } else if (thread) {
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
    } else {
        return (<div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
        <Header />
        </div>)
    }
}

export default CheckIn;
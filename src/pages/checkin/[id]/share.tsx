import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef} from 'react';
import { OutputData } from '../../api/types';
import { useSession, signIn } from "next-auth/react";
import Link from 'next/link';
import Header from '../../../components/Header';
import Head from 'next/head';

const CheckIn: NextPage = () => {
    const {data : session} = useSession();
    const router = useRouter();
    const { id } = router.query;
    const [thread, setThread] = useState<OutputData>();
    const [textValue, setTextValue] = useState('');
    const [isAITyping, setIsAITyping] = useState(false);
    const [usernames, setUsernames] = useState<{ [email: string]: string }>({});
    const [feedback, setFeedback] = useState<boolean>(Math.random() < 0.1)
    const [feedbackValue, setFeedbackValue] = useState('');
    const chatBottomRef = useRef<HTMLDivElement | null>(null);
    const url = `https://checknin.up.railway.app/checkin/${id}/view`;

    useEffect(() => {fetchThread(id?.toString() || null)}, [session, router]);
    useEffect(() => {session && thread && (session?.user?.email == thread?.userId) && textValue == '' && (!thread.pod || thread.pod == '') && setTextValue("@Nin ")}, [thread, session])
    useEffect(() => {(session?.user?.email && getAccount(session.user.email))}, [session]);
    useEffect(() => {
        const interval = setInterval(() => {
            fetchThread(id?.toString() || null); // Reload the current page
        }, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval); // Cleanup function
      }, []);

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
        setUsernames(prevState => ({ ...prevState, [email]: data.username }))
    }

    const scrollToBottom = () => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    

    const saveReply = async (id: String, user: string, owner: string, text: string, ) => {
        const response = await fetch('/api/update-thread', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({id, user, owner, text}),
        });
        if (!response.ok) {
          const error = await response.json();
          console.error('Error saving input:', error);
        } else {
            fetchThread(id?.toString() || null);
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
        await saveReply(id as string, username, owner, textValue);
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
                await saveReply(id as string, "Nin", owner, output);
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

    const handleShare = (e: React.FormEvent) => {
        e.preventDefault();
        if (thread) {
            const data = {
                title: 'Check-N-In',
                url: url,
                text: `Check out my Check-N-In!`
            }
            if (navigator.canShare(data)) {
                navigator.share(data).catch(console.error)
            }
        }
    }

    const replyToUser = (e: React.FormEvent, user: string) => {
        e.preventDefault();
        setTextValue(`@${user} `)
    }

    const toggleLinkAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        if (thread) {
            if (thread.linkAccess) {
                thread.linkAccess = !(thread.linkAccess)
            } else {
                thread.linkAccess = true
            }
            const response = await fetch('/api/update-access', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({id, linkAccess: thread.linkAccess}),
              });
              if (!response.ok) {
                const error = await response.json();
                console.error('Error saving input:', error);
              } else {
                  fetchThread(id?.toString() || null);
              }
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

    if (session && thread && ((session?.user?.email === thread.userId) || thread.linkAccess)) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
                <Header />
                {(session?.user?.email === thread.userId) && thread.pod == "" &&
                <div className="mx-auto p-1 rounded flex justify-center items-center">
                    {<p> Access: {thread.linkAccess ? "Public" : "Private"}</p>}
                    <button
                        className="ml-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                        type="submit"
                        onClick = {(e) => {toggleLinkAccess(e)}}
                    >
                        Toggle
                    </button>
                </div>
                }
            </div>
        )
    }  else if (!session) {
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
            </div>)
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
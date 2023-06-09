import { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from 'next/router';
import { useSession, signIn } from "next-auth/react";
import { OutputData, Pod, Account } from "../../api/types";
import Header from "../../../components/Header";
import Landing from '../../../components/Landing';
import Link from 'next/link';
import Head from 'next/head';

const PodView: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [pastCheckins, setPastCheckins] = useState<OutputData[]>([]);
  const { id } = router.query;
  const [usernames, setUsernames] = useState<{ [email: string]: string }>({});
  const url = `../../?pod=${id}`
  const [pod, setPod] = useState<Pod>();
  const [account, setAccount] = useState<Account>();
  
  useEffect(() => {getPodName(router.query.id as string)}, [router]);
  useEffect(() => {fetchPastCheckins(); getUserAccount()}, [session]);

  async function getUserAccount() {
    const response = await fetch('/api/get-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: session?.user?.email
        }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error('Error saving input:', error);
        return;
    } 
    const data = await response.json();
    setAccount(data.account);
  }

  async function getPodName(podId: string) {
    const response = await fetch('/api/get-pod', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ _id: podId }),
    });
    const data = await response.json();
    setPod(data.pod);
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

  const fetchPastCheckins = () => {
    if (session) {
      fetch("/api/get-pod-checkins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pod: id }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setPastCheckins(data.checkins);
            data.checkins.map((checkin: OutputData, index: number) => getAccount(checkin.userId))
          }
        });
    }
  };

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
        title: 'Check-N-In',
        url: url,
        text: `Join my pod!`
    }
    if (navigator.canShare(data)) {
        navigator.share(data).catch(console.error)
    }
    }   

  function canAccess() {
    return session && pod && ((session?.user?.email === pod?.userId) 
    || pod.linkAccess
    || pod.shared?.includes(session?.user?.email as string))
  }

  if (session && pod && canAccess()) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
      <Header />
      <div className="container mx-auto p-4">

        <div className="mx-auto p-1 rounded flex justify-center items-center mb-4">
        {pod?.linkAccess && <button
                    className="ml-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                    type="submit"
                    onClick = {(e) => handleShare(e)}
                >
                    Invite
        </button>}
        <button
                    className="ml-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                    type="submit"
                    onClick = {() => router.push(url)}
                >
                    Post
        </button>
        {pod && session?.user?.email == pod.userId && <button
                    className="ml-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                    type="submit"
                    onClick = {() => router.push(`/pod/${id}/share`)}
                >
                    Share
        </button>}
        </div>
        <h1 className="text-white text-4xl font-bold mb-1">{pod?.name}</h1>
        <div className="flex justify-end mb-4">
</div>
        <ul className="space-y-6">
          {pastCheckins.map((checkin, index) => (
            <Link href={`../../checkin/${checkin._id}/view`} key={index}>
                <li className="bg-white bg-opacity-20 text-white p-5 rounded hover:bg-opacity-30 cursor-pointer transition duration-150 ease-in-out shadow-lg">
                <div className="flex justify-between items-center">
                    <div>
                      <div className="flex">
                      <p className="text-lg font-semibold">{usernames[checkin.userId]}</p>
                      {account && (1+checkin.replies.length-(account.notifs ? (account.notifs[checkin._id] ?? 0) : 0))>0 && (
                        <span className="h-4 w-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                          {1+checkin.replies.length-(account.notifs ? (account.notifs[checkin._id] ?? 0) : 0)}
                        </span>
                      )}
                      </div>
                      <p className="text-sm">{new Date(checkin.timeStamp).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-xl font-bold mr-2">{checkin.rating}</p>
                      <span className="text-sm">/ 10</span>
                    </div>
                  </div>
                </li>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  )} else if (!pod) {
    return (
        <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex flex-col items-center justify-center">
          <Head>
            <title>Check-N-In</title>
          </Head>
          <Landing />
        </div>)
} else if (pod) {
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

export default PodView;

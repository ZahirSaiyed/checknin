import { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from 'next/router';
import { useSession } from "next-auth/react";
import { OutputData } from "../api/types";
import Header from "../../components/Header";
import Link from 'next/link';

const PastCheckins: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [pastCheckins, setPastCheckins] = useState<OutputData[]>([]);
  const { id } = router.query;
  const [usernames, setUsernames] = useState<{ [email: string]: string }>({});
  const url = `../?pod=${id}`
  const [podName, setPodName] = useState("");
  
  useEffect(() => {getPodName(id as string)}, [router]);
  useEffect(() => {fetchPastCheckins()}, [session]);

  async function getPodName(podId: string) {
    const response = await fetch('/api/get-pod-name', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pod: podId }),
    });
    const data = await response.json();
    setPodName(data.name);
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
    setUsernames(prevState => ({ ...prevState, [email]: data.username }))
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
      <Header />
      <div className="container mx-auto p-4">

        <div className="mx-auto p-1 rounded flex justify-center items-center mb-4">
        <button
                    className="ml-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                    type="submit"
                    onClick = {(e) => handleShare(e)}
                >
                    Invite
        </button>
        <button
                    className="ml-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                    type="submit"
                    onClick = {() => router.push(url)}
                >
                    Post
        </button>
        </div>
        <h1 className="text-white text-4xl font-bold mb-1">{podName}</h1>
        <div className="flex justify-end mb-4">
</div>
        <ul className="space-y-6">
          {pastCheckins.map((checkin, index) => (
            <Link href={`../checkin/${checkin._id}`} key={index}>
                <li className="bg-white bg-opacity-20 text-white p-5 rounded hover:bg-opacity-30 cursor-pointer transition duration-150 ease-in-out shadow-lg">
                <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold">{usernames[checkin.userId]}</p>
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
  );
};

export default PastCheckins;

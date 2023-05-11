import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Account, OutputData, Pod } from '../pages/api/types';

const Header = () => {
  const { data: session } = useSession();
  const [account, setAccount] = useState<Account>();
  const [pastCheckins, setPastCheckins] = useState<OutputData[]>();
  const [checkinNotifs, setCheckinNotifs] = useState<number>(0);
  const [podNotifs, setPodNotifs] = useState<number>(0);
  const [pods, setPods] = useState<Pod[]>();

  useEffect(() => {
    if(session?.user?.email) {
      getAccount()
      fetchPastCheckins()
      getPods()
    }
  }, [session]);

  useEffect(() => {getCheckinNotifs()}, [account,pods]);


  useEffect(() => {
    if(account && pastCheckins) {
      var accountNum = 0
      var checkNum = 0
      for (var checkin of pastCheckins) {
        console.log(checkNum,accountNum)
        checkNum += 1+(checkin.replies?.length ?? 0)
        accountNum += account.notifs ? (account.notifs[checkin._id] ?? 0) : 0
        console.log(checkNum,accountNum)
      }
      setCheckinNotifs(checkNum-accountNum)
    }
  }, [account,pastCheckins]);

  async function getCheckinNotifs() {
    if(account && pods) {
      var accountNum = 0
      var podNum = 0
      for (var pod of pods) {
        var checkins = await getPodCheckins(pod._id)
        for (var checkin of checkins) {
          podNum += 1+checkin.replies?.length ?? 0
          accountNum += account.notifs ? (account.notifs[checkin._id] ?? 0) : 0
        }
      }
      setPodNotifs(podNum-accountNum)
    }
  }

  async function getPodCheckins(pod: string) {
    const response = await fetch('/api/get-pod-checkins', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            pod
        }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error('Error saving input:', error);
        return;
    } 
    const data = await response.json();
    return data.checkins;
  }

  async function getPods() {
    const response = await fetch('/api/get-pods', {
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
    setPods(data.pods);
  }

  async function getAccount() {
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

  const fetchPastCheckins = () => {
    if (session) {
      fetch("/api/get-checkins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session?.user?.email ?? "unknown" }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setPastCheckins(data.checkins);
          }
        });
    }
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-center py-4 px-6 bg-white bg-opacity-20">
      <Head>
        <title>Check-N-In</title>
      </Head>
      <div className="flex items-center space-x-4">
        <Link href="/" passHref className="flex">
          <img className="rounded-full h-8" src="/favicon.png" alt=""/>
          <button className="ml-4 text-white font-bold hover:underline focus:outline-none">Home</button>
        </Link>

        <Link href="/past-checkins" passHref className="flex">
          <button className="text-white font-bold hover:underline focus:outline-none">
            Past Checkins 
            </button>
            {checkinNotifs>0 && (
              <span className="h-4 w-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                {checkinNotifs}
              </span>
            )}
        </Link>

        <Link href="/pods" passHref className="flex">
          <button className="text-white font-bold hover:underline focus:outline-none">Pods</button>
          {podNotifs>0 && (
              <span className="h-4 w-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                {podNotifs}
              </span>
            )}
        </Link>
      </div>

      {session ? (
        <div className="flex items-center mt-4 md:mt-0">
          <Link href="/account" passHref className="flex items-center">
            {(account?.username != session.user?.email) 
            ? <p className="md:block"> {account?.username} </p>
            : <button className="ml-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"> 
              Add Username 
            </button>}
            {session.user?.image && 
            <img className="ml-4 rounded-full h-8" src={session.user.image} alt=""/>}
          </Link>
          <button
            onClick={() => signOut()}
            className="ml-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
          >
            Log Out
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-self-end mt-4 md:mt-0">
          <button
            onClick={() => signIn()}
            className="ml-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
          >
            Log In
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
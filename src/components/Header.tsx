import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Head from 'next/head';
import { useState, useEffect } from 'react';

const Header = () => {
  const { data: session } = useSession();
  const [username, setUsername] = useState("");

  useEffect(() => {(session?.user?.email && getAccount())}, [session]);

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
    setUsername(data.username);
  }

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

        <Link href="/past-checkins" passHref>
          <button className="text-white font-bold hover:underline focus:outline-none">Past Checkins</button>
        </Link>

        <Link href="/pods" passHref>
          <button className="text-white font-bold hover:underline focus:outline-none">Pods</button>
        </Link>
      </div>

      {session ? (
        <div className="flex items-center mt-4 md:mt-0">
          <Link href="/account" passHref className="flex items-center">
            {username != session.user?.email 
            ? <p className="md:block"> {username} </p>
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
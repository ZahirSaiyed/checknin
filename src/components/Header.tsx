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
    <header className="flex justify-between items-center py-4 px-6 bg-white bg-opacity-20">
      <Head>
        <title>Check-N-In</title>
      </Head>
      <nav className="flex items-center space-x-4">
        <Link href="/" passHref>
          <button className="text-white font-bold hover:underline focus:outline-none">Home</button>
        </Link>

        <Link href="/past-checkins" passHref>
          <button className="text-white font-bold hover:underline focus:outline-none">Past Checkins</button>
        </Link>
      </nav>

      
        {session ? (
          <Link href="/account" passHref className="flex items-center justify-self-end">
          {username != session.user?.email 
          ? <p> {username} </p>
          : <button className="ml-4 bg-white text-purple-500 font-bold py-1 px-2 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"> 
          Add Username 
          </button>}
          {session.user?.image && 
          <img className="ml-4 rounded-full h-8" src={session.user.image} alt=""/>}
          <button
            onClick={() => signOut()}
            className="ml-4 bg-white text-purple-500 font-bold py-1 px-2 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
          >
            Log Out
          </button>
          </Link>
        ) : (
          <div className="flex items-center justify-self-end">
          <button
            onClick={() => signIn()}
            className="ml-4 bg-white text-purple-500 font-bold py-1 px-2 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
          >
            Log In
          </button>
          </div>
        )}
      
    </header>
  );
};

export default Header;
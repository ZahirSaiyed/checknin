import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="flex justify-between items-center py-4 px-6 bg-white bg-opacity-20">
      <nav className="flex items-center space-x-4">
        <Link href="/" passHref>
          <button className="text-white font-bold hover:underline focus:outline-none">Home</button>
        </Link>

        <Link href="/past-checkins" passHref>
          <button className="text-white font-bold hover:underline focus:outline-none">Past Checkins</button>
        </Link>

        <Link href="/pods" passHref>
          <button className="text-white font-bold hover:underline focus:outline-none">Pods</button>
        </Link>
      </nav>

      <div className="justify-self-end">
        {session ? (
          <button
            onClick={() => signOut()}
            className="bg-white text-purple-500 font-bold py-1 px-2 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
          >
            Log Out
          </button>
        ) : (
          <button
            onClick={() => signIn()}
            className="bg-white text-purple-500 font-bold py-1 px-2 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
          >
            Log In
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
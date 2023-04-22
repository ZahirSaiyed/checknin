import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="flex justify-between items-center py-4 px-6 bg-white bg-opacity-20">
      <div>
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
      <nav>
      <Link href="/" passHref>
  <button className="text-white hover:underline focus:outline-none">Home</button>
</Link>

      <Link href="/past-checkins" passHref>
  <button className="ml-4 text-white hover:underline focus:outline-none">Past Checkins</button>
</Link>

      </nav>
    </header>
  );
};

export default Header;
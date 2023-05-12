import { signIn } from "next-auth/react";

const Landing = () => {
    return(
              <div className="text-center -mt-60">
                <h1 className="text-white text-5xl font-bold">tell us about your day</h1>
                <div className="max-w-[25rem] mx-auto">
                <p className="text-gray-200 text-3xl mt-4 mb-8">
                  write a check in and share it with your friends or our AI
                </p>
                </div>
                <button
                  onClick={() => signIn()}
                  className="bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                >
                  Log In
                </button>
              </div>)}

export default Landing;
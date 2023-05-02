import Header from "../components/Header";
import { NextPage } from "next";
import ShareButton from "../components/ShareButton";

const Pods: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-white text-4xl font-bold mb-6">Your Pods</h1>
        <div className="mt-4 space-y-6">
          <p className="text-white">Click the button below to generate a shareable link for your pod:</p>
          <ShareButton />
        </div>
      </div>
    </div>
  );
};

export default Pods;

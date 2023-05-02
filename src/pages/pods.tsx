import Header from "../components/Header";
import { NextPage } from "next";

const Pods: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-white text-4xl font-bold mb-6">Blank Page</h1>
        <div className="mt-4 space-y-6">
          <p className="text-white">This is a blank page.</p>
        </div>
      </div>
    </div>
  );
};

export default Pods;

import { useEffect, useState } from "react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { InputData } from "./api/types";
import Header from "../components/Header";

const PastCheckins: NextPage = () => {
  const { data: session } = useSession();
  const [pastCheckins, setPastCheckins] = useState<InputData[]>([]);

  useEffect(() => {
    fetchPastCheckins();
  }, [session]);

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
    <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-white text-4xl font-bold">Past Checkins</h1>
        <ul className="mt-4 space-y-4">
          {pastCheckins.map((checkin, index) => (
            <li
              key={index}
              className="bg-white bg-opacity-20 text-white p-4 rounded"            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">{checkin.text}</p>
                  <p className="text-sm">{new Date(checkin.timeStamp).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center">
                  <p className="text-xl font-bold mr-2">{checkin.rating}</p>
                  <span className="text-sm">/ 10</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PastCheckins;


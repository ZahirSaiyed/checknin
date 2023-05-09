import { useEffect, useState } from "react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { OutputData } from "./api/types";
import Header from "../components/Header";
import RatingChart from "../components/RatingChart";
import Link from 'next/link';

const FilterDropdown: React.FC<{ onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ onChange }) => {
  return (
    <div className="relative w-56">
      <select
        className="block appearance-none w-full bg-gray-950 bg-opacity-20 text-white py-2 pr-8 pl-4 rounded-lg leading-tight focus:outline-none"
        onChange={onChange}
      >
        <option value="date-desc">Date (Newest First)</option>
        <option value="date-asc">Date (Oldest First)</option>
        <option value="rating-desc">Rating (Highest First)</option>
        <option value="rating-asc">Rating (Lowest First)</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
        <svg className="fill-current h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M0 6l10 10 10-10z" />
        </svg>
      </div>
    </div>
  );
};

const PastCheckins: NextPage = () => {
  const { data: session } = useSession();
  const [pastCheckins, setPastCheckins] = useState<OutputData[]>([]);
  const [filter, setFilter] = useState({ type: "date", order: "desc" });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [type, order] = e.target.value.split("-");
    setFilter({ type, order });
  };

  const sortedCheckins = [...pastCheckins].sort((a, b) => {
    if (filter.type === "date") {
      const dateA = new Date(a.timeStamp).getTime();
      const dateB = new Date(b.timeStamp).getTime();
      return filter.order === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      const ratingA = a.rating;
      const ratingB = b.rating;
      return filter.order === "asc" ? ratingA - ratingB : ratingB - ratingA;
    }
  });

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
        <h1 className="text-white text-4xl font-bold mb-6">Past Checkins</h1>
        <div className="flex justify-end mb-4">
  <label htmlFor="filter" className="text-white mr-2">Filter by:</label>
  <FilterDropdown onChange={handleFilterChange} />
</div>
        {pastCheckins.length > 0 && (
          <div className="my-8 flex-grow">
            <RatingChart checkins={pastCheckins} />
          </div>
        )}
        <ul className="mt-4 space-y-6">
          {sortedCheckins.map((checkin, index) => (
            <Link href={`checkin/${checkin._id}`} key={index}>
                <li className="bg-white bg-opacity-20 text-white p-5 rounded hover:bg-opacity-30 cursor-pointer transition duration-150 ease-in-out shadow-lg">
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
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PastCheckins;

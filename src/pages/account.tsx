import { NextPage } from "next";
import Header from "../components/Header";
import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';

const PastCheckins: NextPage = () => {
    const { data: session } = useSession();
    const [isChecked, setIsChecked] = useState(false);
    const [textValue, setTextValue] = useState("");

    useEffect(() => {(session?.user?.email && getAccount())}, [session]);
    useEffect(() => {(session?.user?.email && updateAccount(isChecked))}, [isChecked]);

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
        setIsChecked(data.list);
        setTextValue(data.username);
    }

    async function updateAccount(checked: boolean) {
        if (textValue) {
            const response = await fetch('/api/update-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: session?.user?.email, 
                    username: textValue,
                    list: checked,
                }),
            });
            if (!response.ok) {
            const error = await response.json();
            console.error('Error saving input:', error);
            } 
        }}

    return ( 
        <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight mb-6">Account</h1>
          {session && 
          <div className="bg-gray-900 bg-opacity-30 p-4 rounded-lg">
            <div className="px-4 py-4 sm:p-6 flex items-center">
            <h2 className="text-lg font-medium mb-2">Username:</h2>
              <form onSubmit={(e) => {e.preventDefault(); updateAccount(isChecked)}} className="ml-4 flex">
                <input
                    className="block w-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-20 rounded p-2 focus:outline-none focus:border-white"
                    type="text"
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                />
                <button
                    className="ml-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                    type="submit"
                >
                    Update
                </button>
                </form>
            </div>
            <div className="px-4 py-5 sm:p-6 flex">
              <h2 className="text-lg font-medium mb-2">Email:</h2>
              <p className="mt-0.5 ml-4 text-base">{session.user?.email}</p>
            </div>
            <div className="px-4 py-5 sm:p-6 flex">
              <h2 className="text-lg font-medium mb-2">Join Email Newsletter?</h2>
              <input 
              checked={isChecked}
              onChange={(e) => {setIsChecked(e.target.checked)}}
              type="checkbox" 
              id="email" 
              className="ml-4 mt-1 form-checkbox h-5 w-5 text-gray-600" />
            </div>
          </div>}
        </div>
      </div>
 );
};

export default PastCheckins;
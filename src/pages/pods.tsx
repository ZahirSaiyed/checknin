import { useEffect, useState } from "react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Header from "../components/Header";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Account, Pod } from '../pages/api/types';

const PastCheckins: NextPage = () => {
  const router = useRouter()
  const { data: session } = useSession();
  const [pods, setPods] = useState<Pod[]>([]);
  const [podNotifs, setPodNotifs] = useState<number[]>()
  const [textValue, setTextValue] = useState('');
  const [allowSubmit, setAllowSubmit] = useState<boolean>(true);
  const [account, setAccount] = useState<Account>();

  useEffect(() => {
    fetchPods()
    getAccount()
  }, [session]);

  useEffect(() => {
    getCheckinNotifs();
  }, [account,pods]);

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
    setAccount(data.account);
  }

  async function getCheckinNotifs() {
    if(account && pods) {
      var notifs = []
      for (var pod of pods) {
        var checkins = await getPodCheckins(pod._id)
        var accountNum = 0
        var podNum = 0
        for (var checkin of checkins) {
          podNum += 1+(checkin.replies?.length ?? 0)
          accountNum += account.notifs ? (account.notifs[checkin._id] ?? 0) : 0
        }
        notifs.push(podNum-accountNum)
      }
      setPodNotifs(notifs)
    }
  }

  async function getPodCheckins(pod: string) {
    const response = await fetch('/api/get-pod-checkins', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            pod
        }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error('Error saving input:', error);
        return;
    } 
    const data = await response.json();
    return data.checkins;
  }

  const fetchPods = () => {
    if (session) {
      fetch("/api/get-pods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: session?.user?.email }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setPods(data.pods);
          }
        });
    }
  };

  const deleteObject = (id: string) => {
    if (session) {
      fetch("/api/delete-object", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, collection: "pods"}),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            fetchPods();
          }
        });
    }
  };

  async function saveNewPod(podName: string) {
    if (session) {
      const response = await fetch("/api/create-pod", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: session?.user?.email ?? "unknown", name: podName }),
      })
      const data = await response.json();
      if (data.success) {
            return data.id;
          };
      };
    };

  async function createPod(e: React.FormEvent)  {
    e.preventDefault();
    if (textValue == "") {
      setAllowSubmit(true);
      return;
    }
    const podId = (await saveNewPod(textValue));
    if (podId) router.push(`pod/${podId}/view`);
    else setAllowSubmit(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-white text-xl font-bold mb-6">Create new pod</h1>
        <form onSubmit={(e) => {if (allowSubmit) {setAllowSubmit(false); createPod(e)}}} className="mx-auto my-6 flex">
                    <input
                        id="reply-input"
                        className="block  bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-20 rounded p-2 focus:outline-none focus:border-white"
                        type="text"
                        placeholder="New pod name..."
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                    />
                    {allowSubmit && <button
                        className="ml-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                        type="submit"
                    >
                        Create
                    </button>}
                </form>
        <h1 className="text-white text-4xl font-bold">Pods</h1>
        <div className="flex justify-end mb-4">
</div>
        <ul className="mt-4 space-y-6">
          {pods.map((pod, index) => (
            <div onClick={() => router.push(`pod/${pod._id}/view`)} key={index} className="cursor-pointer">
                <li className="bg-white bg-opacity-20 text-white p-5 rounded hover:bg-opacity-30 cursor-pointer transition duration-150 ease-in-out shadow-lg">
                <div className="flex justify-between items-center">
                    <div className="flex">
                      <p className="text-lg font-semibold">{pod.name}</p>
                      {podNotifs && podNotifs[index]>0 && (
                        <span className="h-4 w-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                          {podNotifs[index]}
                        </span>
                      )}
                    </div>
                    {pod.userId == session?.user?.email &&
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteObject(pod._id)
                          }
                        }
                        className="ml-4 bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                      >
                        Delete
                      </button>}
                  </div>
                </li>
                </div>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PastCheckins;

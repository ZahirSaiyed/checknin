// pages/pods.tsx
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const Pods = () => {
  const { data: session } = useSession();
  const [pods, setPods] = useState([]);
  const [podName, setPodName] = useState('');

  // Fetch pods when the session is available
  useEffect(() => {
    if (session) {
      fetchPods();
    }
  }, [session]);

  async function fetchPods() {
    try {
      const response = await fetch('/api/get-pods', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setPods(data.pods);
    } catch (error) {
      console.error('Error fetching pods:', error);
    }
  }
  

  async function createPod() {
    try {
      const response = await fetch('/api/create-pod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ name: podName }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setPods([...pods, data.pod]);
      setPodName('');
    } catch (error) {
      console.error('Error creating pod:', error);
    }
  }
  
  // In the return statement
  <form onSubmit={(e) => { e.preventDefault(); createPod(); }}>
    <input type="text" value={podName} onChange={(e) => setPodName(e.target.value)} placeholder="Pod Name" />
    <button type="submit">Create Pod</button>
  </form>
  

  async function generateInvitation(podId: string) {
    try {
      const response = await fetch('/api/invite-to-pod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ podId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    const invitationLink = `${window.location.origin}/redeem-invitation/${data.invitationId}`;
    navigator.clipboard.writeText(invitationLink);
    alert('Invitation link copied to clipboard');
  } catch (error) {
    console.error('Error generating invitation:', error);
  }
}
       
  

  return (
<ul>
  {pods.map((pod) => (
    <li key={pod.id}>
      {pod.name}
      <button onClick={() => generateInvitation(pod.id)}>Generate Invitation Link</button>
    </li>
  ))}
</ul>
  );
};

export default Pods;

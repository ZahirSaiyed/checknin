import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

const RedeemInvitationPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (router && router.query && router.query.invitationId) {
      setInvitationId(router.query.invitationId as string);
    }
  }, [router]);

  useEffect(() => {
    if (invitationId && session) {
      const redeemInvitation = async () => {
        const response = await fetch('/api/redeem-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session?.user?.email, // Get user's ID from session
            invitationId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setMessage('You have successfully joined the pod.');
          // Redirect user to the pods page or another page after joining the pod
        } else {
          setMessage('Failed to join the pod. Please try again.');
        }
      };

      redeemInvitation();
    }
  }, [invitationId, session]);

  return (
    <div>
      <h1>Redeem Invitation</h1>
      <p>{message}</p>
    </div>
  );
};

export default RedeemInvitationPage;

// pages/redeem-invitation/[invitationId].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const RedeemInvitation = () => {
  const router = useRouter();
  const { invitationId } = router.query;
  const { data: session } = useSession();

  const userId = session?.user?.email || session?.user?.email || ''; // Replace this with the actual user's ID
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    const redeemInvitation = async () => {
      try {
        const response = await fetch('/api/redeem-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ invitationId, userId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setStatusMessage('Invitation redeemed successfully!');
      } catch (error) {
        setStatusMessage((error as Error).message);
      }
    };

    if (invitationId && userId) {
      redeemInvitation();
    }
  }, [invitationId, userId]);

  return (
    <div>
           <h1>Redeem Invitation</h1>
      <p>{statusMessage}</p>
    </div>
  );
};

export default RedeemInvitation;


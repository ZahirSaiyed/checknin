import { NextPage } from 'next';
import { useRouter } from 'next/router';

const CheckIn: NextPage = () => {
    const router = useRouter();
    const { id } = router.query;
    return (
        <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
            <p>
                Post: {id}
            </p>
        </div>
    )
}

export default CheckIn;
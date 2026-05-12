import { cookies } from 'next/headers';
import VipLoginForm from '../../../../components/VipLogin';
import VipDashboard from '../../../../components/VipDashboard';

export default async function VipManagement() {
    const cookieStore = await cookies();
    const hasToken = cookieStore.has('access_token');

    return (
        <div className="p-8">
            {hasToken ? (
                <div>
                    <VipDashboard />
                </div>
            ) : (
                <VipLoginForm />
            )}
        </div>
    );
}
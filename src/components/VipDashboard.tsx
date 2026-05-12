'use client';

import { useEffect, useState } from "react";
import { getVipUserMe, sendRequest, vipLogout } from "@/libs/actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";


interface Request {
    id: number;
    title: string;
    status: string;
}

interface User {
    id: number;
    name: string;
    credit: number;
    requests: Request[];
}

export default function VipDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const router = useRouter();

    const handleSendRequest = async () => {
        const res = await sendRequest(amount);
        if (res && res.status >= 200 && res.status < 300) {
            toast.success("تم إرسال الطلب بنجاح");
            const updatedUser = await getVipUserMe();
            setUser(updatedUser);
            setAmount(0);
        } else {
            toast.error(res.error);
        }
    };

    const handleLogout = async () => {
        vipLogout();
        router.push('/');
    };

    useEffect(() => {
        getVipUserMe().then((res) => {
            setUser(res);
        });
    }, []);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="flex justify-around flex-wrap gap-8">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg font-bold">{user.name}</h1>
                    </div>
                    <p>الرصيد: {user.credit} </p>
                    <div>
                        <input className="border mx-2 p-2 rounded" type="text" placeholder="قيمة الطلب" onChange={(e) => setAmount(Number(e.target.value))} />
                        <button className="bg-green-500 text-white px-4 m-2 py-2 rounded" onClick={handleSendRequest}>طلب جديد</button>
                    </div>

                </div>
                <div className="flex flex-col gap-4 border border-gray-200 p-4 rounded min-w-[300px]  max-h-[400px] overflow-y-scroll">
                    <h1 className="text-lg font-bold">تاريخ الطلبات</h1>
                    <p>{user.requests.length} طلبات</p>
                    {user.requests.map((request: any) => (
                        <div key={request.id}>
                            <div className="flex gap-2">
                                <p>{request.amount}</p>
                                <p className={`${getStatusColor(request.status)} p-1 rounded text-white text-xs`}>
                                    {getStatusLabel(request.status)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="my-4 border sm:w-1/4 p-4 flex justify-around border-red-500 rounded-md">
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    onClick={handleLogout}
                >
                    تسجيل الخروج
                </button>
            </div>
        </div>
    );
}

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'PENDING':
            return 'في انتظار الرد';
        case 'APPROVED':
            return 'تم قبول الطلب';
        case 'REJECTED':
            return 'تم رفض الطلب';
        default:
            return status;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'PENDING':
            return 'bg-yellow-600';
        case 'APPROVED':
            return 'bg-green-600';
        case 'REJECTED':
            return 'bg-red-600';
        default:
            return 'bg-gray-500';
    }
};

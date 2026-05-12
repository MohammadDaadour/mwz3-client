'use client';
import { useEffect, useState } from "react";
import { getVipUserDetails, updateUserCredit, approveRequest, rejectRequest } from "../libs/actions";

interface Request {
    id: number;
    amount: number;
    status: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    credit: number;
    requests: Request[];
}

export default function VipUserDetails({ id }: { id: number }) {
    const [user, setUser] = useState<User | null>(null);
    const [newCredit, setNewCredit] = useState<number>(0);
    const [isEditing, setIsEditing] = useState(false);
    useEffect(() => {
        const fetchUser = async () => {
            const user = await getVipUserDetails(id);
            setUser(user);
            if (user) {
                setNewCredit(user.credit);
            }
        };
        fetchUser();
    }, [id]);

    const handleUpdateCredit = async () => {
        const result = await updateUserCredit(id, newCredit);
        if (result.status === 200) {
            const updatedUser = await getVipUserDetails(id);
            setUser(updatedUser);
            setIsEditing(false);
        }
    };

    const handleApproveRequest = async (requestId: number) => {
        const result = await approveRequest(id, requestId);
        if (result.status === 200) {
            const updatedUser = await getVipUserDetails(id);
            setUser(updatedUser);
        }
    };

    const handleRejectRequest = async (requestId: number) => {
        const result = await rejectRequest(id, requestId);
        if (result.status === 200) {
            const updatedUser = await getVipUserDetails(id);
            setUser(updatedUser);
        }
    };

    return (
        <div className="text-md">
            <p>{user?.name}</p>
            <p className="font-semibold">{user?.email}</p>
            <div className="flex justify-between mt-4">
                <p className="font-semibold">{user?.credit} رصيد</p>
                <button className="bg-amber-700 text-white px-4 py-2 rounded-md text-sm" onClick={() => setIsEditing(!isEditing)}>تعديل الرصيد</button>
            </div>
            {isEditing && (
                <div className="flex justify-between mt-4">
                    <input type="number" value={newCredit} onChange={(e) => setNewCredit(Number(e.target.value))} />
                    <button className="bg-amber-700 text-white px-4 py-2 rounded-md text-sm" onClick={handleUpdateCredit}>تأكيد</button>
                </div>
            )}
            <div className="mt-4">
                <h3 className="font-semibold">{user?.requests?.length || 0} طلبات</h3>
                <ul className="mt-2 max-h-[200px] overflow-y-scroll">
                    {user?.requests?.map((request) => (
                        <div key={request.id} className="flex justify-between border border-gray-700 p-2">
                            <p>(طلب رقم {request.id}) {request.amount}</p>
                            {
                                request.status === 'PENDING' ? (
                                    <>
                                        <button className="bg-green-700 text-white px-4 py-2 rounded-md text-sm mx-2" onClick={() => handleApproveRequest(request.id)}>تأكيد</button>
                                        <button className="bg-red-700 text-white px-4 py-2 rounded-md text-sm mx-2" onClick={() => handleRejectRequest(request.id)}>رفض</button>
                                    </>
                                ) : (
                                    <p className={`${request.status === 'APPROVED' ? 'text-green-700' : 'text-red-700'} mx-2`}>{request.status}</p>
                                )
                            }
                        </div>
                    ))}
                </ul>
            </div>
        </div>
    );
}
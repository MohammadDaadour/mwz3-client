import React, { useState, useEffect } from 'react';
import { getAllVipUsers } from '@/libs/actions';

interface VipUser {
    id: number,
    name: string;
    email: string;
    password: string;
    credit: number;
}

export default function VipUsersList({ id, setUserId }: { id: number, setUserId: (id: number) => void }) {
    const [users, setUsers] = useState<VipUser[]>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function getUsers() {
            try {
                setLoading(true);
                const result = await getAllVipUsers();
                setUsers(result);
                console.log('users: ', users);
            }
            catch (err) {
                console.log(err)
            }
            finally {
                setLoading(false);
            }
        }
        getUsers();
    }, [])

    return (
        <div>
            <ul>
                {users ? users.map((user) => (
                    <li
                        className='p-4 border my-2 rounded-md cursor-pointer hover:bg-gray-500'
                        key={user.id}
                        onClick={() => setUserId(user.id)}
                    >
                        {user.name}
                    </li>
                )) : <p>no users found.</p>}
            </ul>
        </div>
    )
}


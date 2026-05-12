'use client';
import { useState } from "react";
import { loginVipUser } from "../libs/actions";
import toast from "react-hot-toast";

export default function VipLoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await loginVipUser(email, password);

        if (res && res.status >= 200 && res.status < 300) {
            document.cookie = `access_token=${res.data.access_token}; path=/; max-age=3600; SameSite=Lax`;
            window.location.reload();
        } else {
            toast.error("الرجاء التأكد من بياناتك");
        }
    };

    return (
        <form className="flex flex-col items-center gap-4 p-4 rounded" onSubmit={handleLogin}>
            <div className="flex flex-col gap-4 xl:w-1/3  w-full shadow-xl p-4 rounded">
                <input className="p-2 border border-gray-400 rounded" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className="p-2 border border-gray-400 rounded" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button className="p-2 bg-amber-700 text-white rounded hover:bg-amber-800" type="submit">Login</button>
            </div>
        </form>
    );
}
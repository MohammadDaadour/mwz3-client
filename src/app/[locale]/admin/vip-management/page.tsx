'use client'

import CreateVipUserForm from "@/components/CreateVipUserForm"
import VipUserDetails from "@/components/VipUserDetails";
import VipUsersList from "@/components/VipUsersList"
import { useState } from "react"

export default function VipManagement() {
  const [userId, setUserId] = useState<number>(-1);

  return <div className="flex mt-16 flex-wrap justify-center">
    <div className="flex flex-col items-center justify-center">
      <button onClick={() => setUserId(0)} className="p-4 my-4 border rounded-md bg-amber-700 text-white">أضف مستخدمًا جديدًا</button>
      <VipUsersList id={userId} setUserId={setUserId} />
    </div>
    <div className="border rounded-md p-4 flex-1 min-w-[300px] min-h-[300px] mx-0 sm:mx-16 my-8 sm:my-0 flex justify-center items-center text-xl font-bold">
      {
        userId === 0 ? <CreateVipUserForm /> :
          userId > 0 ? <VipUserDetails id={userId} /> :
            <p>اختر مستخدمًا</p>
      }
    </div>
  </div>

}
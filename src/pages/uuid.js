import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function UUIDPage() {
  const [uuid, setUuid] = useState("");

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FFFEFA] text-[#28251B]">

      {/* Top-left Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Image src="/logomark.svg" alt="Prism Logo" width={40} height={40} />
        <span className="text-[#A4800A] text-[1.8rem] font-bold leading-[40px]">
          Prism
        </span>
      </div>

      {/* Logo & Title */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <Image src="/prisimLogo.png" alt="Prism Logo" width={284} height={176} priority />
        <h1 className="text-4xl font-bold mt-2">Prism</h1>
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-semibold">Sign In</h2>
      <p className="text-md text-gray-600 mt-1">
        Please enter your UUID and 4-digit PIN to continue.
      </p>

      {/* UUID Input Field */}
      <input
        type="text"
        value={uuid}
        onChange={(e) => setUuid(e.target.value)}
        className="mt-4 w-80 p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-yellow-400 outline-none"
        placeholder="User ID"
      />

      {/* Continue Button */}
      <Link href={`/pin?uuid=${uuid}`} onClick={() => localStorage.setItem("uuid", uuid)}>
        <button
          className="mt-5 w-80 px-6 py-3 bg-[#FFCD29] text-black text-lg font-semibold rounded-lg shadow-md hover:bg-yellow-400 transition disabled:opacity-50"
          disabled={!uuid}
        >
          Continue
        </button>
      </Link>
    </div>
  );
}

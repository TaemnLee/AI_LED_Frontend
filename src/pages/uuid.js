import { useState } from "react";
import Link from "next/link";

export default function UUIDPage() {
  const [uuid, setUuid] = useState("");

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-800 text-white">
      <h1 className="text-2xl">Enter Your UUID</h1>
      <input
        type="text"
        value={uuid}
        onChange={(e) => setUuid(e.target.value)}
        className="mt-4 p-2 text-black rounded"
        placeholder="Enter UUID..."
      />
      <Link href={`/pin?uuid=${uuid}`}>
        <button className="mt-5 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md">
          Next
        </button>
      </Link>
    </div>
  );
}

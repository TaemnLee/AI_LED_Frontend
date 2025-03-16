import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-blue-500 text-white text-3xl font-bold">
      AI LED Control
      <Link href="/uuid">
        <button className="mt-5 px-4 py-2 bg-white text-blue-500 rounded-lg shadow-md">
          Get Started
        </button>
      </Link>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FFFEFA] text-[#28251B] relative">
      {/* Top-left Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Image src="/logomark.svg" alt="Prism Logo" width={40} height={40} />
        <span className="text-[#A4800A] text-[1.8rem] font-bold leading-[40px]">
          Prism
        </span>
      </div>
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <Image src="/prisimLogo.png" alt="Prism Logo" width={284} height={176} priority />
        <h1 className="text-4xl font-bold mt-2">Prism</h1>
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-semibold text-center px-6">
        Get Started with Prism Today
      </h2>
      <p className="text-lg text-center text-gray-600 mt-2">
        Transform your LED strip into an AI-driven smart experience.
      </p>

      {/* Get Started Button */}
      <Link href="/uuid">
        <button className="mt-6 px-6 py-3 bg-[#FFCD29] text-black text-lg font-semibold rounded-lg shadow-md hover:bg-yellow-400 transition">
          Get Started
        </button>
      </Link>
    </div>
  );
}

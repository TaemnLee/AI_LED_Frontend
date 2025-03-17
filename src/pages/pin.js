import { useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

export default function PINPage() {
  const router = useRouter();
  const { uuid } = router.query;
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Allow only numbers
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Move to next input field
    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleSubmit = (e) => {
    const pinValue = pin.join(""); // Convert array to string
    if (pinValue.length !== 4) {
      setError("❌ PIN must be exactly 4 digits.");
      e.preventDefault(); // Prevent navigation if invalid
    } else {
      setError("");
      
      // ✅ Save to localStorage
      localStorage.setItem("uuid", uuid);
      localStorage.setItem("pin", pinValue);
      
      // ✅ Navigate to recording page
      router.push(`/recording?uuid=${uuid}&pin=${pinValue}`);
    }
  };
  

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
      <h2 className="text-2xl font-semibold">Enter PIN</h2>
      <p className="text-md text-gray-600 mt-1">
        Enter the 4-digit PIN sent to your registered device.
      </p>

      {/* 4-Digit PIN Inputs */}
      <div className="flex gap-4 mt-4">
        {pin.map((digit, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={digit}
            ref={inputRefs[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-center text-2xl font-semibold border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-yellow-400 outline-none"
          />
        ))}
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* Verify Button */}
      <Link href={`/recording?uuid=${uuid}&pin=${pin.join("")}`} onClick={handleSubmit} className="w-full flex justify-center">
        <button
          className="mt-5 w-80 px-6 py-3 bg-[#FFCD29] text-black text-lg font-semibold rounded-lg shadow-md hover:bg-yellow-400 transition disabled:opacity-50"
          disabled={pin.join("").length !== 4}
        >
          Verify
        </button>
      </Link>
    </div>
  );
}

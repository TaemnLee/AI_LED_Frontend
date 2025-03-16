import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function PINPage() {
  const router = useRouter();
  const { uuid } = router.query;
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const validatePIN = (pin) => {
    const pinRegex = /^\d{4}$/;
    return pinRegex.test(pin);
  };

  const handleNext = (e) => {
    if (!validatePIN(pin)) {
      setError("❌ PIN must be exactly 4 digits.");
      e.preventDefault(); // Prevent navigation if PIN is invalid
    } else {
      setError("");
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-2xl">Enter Your PIN</h1>
      <input
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        className="mt-4 p-2 text-black rounded"
        placeholder="Enter PIN..."
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <Link href={`/recording?uuid=${uuid}&pin=${pin}`} onClick={handleNext}>
        <button
          className={`mt-5 px-4 py-2 ${
            error ? "bg-gray-500 cursor-not-allowed" : "bg-green-500"
          } text-white rounded-lg shadow-md`}
        >
          Continue
        </button>
      </Link>
    </div>
  );
}

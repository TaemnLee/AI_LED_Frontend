import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

export default function PINPage() {
  const router = useRouter();
  const { uuid } = router.query;
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    setMounted(true);

    // Focus first input when component mounts
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
    // Run this effect only once when the component mounts
  }, []); // Removed `inputRefs` from the dependency array

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Allow only numbers
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Move to the next input field only if the current one is filled
    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (pin[index]) {
        const newPin = [...pin];
        newPin[index] = ""; // Clear the current input
        setPin(newPin);
      } else if (index > 0) {
        inputRefs[index - 1].current.focus(); // Move to the previous input
      }
    }
  };

  const handleSubmit = (e) => {
    const pinValue = pin.join(""); // Convert array to string
    if (pinValue.length !== 4) {
      setError("PIN must be exactly 4 digits");
      e.preventDefault(); // Prevent navigation if invalid
    } else {
      setError("");

      // Save to localStorage
      localStorage.setItem("uuid", uuid);
      localStorage.setItem("pin", pinValue);

      // Navigate to recording page
      router.push(`/recording?uuid=${uuid}&pin=${pinValue}`);
    }
  };

  return (
    <div className="page-container">
      <div className="light-grid"></div>

      {/* Header Logo */}
      <div className="header w-full flex items-center justify-between">
        <div className="logo-container">
          <div className="logo-glow">
            <Image src="/logomark.svg" alt="Prism Logo" width={40} height={40} />
          </div>
          <span className="brand-name">Prism</span>
        </div>

        <Link href="/uuid" className="text-sm text-muted hover:text-white transition-colors">
          Back
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center max-w-md w-full px-6 mt-16">
        {/* Logo */}
        <div
          className={`floating-element flex flex-col items-center gap-3 mb-10 transition-all duration-700 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image src="/prisimLogo.png" alt="Prism Logo" width={180} height={112} priority className="drop-shadow-2xl" />
          <div className="led-strip-visual w-48"></div>
        </div>

        {/* PIN Form */}
        <div
          className={`w-full space-y-8 transition-all duration-700 delay-100 ${mounted ? "opacity-100" : "opacity-0"}`}
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold gradient-text">Enter PIN</h2>
            <p className="text-muted">Enter the predefined 4-digit PIN of your device.</p>
          </div>

          {/* 4-Digit PIN Inputs */}
          <div className="flex justify-center gap-4 my-8">
            {pin.map((digit, index) => (
              <div key={index} className="gradient-border">
                <input
                  type="text"
                  maxLength="1"
                  value={digit}
                  ref={inputRefs[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="pin-input"
                  aria-label={`PIN digit ${index + 1}`}
                  style={{
                    borderRadius: "calc(var(--radius) - 1px)",
                    width: "3.8rem",
                    height: "4.2rem",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && <p className="text-center text-error text-sm -mt-4">{error}</p>}

          {/* Continue Button */}
          <Link href={`/recording?uuid=${uuid}&pin=${pin.join("")}`} onClick={handleSubmit}>
            <button
              className={`btn btn-primary w-full ${pin.join("").length !== 4 ? "btn-disabled" : ""}`}
              disabled={pin.join("").length !== 4}
            >
              Continue
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

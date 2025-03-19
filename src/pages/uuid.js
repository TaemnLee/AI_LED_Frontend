import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

export default function UUIDPage() {
  const [uuid, setUuid] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // Check if UUID and PIN exist in localStorage
    const storedUuid = localStorage.getItem("uuid");
    const storedPin = localStorage.getItem("pin");
    
    if (storedUuid && storedPin) {
      // Redirect to recording page if both UUID and PIN exist
      router.push("/recording");
    }
  }, [router]);

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

        <Link href="/" className="text-sm text-muted hover:text-white transition-colors">
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

        {/* Sign In Form */}
        <div
          className={`w-full space-y-8 transition-all duration-700 delay-100 ${mounted ? "opacity-100" : "opacity-0"}`}
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold gradient-text">Sign In</h2>
            <p className="text-muted">Enter your unique device identifier to continue.</p>
          </div>

          {/* Input and Button Container - Redesigned */}
          <div className="w-full space-y-4">
            {/* UUID Input Field - Fixed styling */}
            <div className="w-full">
              <input
                type="text"
                value={uuid}
                onChange={(e) => setUuid(e.target.value)}
                className="input-field w-full bg-background-alt border border-border focus:border-primary-glow focus:ring-2 focus:ring-primary-glow/25 rounded-lg"
                placeholder="Enter your User ID"
                aria-label="User ID"
              />
            </div>

            {/* Continue Button - Now separated from the input */}
            <div className="w-full">
              <button 
                onClick={() => {
                  if (!uuid) return;
                  localStorage.setItem("uuid", uuid);
                  router.push("/pin");
                }}
                className={`btn btn-primary w-full ${!uuid ? "btn-disabled" : ""}`} 
                disabled={!uuid}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

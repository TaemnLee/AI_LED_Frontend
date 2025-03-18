import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

export default function RecordingPage() {
  const router = useRouter();
  const [uuid, setUuid] = useState("");
  const [pin, setPin] = useState("");
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [surpriseLoading, setSurpriseLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [recommendation, setRecommendation] = useState("");
  const [isConnected, setIsConnected] = useState(null);
  const [systemMessage, setSystemMessage] = useState("Ready to record! 🎙️");
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);
  const [visualizer, setVisualizer] = useState([]);

  // Retrieve UUID & PIN from localStorage
  useEffect(() => {
    setMounted(true);

    const storedUuid = localStorage.getItem("uuid");
    const storedPin = localStorage.getItem("pin");

    if (storedUuid && storedPin) {
      setUuid(storedUuid);
      setPin(storedPin);
    } else {
      router.push("/uuid");
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [router]);

  // Recording timer and visualizer effect
  useEffect(() => {
    if (recording) {
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);

        // Generate random audio visualizer heights
        setVisualizer(Array.from({ length: 12 }, () => Math.floor(Math.random() * 50) + 20));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setVisualizer([]);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording]);

  // Automatically check WebSocket connection on page load
  useEffect(() => {
    if (!uuid) return;

    const checkWebSocketConnection = async () => {
      try {
        setSystemMessage("Checking connection status...");

        const response = await fetch("https://flzer6zwt3.execute-api.us-east-1.amazonaws.com/dev/is_connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid }),
        });

        const data = await response.json();

        if (response.ok) {
          setIsConnected(data.connected);
          setSystemMessage(data.connected ? "✅ Connected to Arduino!" : "❌ Not Connected! Check your device.");
        } else {
          setIsConnected(false);
          setSystemMessage("❌ Connection check failed");
        }
      } catch (err) {
        setIsConnected(false);
        setSystemMessage("❌ Connection error. Check network.");
      }
    };

    checkWebSocketConnection();
  }, [uuid]);

  // Logout function (Clears UUID & PIN)
  const handleLogout = () => {
    localStorage.removeItem("uuid");
    localStorage.removeItem("pin");
    router.push("/");
  };

  // Format recording time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Function to handle recording
  const toggleRecording = async () => {
    if (recording) {
      if (mediaRecorder) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
      setRecording(false);
      setSystemMessage("Recording saved! 📁 Ready to send?");
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        const audioChunks = [];
        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        recorder.onstop = () => {
          const audioFile = new Blob(audioChunks, { type: "audio/wav" });
          setAudioBlob(audioFile);
          setSystemMessage("Recording saved! 📁 You can send it now.");
        };

        recorder.start();
        setRecording(true);
        setSystemMessage("Recording... 🎙️ Press again to stop.");
      } catch (err) {
        setError("❌ Microphone access denied.");
        setSystemMessage("❌ Microphone access denied.");
      }
    }
  };

  // Convert Blob to Base64
  const convertBlobToBase64 = async (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        resolve(reader.result.split(",")[1]); // Remove Data URL prefix
      };
      reader.onerror = reject;
    });
  };

  // Function to send audio
  const sendAudio = async () => {
    if (!uuid || !pin) {
      setError("❌ UUID and PIN are required.");
      return;
    }

    if (!audioBlob) {
      setError("❌ No audio recorded!");
      setSystemMessage("❌ Record audio before sending!");
      return;
    }

    setLoading(true);
    setError("");
    setApiResponse(null);
    setRecommendation("");
    setSystemMessage("Uploading audio... ⏳");

    try {
      const base64Audio = await convertBlobToBase64(audioBlob);
      const response = await fetch("https://flzer6zwt3.execute-api.us-east-1.amazonaws.com/dev/audio_to_ai/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid, pin, file: base64Audio }),
      });

      const data = await response.json();

      if (response.ok) {
        setApiResponse(data);
        // Extract recommendation from response if available
        if (data.recommendation) {
          setRecommendation(data.recommendation);
        } else if (data.complete_data && data.complete_data.recommendation) {
          setRecommendation(data.complete_data.recommendation);
        }
        setSystemMessage("✅ Audio processed successfully!");
      } else {
        setError(`❌ Error: ${data.message || "Invalid UUID or PIN."}`);
        setSystemMessage(`❌ Error: ${data.message || "Server error"}`);
      }
    } catch (err) {
      setError("❌ Server error. Please try again.");
      setSystemMessage("❌ Connection error. Please try again.");
    }

    setLoading(false);
  };

  // Function to trigger "Surprise Me"
  const surpriseMe = async () => {
    if (!uuid || !pin) {
      setError("❌ UUID and PIN are required.");
      return;
    }

    setSurpriseLoading(true);
    setError("");
    setApiResponse(null);
    setRecommendation("");
    setSystemMessage("🔮 Generating surprise effect...");

    try {
      const response = await fetch("https://flzer6zwt3.execute-api.us-east-1.amazonaws.com/dev/pattern_to_ai/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid, pin }),
      });

      const data = await response.json();

      if (response.ok) {
        setApiResponse(data);
        // Extract recommendation from response if available
        if (data.recommendation) {
          setRecommendation(data.recommendation);
        } else if (data.complete_data && data.complete_data.recommendation) {
          setRecommendation(data.complete_data.recommendation);
        }
        setSystemMessage("🎉 Surprise effect applied!");
      } else {
        setError(`❌ Error: ${data.message || "Invalid UUID or PIN."}`);
        setSystemMessage(`❌ Error: ${data.message || "Server error"}`);
      }
    } catch (err) {
      setError("❌ Server error. Please try again.");
      setSystemMessage("❌ Connection error. Please try again.");
    }

    setSurpriseLoading(false);
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

        <button
          onClick={handleLogout}
          className="text-sm text-muted hover:text-white transition-colors flex items-center gap-1"
        >
          <span>Logout</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div
        className={`flex flex-col items-center w-full max-w-md px-6 pt-6 mt-10 transition-all duration-700 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <h1 className="text-3xl font-bold mb-2 gradient-text">Control Panel</h1>

        <div className="led-strip-visual w-64 mb-6"></div>

        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className={`status-indicator ${isConnected ? "status-connected" : "status-disconnected"}`}></span>
          <p className="text-sm">{isConnected ? "Connected to Device" : "Not Connected"}</p>
        </div>

        {/* System Message Box */}
        <div className="system-message mb-8">
          <p>{systemMessage}</p>
        </div>

        {/* Audio Visualizer (only shows when recording) */}
        {recording && (
          <div className="flex items-end justify-center h-16 gap-1 mb-4 w-64">
            {visualizer.map((height, index) => (
              <div
                key={index}
                className="w-3 bg-gradient-to-t from-purple-600 to-indigo-400 rounded-t-sm"
                style={{
                  height: `${height}%`,
                  transition: "height 0.1s ease-in-out",
                }}
              ></div>
            ))}
          </div>
        )}

        {/* Recording Timer */}
        {recording && <div className="text-xl font-mono mb-4 text-primary-glow">{formatTime(recordingTime)}</div>}

        {/* Record Button */}
        <button
          onClick={toggleRecording}
          className={`record-btn mb-10 ${recording ? "record-btn-recording" : "record-btn-idle"}`}
          aria-label={recording ? "Stop recording" : "Start recording"}
        >
          {recording ? "⏹️" : "🎤"}
        </button>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
          {/* Send Audio Button */}
          <button
            className={`btn btn-secondary ${loading || !audioBlob ? "btn-disabled" : ""}`}
            onClick={sendAudio}
            disabled={loading || !audioBlob}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <span>📤 Send Audio Command</span>
            )}
          </button>

          {/* Surprise Me Button */}
          <button
            className={`btn btn-accent ${surpriseLoading ? "btn-disabled" : ""}`}
            onClick={surpriseMe}
            disabled={surpriseLoading}
          >
            {surpriseLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                <span>Generating...</span>
              </div>
            ) : (
              <span>✨ Surprise Me</span>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && <div className="mt-4 text-error text-sm px-4 py-2 rounded-md bg-opacity-10 bg-red-500">{error}</div>}

        {/* AI Recommendation Card */}
        {recommendation && (
          <div className="recommendation-card mt-6 w-full max-w-xs">
            <div className="glassmorphism p-4 rounded-lg border border-primary-glow/30 shadow-glow">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-glow to-accent-glow flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 .75a8.25 8.25 0 00-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 00.577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.75 6.75 0 111.5 0v4.661c0 .326.277.585.6.544.364-.047.722-.112 1.074-.195a.75.75 0 00.577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0012 .75z" />
                    <path
                      fillRule="evenodd"
                      d="M9.013 19.9a.75.75 0 01.877-.597 11.319 11.319 0 004.22 0 .75.75 0 11.28 1.473 12.819 12.819 0 01-4.78 0 .75.75 0 01-.597-.876zM9.75 7.5a.75.75 0 000 1.5h1.5v1.5a.75.75 0 001.5 0V9h1.5a.75.75 0 000-1.5h-1.5V6a.75.75 0 00-1.5 0v1.5h-1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-primary-glow">Light Recommendation</h3>
              </div>
              <div className="pl-10">
                <p className="text-sm leading-relaxed text-white">{recommendation}</p>
              </div>
              <div className="mt-3 pl-10">
                <div className="animated-glow-border"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .recommendation-card {
          animation: fadeIn 0.5s ease-out;
        }

        .animated-glow-border {
          height: 2px;
          background: linear-gradient(
            90deg,
            rgba(99, 102, 241, 0.3) 0%,
            rgba(168, 85, 247, 0.8) 50%,
            rgba(99, 102, 241, 0.3) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite linear;
          border-radius: 4px;
        }

        @keyframes shimmer {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: -100% 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .shadow-glow {
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.15), 0 0 30px rgba(168, 85, 247, 0.1);
        }
      `}</style>
    </div>
  );
}

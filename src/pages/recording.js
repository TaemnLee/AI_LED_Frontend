import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

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
  const [isConnected, setIsConnected] = useState(null);
  const [systemMessage, setSystemMessage] = useState("Ready to record! 🎙️");
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // Retrieve UUID & PIN from localStorage
  useEffect(() => {
    const storedUuid = localStorage.getItem("uuid");
    const storedPin = localStorage.getItem("pin");

    if (storedUuid && storedPin) {
      setUuid(storedUuid);
      setPin(storedPin);
    } else {
      router.push("/uuid");
    }
  }, [router]);

  // Automatically check WebSocket connection on page load
  useEffect(() => {
    if (!uuid) return;

    const checkWebSocketConnection = async () => {
      try {
        const response = await fetch(
          "https://flzer6zwt3.execute-api.us-east-1.amazonaws.com/dev/is_connect",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uuid }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          setIsConnected(data.connected);
          setSystemMessage(data.connected ? "✅ Connected to Arduino!" : "❌ Not Connected!");
        } else {
          setIsConnected(false);
        }
      } catch (err) {
        setIsConnected(false);
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

  // Function to handle recording
  const toggleRecording = async () => {
    if (recording) {
      if (mediaRecorder) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
      setRecording(false);
      setSystemMessage("Recording stopped. 🎤 Ready to send?");
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
        setSystemMessage("Recording... 🎙️ Press stop when done.");
      } catch (err) {
        setError("❌ Microphone access denied.");
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
      return;
    }

    setLoading(true);
    setError("");
    setApiResponse(null);
    setSystemMessage("Uploading audio... ⏳");

    try {
      const base64Audio = await convertBlobToBase64(audioBlob);
      const response = await fetch(
        "https://flzer6zwt3.execute-api.us-east-1.amazonaws.com/dev/audio_to_ai/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid, pin, file: base64Audio }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setApiResponse(data);
        setSystemMessage("✅ Audio sent successfully! AI is processing...");
      } else {
        setError(`❌ Error: ${data.message || "Invalid UUID or PIN."}`);
      }
    } catch (err) {
      setError("❌ Server error. Please try again.");
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
    setSystemMessage("🔮 Generating surprise effect...");

    try {
      const response = await fetch(
        "https://flzer6zwt3.execute-api.us-east-1.amazonaws.com/dev/pattern_to_ai/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid, pin }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setApiResponse(data);
        setSystemMessage("🎉 Surprise effect applied!");
      } else {
        setError(`❌ Error: ${data.message || "Invalid UUID or PIN."}`);
      }
    } catch (err) {
      setError("❌ Server error. Please try again.");
    }

    setSurpriseLoading(false);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FFFEFA] text-[#28251B] relative">
      
      {/* Top-left Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Image src="/logomark.svg" alt="Prism Logo" width={40} height={40} />
        <span className="text-[#A4800A] text-[1.8rem] font-bold leading-[40px]">
          Prism
        </span>
      </div>

      {/* Log Out Button (SVG) - Top-right corner */}
      <button onClick={handleLogout} className="absolute top-4 right-4">
        <Image src="/logout.svg" alt="Logout" width={32} height={32} />
      </button>

      {/* Connection Status */}
      <div className="flex items-center gap-2 mt-6">
        <span className={`w-4 h-4 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
        <p>{isConnected ? "Connected" : "Disconnected"}</p>
      </div>

      {/* System Message Box */}
      <div className="mt-4 p-4 bg-[#2D2D2D] text-[#F3F4F6] rounded-lg shadow-lg w-80 text-center">
        <p className="text-sm">{systemMessage}</p>
      </div>

      {/* Record Button */}
      <button
        onClick={toggleRecording}
        className={`mt-8 w-20 h-20 flex items-center justify-center rounded-full shadow-xl transition ${
            recording ? "bg-[#D7263D] hover:bg-[#B71C1C]" : "bg-[#F4A261] hover:bg-[#E76F51]"
        }`}
      >
        🎤
      </button>

      {/* Send Audio Button */}
      <button
        className="mt-4 px-6 py-2 bg-[#4B5563] text-white font-semibold rounded-lg shadow-md hover:bg-[#374151] transition"
        onClick={sendAudio}
        disabled={loading}
      >
        {loading ? "Sending..." : "📤 Send Audio"}
      </button>

      {/* Surprise Me Button */}
      <button
        className="mt-3 px-6 py-2 bg-gradient-to-r from-red-500 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition"
        onClick={surpriseMe}
        disabled={surpriseLoading}
      >
        {surpriseLoading ? "Generating..." : "🎲 Surprise Me"}
      </button>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

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
  const [systemMessage, setSystemMessage] = useState("Ready to record! 🎙️");
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // Retrieve UUID and PIN from query parameters
  useEffect(() => {
    if (router.query.uuid && router.query.pin) {
      setUuid(router.query.uuid);
      setPin(router.query.pin);
    }
  }, [router.isReady, router.query]);

  // Function to handle recording
  const toggleRecording = async () => {
    if (recording) {
      if (mediaRecorder) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach((track) => track.stop()); // Stop microphone
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

  // Function to send audio to audio_to_ai API
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
      const response = await fetch("https://flzer6zwt3.execute-api.us-east-1.amazonaws.com/dev/audio_to_ai/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid, pin, file: base64Audio }),
      });

      const data = await response.json();

      if (response.ok) {
        setApiResponse(data);
        setSystemMessage("✅ Audio sent successfully! AI is processing...");
      } else {
        setError(`❌ Error: ${data.message || "Invalid UUID or PIN."}`);
        setSystemMessage("❌ Audio failed to send.");
      }
    } catch (err) {
      setError("❌ Server error. Please try again.");
      setSystemMessage("❌ Server error. Unable to process.");
    }

    setLoading(false);
  };

  // Function to trigger "Surprise Me" (pattern_to_ai API)
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
      const response = await fetch("https://flzer6zwt3.execute-api.us-east-1.amazonaws.com/dev/pattern_to_ai/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid, pin }),
      });

      const data = await response.json();

      if (response.ok) {
        setApiResponse(data);
        setSystemMessage("🎉 Surprise effect applied!");
      } else {
        setError(`❌ Error: ${data.message || "Invalid UUID or PIN."}`);
        setSystemMessage("❌ Surprise effect failed.");
      }
    } catch (err) {
      setError("❌ Server error. Please try again.");
      setSystemMessage("❌ Server error. Unable to generate surprise.");
    }

    setSurpriseLoading(false);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-800 text-white">
      <h1 className="text-2xl">Recording Page</h1>

      {/* System Feedback Box */}
      <div className="mt-4 p-4 bg-gray-700 text-white rounded-lg shadow-md w-80 text-center">
        <p className="text-sm">{systemMessage}</p>
      </div>

      {/* Recording Button */}
      <button
        className={`mt-5 px-4 py-2 rounded-lg shadow-md ${
          recording ? "bg-red-500" : "bg-green-500"
        } text-white`}
        onClick={toggleRecording}
      >
        {recording ? "⏹ Stop Recording" : "🎙 Start Recording"}
      </button>

      {/* Send Audio Button */}
      <button
        className="mt-5 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md disabled:opacity-50"
        onClick={sendAudio}
        disabled={loading}
      >
        {loading ? "Sending..." : "📤 Send Audio"}
      </button>

      {/* Surprise Me Button */}
      <button
        className="mt-5 px-4 py-2 bg-purple-500 text-white rounded-lg shadow-md disabled:opacity-50"
        onClick={surpriseMe}
        disabled={surpriseLoading}
      >
        {surpriseLoading ? "Generating..." : "🎲 Surprise Me"}
      </button>

      {/* Error Message Display */}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* AI Response Display */}
      {apiResponse && (
        <div className="mt-5 p-4 bg-gray-700 text-white rounded-lg shadow-md w-80">
          <h3 className="text-lg font-bold">✨ AI Response</h3>
          <p className="mt-2">{apiResponse.recommendation}</p>
          <p className="text-sm text-gray-300">{apiResponse.context}</p>
        </div>
      )}
    </div>
  );
}

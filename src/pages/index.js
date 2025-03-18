import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center gap-10 max-w-md text-center px-6 mt-12">
        {/* Hero Image/Logo */}
        <div className="flex flex-col items-center relative mt-10">
          <div className={`floating-element transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
            <Image
              src="/prisimLogo.png"
              alt="Prism Logo"
              width={260}
              height={162}
              priority
              className="drop-shadow-2xl"
            />
          </div>

          <h1 className="text-4xl font-bold tracking-tight mt-6 transition-all duration-500 delay-100">
            <span className="gradient-text">Prism</span>
          </h1>

          <div className="led-strip-visual mt-6"></div>
        </div>

        {/* Heading */}
        <div className="space-y-3 transition-all duration-500 delay-200">
          <h2 className="text-2xl font-semibold">AI-Powered LED Experience</h2>
          <p className="text-muted text-lg">
            Transform your environment with intelligent, responsive lighting that reacts to your voice.
          </p>
        </div>

        {/* Get Started Button */}
        <div className="w-full max-w-xs transition-all duration-500 delay-300">
          <Link href="/uuid" className="block">
            <button className="btn btn-primary w-full">Get Started</button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-8">
          {[
            { icon: "🎙️", title: "Voice Control", desc: "Control lights with simple commands" },
            { icon: "🧠", title: "AI-Powered", desc: "Smart patterns and responses" },
            { icon: "🎨", title: "Dynamic Colors", desc: "Infinite color combinations" },
            { icon: "📱", title: "Easy Setup", desc: "Simple interface, powerful results" },
          ].map((feature, i) => (
            <div
              key={i}
              className="glassmorphism p-4 rounded-lg text-center transition-all duration-500"
              style={{ animationDelay: `${i * 100 + 400}ms` }}
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <h3 className="text-sm font-medium">{feature.title}</h3>
              <p className="text-xs text-muted mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

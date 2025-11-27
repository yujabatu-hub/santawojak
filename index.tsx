import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase, WalletCheck } from "./supabaseClient";

// Add global declaration for Solana/Phantom
declare global {
  interface Window {
    solana: any;
  }
}

// Pre-defined responses since we removed AI
const NICE_MESSAGES = [
  "True Diamond Hands detected! You held through the dip like a champion.",
  "Your wallet radiates pure WAGMI energy. The elves are impressed.",
  "Zero rug pulls detected in your history. You are a pillar of the community!",
  "You bought the bottom and verified the transactions. Saintoshi Nakamoto smiles upon you.",
  "Charts indicate you provided liquidity when the world needed it most."
];

const NAUGHTY_MESSAGES = [
  "Paper hands detected! Did you sell just before the pump?",
  "Too many failed transactions. You're clogging the blockchain!",
  "Analysis suggests you fomo'd into a rug pull. Tsk tsk.",
  "Your gas fee history is chaotic. The elves are confused.",
  "You ignored the HODL strategy. Santa is disappointed."
];

const NICE_GIFTS = [
  "1000 $BONK (FAKE)",
  "A Whitelist Spot for 'Elf Punks' (FAKE)",
  "Hardware Wallet (Gold Edition) (FAKE)",
  "Green Candles Forever (FAKE)",
  "A ticket to the Citadel (FAKE)"
];

const NAUGHTY_GIFTS = [
  "Digital Coal (Non-Fungible) (FAKE)",
  "A Rug Pull Notification (FAKE)",
  "High Gas Fees (FAKE)",
  "Dust Tokens (FAKE)",
  "Screenshot of a Bored Ape (FAKE)"
];

const Confetti = ({ status }: { status: "Nice" | "Naughty" }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = status === "Nice" 
      ? ["#EF4444", "#22C55E", "#EAB308", "#FFFFFF"] // Red, Green, Yellow, White
      : ["#1F2937", "#4B5563", "#EF4444", "#000000"]; // Dark Gray, Gray, Red, Black

    const particles: {
      x: number;
      y: number;
      w: number;
      h: number;
      dx: number;
      dy: number;
      rotation: number;
      dRotation: number;
      color: string;
    }[] = [];

    // Create particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height, // Start spread out above
        w: Math.random() * 10 + 5,
        h: Math.random() * 5 + 5,
        dx: Math.random() * 2 - 1, 
        dy: Math.random() * 3 + 2, 
        rotation: Math.random() * 360,
        dRotation: Math.random() * 4 - 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Move
        p.x += p.dx;
        p.y += p.dy;
        p.rotation += p.dRotation;

        // Wrap around
        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;

        // Draw rect
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [status]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
};

const App = () => {
  // We change deed to 'survey' to track if they answered the fake questions
  const [formData, setFormData] = useState({
    name: "", 
    age: "",
    surveyQ1: "HODL", // default value
    surveyQ2: "Yes",
  });
  
  const [walletAddress, setWalletAddress] = useState("");
  const [manualAddressInput, setManualAddressInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<null | {
    status: "Nice" | "Naughty";
    message: string;
    gift: string;
  }>(null);
  const [error, setError] = useState("");

  const loadingIcons = ["🎅", "🧝", "🦌", "🎁", "🎄", "🍪"];
  const loadingMessages = [
    "Connecting to North Pole Node...",
    "Santa's Elves are checking the ledger...",
    "Detecting HODL Vibes...",
    "Consulting with Rudolph...",
    "Calculating Naughty/Nice Score...",
    "Wrapping Digital Assets...",
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => prev + 1);
      }, 700);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect();
        const key = response.publicKey.toString();
        setWalletAddress(key);
        setFormData((prev) => ({ ...prev, name: key }));
        setError("");
        setManualAddressInput("");
      } catch (err) {
        console.error(err);
        setError("User rejected the connection request.");
      }
    } else {
      setError("Phantom Wallet not found! Please install it.");
      window.open("https://phantom.app/", "_blank");
    }
  };

  const handleManualAddressSubmit = () => {
    const trimmed = manualAddressInput.trim();
    if (trimmed.length === 44) {
      setWalletAddress(trimmed);
      setFormData((prev) => ({ ...prev, name: trimmed }));
      setError("");
    } else {
      setError("Address must be exactly 44 characters long.");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setManualAddressInput("");
    setFormData((prev) => ({ ...prev, name: "" }));
    setResult(null);
  };

  // The "Backend" Logic
  const determineStatus = (address: string) => {
    // 1. Extract numbers from address
    const numbers = address.match(/\d/g);
    
    let sum = 0;
    if (numbers) {
      sum = numbers.reduce((acc, curr) => acc + parseInt(curr), 0);
    }

    // Logic: Even Sum = Naughty, Odd Sum = Nice
    const isNice = sum % 2 !== 0; // Ganjil = Nice

    const status: "Nice" | "Naughty" = isNice ? "Nice" : "Naughty";
    const messagePool = isNice ? NICE_MESSAGES : NAUGHTY_MESSAGES;
    const giftPool = isNice ? NICE_GIFTS : NAUGHTY_GIFTS;

    // Pick random message/gift from pool to make it feel dynamic
    const randomMsg = messagePool[Math.floor(Math.random() * messagePool.length)];
    const randomGift = giftPool[Math.floor(Math.random() * giftPool.length)];

    return {
      status,
      message: randomMsg,
      gift: randomGift
    };
  };

  const handleCheckList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data: existingCheck, error: fetchError } = await supabase
        .from('wallet_checks')
        .select('*')
        .eq('wallet_address', formData.name)
        .maybeSingle();

      if (fetchError) {
        console.error('Database error:', fetchError);
      }

      // Simulate loading for better UX
      await new Promise(resolve => setTimeout(resolve, 4500));

      if (existingCheck) {
        const { error: updateError } = await supabase
          .from('wallet_checks')
          .update({
            last_checked_at: new Date().toISOString(),
            check_count: (existingCheck.check_count || 1) + 1
          })
          .eq('wallet_address', formData.name);

        if (updateError) {
          console.error('Update error:', updateError);
        }

        setResult({
          status: existingCheck.status as 'Nice' | 'Naughty',
          message: existingCheck.message,
          gift: existingCheck.gift
        });
      } else {
        const outcome = determineStatus(formData.name);

        const newCheck: WalletCheck = {
          wallet_address: formData.name,
          status: outcome.status,
          message: outcome.message,
          gift: outcome.gift,
          age: parseInt(formData.age) || 0,
          survey_q1: formData.surveyQ1,
          survey_q2: formData.surveyQ2,
          check_count: 1
        };

        const { error: insertError } = await supabase
          .from('wallet_checks')
          .insert([newCheck]);

        if (insertError) {
          console.error('Insert error:', insertError);
        }

        setResult(outcome);
      }
    } catch (err) {
      console.error('Error:', err);
      setError("The elves dropped the list. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setFormData({ name: walletAddress, age: "", surveyQ1: "HODL", surveyQ2: "Yes" });
  };

  // Shorten address for display
  const shortAddress = walletAddress 
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : "";

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      
      {result && <Confetti status={result.status} />}

      <div className="max-w-xl w-full">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-christmas text-red-500 drop-shadow-lg text-white mb-2">
            Santawojak
          </h1>
          <p className="text-white text-lg font-serif-display italic opacity-90">
            CA: BuSz8THn7dH6z42qPcmkMtPjgbVeVyxHKr64TB4Jpump
          </p>
        </header>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-500/50 relative pt-6 animate-float">
          
          {/* Christmas Lights Strand */}
          <div className="light-strand">
             {/* 12 bulbs for the strand */}
            <div className="bulb"></div>
            <div className="bulb"></div>
            <div className="bulb"></div>
            <div className="bulb"></div>
            <div className="bulb"></div>
            <div className="bulb"></div>
            <div className="bulb"></div>
            <div className="bulb"></div>
            <div className="bulb"></div>
            <div className="bulb"></div>
            <div className="bulb"></div>
            <div className="bulb"></div>
          </div>

          {/* Decorative Corner Ribbons */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-red-600 rotate-45 transform pointer-events-none"></div>
          <div className="absolute top-0 left-0 -ml-8 -mt-8 w-24 h-24 bg-red-600 -rotate-45 transform pointer-events-none"></div>

          <div className="p-8 md:p-12">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in-up">
                <div className="text-7xl mb-6 animate-bounce">
                  {loadingIcons[loadingStep % loadingIcons.length]}
                </div>
                <h3 className="text-2xl font-christmas text-red-600 mb-6 h-8 flex items-center justify-center">
                  {loadingMessages[loadingStep % loadingMessages.length]}
                </h3>
                
                {/* Candy Cane Progress Bar */}
                <div className="w-full h-8 bg-gray-100 rounded-full border-2 border-red-200 overflow-hidden relative shadow-inner mb-4">
                  <div className="h-full bg-red-500 animate-candy-stripe relative w-full"></div>
                </div>
                <p className="text-sm text-gray-500 font-serif-display italic">
                  Reviewing on-chain behavior...
                </p>
              </div>
            ) : !result ? (
              <form onSubmit={handleCheckList} className="space-y-6">
                <div className="text-center mb-6">
                  {/* Meme Logo Container */}
                  <div className="relative inline-block mb-2 mt-4 group">
                     <div className="relative z-0">
                        <img 
                          src="https://thumbs4.imagebam.com/a8/49/9d/ME180WWE_t.png" 
                          alt="Santa Logo" 
                          className="w-40 h-40 md:w-48 md:h-48 rounded-2xl shadow-2xl border-4 border-red-500/20 object-cover object-top transform group-hover:scale-105 transition-transform duration-300"
                        />
                     </div>

                    {/* Naughty Label */}
                    <div className="absolute -top-4 -left-8 rotate-[-15deg] bg-red-600 text-white font-black text-xl md:text-2xl font-sans px-3 py-1 border-4 border-white shadow-lg transform hover:scale-110 transition-transform z-10">
                      NAUGHTY
                    </div>
                    
                    {/* Nice Label */}
                    <div className="absolute -top-4 -right-8 rotate-[15deg] bg-green-500 text-white font-black text-xl md:text-2xl font-sans px-3 py-1 border-4 border-white shadow-lg transform hover:scale-110 transition-transform z-10">
                      NICE
                    </div>
                  </div>

                  <h2 className="text-2xl font-serif-display text-gray-800 mt-4">
                    Connect Wallet to Verify
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Wallet Connection Section */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Solana Wallet Identity</label>
                    {!walletAddress ? (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={connectWallet}
                          className="w-full py-3 bg-[#AB9FF2] hover:bg-[#9f92e8] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md border-b-4 border-[#8e82d1] group"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform">👻</span> Connect Phantom
                        </button>

                        <div className="text-center text-gray-400 text-sm font-serif-display italic">- or -</div>

                        <div className="relative">
                          <input 
                            type="text"
                            value={manualAddressInput}
                            onChange={(e) => setManualAddressInput(e.target.value)}
                            placeholder="Paste Solana Address (44 chars)"
                            className="w-full pl-4 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-red-400 focus:ring focus:ring-red-200 transition-colors bg-white text-sm font-mono"
                            maxLength={44}
                          />
                          <button 
                            type="button"
                            onClick={handleManualAddressSubmit}
                            disabled={manualAddressInput.length !== 44}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 hover:bg-green-100 text-gray-400 hover:text-green-600 rounded-lg transition-colors disabled:opacity-0 disabled:pointer-events-none"
                            title="Use this address"
                          >
                            <span className="font-bold text-lg">➜</span>
                          </button>
                        </div>
                         {manualAddressInput.length > 0 && manualAddressInput.length !== 44 && (
                          <div className="text-xs text-center text-red-400 font-bold animate-pulse">
                             {manualAddressInput.length}/44 characters
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-purple-50 border-2 border-purple-200 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-green-500 text-xl">●</span>
                          <span className="font-mono text-gray-700 font-bold">{shortAddress}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={disconnectWallet}
                          className="text-xs text-red-500 hover:text-red-700 font-bold underline"
                        >
                          Disconnect
                        </button>
                      </div>
                    )}
                  </div>

                  {walletAddress && (
                    <div className="animate-fade-in-up space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Age (IRL)</label>
                        <input
                          type="number"
                          required
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring focus:ring-red-200 transition-colors bg-gray-50 text-lg"
                          placeholder="e.g. 24"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          disabled={loading}
                        />
                      </div>

                      {/* The "Fake" Survey (Epok-Epok) */}
                      <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                        <h3 className="text-yellow-800 font-bold font-serif-display text-lg mb-3 border-b border-yellow-200 pb-2">
                          Community Survey <span className="text-xs font-sans font-normal opacity-70">(Required by Elves)</span>
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              1. What is your trading strategy?
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {["HODL", "Degen", "Scalp", "Panic Sell"].map((opt) => (
                                <label key={opt} className={`cursor-pointer border-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${formData.surveyQ1 === opt ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'}`}>
                                  <input 
                                    type="radio" 
                                    name="q1" 
                                    value={opt}
                                    checked={formData.surveyQ1 === opt}
                                    onChange={(e) => setFormData({...formData, surveyQ1: e.target.value})}
                                    className="hidden"
                                  />
                                  {opt}
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              2. Did you buy the dip?
                            </label>
                            <select 
                              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 bg-white text-gray-700 focus:border-red-500 outline-none"
                              value={formData.surveyQ2}
                              onChange={(e) => setFormData({...formData, surveyQ2: e.target.value})}
                            >
                              <option value="Yes">Yes, obviously</option>
                              <option value="No">No, I bought the top</option>
                              <option value="Stable">I only hold stablecoins</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center font-bold">
                    {error}
                  </div>
                )}

                {walletAddress && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-christmas text-3xl rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                  >
                    Check Status
                  </button>
                )}
              </form>
            ) : (
              <div className="text-center animate-fade-in-up">
                <div className="mb-6 relative inline-block">
                  {result.status === "Nice" ? (
                    <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto border-4 border-green-500">
                      <span className="text-6xl">🚀</span>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mx-auto border-4 border-gray-600">
                      <span className="text-6xl">🥀</span>
                    </div>
                  )}
                  <div className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-1 rounded-full text-white font-bold tracking-widest uppercase shadow-md ${result.status === "Nice" ? "bg-green-600" : "bg-gray-800"}`}>
                    {result.status}
                  </div>
                </div>

                <h2 className="font-christmas text-3xl text-gray-800 mb-2 mt-8 break-all">
                  To: {shortAddress}
                </h2>
                
                <p className="text-xl text-gray-600 leading-relaxed font-serif-display mb-6">
                  {result.message}
                </p>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-8">
                  <p className="text-sm text-yellow-800 uppercase tracking-wide font-bold mb-1">Santa's Gift</p>
                  <p className="text-2xl font-christmas text-yellow-900">{result.gift}</p>
                </div>

                <div className="flex flex-col gap-3 mt-8">
                  <button
                    onClick={resetForm}
                    className="w-full px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-full transition-colors"
                  >
                    Check Another Wallet
                  </button>
                  
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `I just verified my wallet on Santawojak's List! 🎅📝\n\nStatus: ${result.status} ${result.status === 'Nice' ? '🚀' : '🥀'}\nGift: ${result.gift}\n\nCheck yours now at Santawojak.space 🎄\n@santawojak\n#Solana #Santawojak`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-8 py-3 bg-black hover:bg-gray-900 text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                    Share Result
                  </a>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer decoration */}
          <div className="h-4 bg-gradient-to-r from-green-600 via-red-600 to-green-600"></div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm font-sans mb-4">
            Powered by Solana &bull; Santawojak Workshop
          </p>

          <a 
            href="https://x.com/santawojak" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-3 font-bold text-white transition-all duration-300 bg-black rounded-full hover:bg-gray-900 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:-translate-y-1 border border-gray-800"
          >
            {/* X Logo */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current transition-transform group-hover:rotate-12">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </svg>
            <span>Follow @santawojak</span>
          </a>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
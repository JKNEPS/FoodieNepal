import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Music,
  Search,
  Play,
  Pause,
  RotateCcw,
  Repeat,
  Square,
  Volume2,
  VolumeX,
  Link2,
  X,
  Loader2,
  AlertCircle,
  HelpCircle,
  Disc,
  Radio
} from "lucide-react";

interface VideoTrack {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
}

// Curated high-quality, embedding-enabled background music videos
const PRESET_TRACKS: VideoTrack[] = [
  {
    id: "3t8S22y6p4Q",
    title: "Himalayan Flute Instrumental - Soothing Mountain Air",
    channel: "Spiritual Nepal Sounds",
    thumbnail: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "reZ5_7V2gO0",
    title: "Coffee Shop Lofi Chill Beats (Cozy Evening Vibes)",
    channel: "Lofi Cafe Music",
    thumbnail: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "jfKfPfyJRdk",
    title: "Lofi Hip Hop Radio - Beats to Relax/Study to",
    channel: "Lofi Girl",
    thumbnail: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "Z_D6A8YvI0E",
    title: "Himalayan Singing Bowls Meditation & Deep Relaxation",
    channel: "Nirvana Soundscapes",
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "Zp959z1W-bA",
    title: "Nepalese Folk Fusion & Sitar Ambient Chillout",
    channel: "Himalayan Records",
    thumbnail: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=300&auto=format&fit=crop"
  }
];

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

export default function BackgroundMusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true); // Loop on by default for continuous BG music
  const [currentTrack, setCurrentTrack] = useState<VideoTrack | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<VideoTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [directVideoId, setDirectVideoId] = useState("");
  const [directInputOpen, setDirectInputOpen] = useState(false);

  const playerRef = useRef<any>(null);
  const loopRef = useRef(isLooping);

  // Sync ref with state for the player callback closures
  useEffect(() => {
    loopRef.current = isLooping;
  }, [isLooping]);

  // Dynamically load YouTube Player IFrame API
  const loadYoutubeAPI = () => {
    if (window.YT && window.YT.Player) {
      return Promise.resolve(window.YT);
    }
    return new Promise<any>((resolve) => {
      // Setup polling check as a fallback if the script is already loaded/loading
      const checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          resolve(window.YT);
        }
      }, 50);

      if (!document.getElementById("youtube-iframe-api-script")) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
          document.head.appendChild(tag);
        }
      }

      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        clearInterval(checkInterval);
        resolve(window.YT);
      };
    });
  };

  // Create or load YouTube player instance
  const playTrack = async (track: VideoTrack) => {
    try {
      setErrorMsg(null);
      setCurrentTrack(track);

      // Load API first
      await loadYoutubeAPI();

      if (!window.YT || !window.YT.Player) {
        throw new Error("YouTube API failed to load. Please check your internet connection.");
      }

      // Check if player already exists
      if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
        playerRef.current.loadVideoById(track.id);
        playerRef.current.setVolume(isMuted ? 0 : volume);
        playerRef.current.playVideo();
        setIsPlaying(true);
        return;
      }

      // If player doesn't exist, build new one
      playerRef.current = new window.YT.Player("global-youtube-player-iframe", {
        height: "0",
        width: "0",
        videoId: track.id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(isMuted ? 0 : volume);
            event.target.playVideo();
            setIsPlaying(true);
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.ENDED is 0, PLAYING is 1, PAUSED is 2
            if (event.data === window.YT.PlayerState.ENDED) {
              if (loopRef.current) {
                event.target.seekTo(0);
                event.target.playVideo();
                setIsPlaying(true);
              } else {
                setIsPlaying(false);
              }
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          },
          onError: (event: any) => {
            console.error("YouTube Player Error Code:", event.data);
            let userFriendlyError = "Failed to play video. This track might have embedding restricted by creator.";
            if (event.data === 2) userFriendlyError = "Invalid video ID.";
            if (event.data === 5) userFriendlyError = "Embedded player HTML5 error.";
            if (event.data === 100) userFriendlyError = "Requested video not found.";
            if (event.data === 101 || event.data === 150) userFriendlyError = "This video is restricted from playing in embedded players.";
            setErrorMsg(userFriendlyError);
            setIsPlaying(false);
          }
        }
      });
    } catch (err: any) {
      console.error("Failed to build player:", err);
      setErrorMsg(err.message || "Could not instantiate YouTube player.");
    }
  };

  // Pause playback
  const handlePause = () => {
    if (playerRef.current && typeof playerRef.current.pauseVideo === "function") {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  };

  // Resume playback
  const handlePlay = () => {
    if (playerRef.current && typeof playerRef.current.playVideo === "function") {
      playerRef.current.playVideo();
      setIsPlaying(true);
    } else if (currentTrack) {
      playTrack(currentTrack);
    } else if (PRESET_TRACKS.length > 0) {
      playTrack(PRESET_TRACKS[0]);
    }
  };

  // Restart song (seek to 0)
  const handleRestart = () => {
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      playerRef.current.seekTo(0);
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  // Completely destroy the player instance and clean up states
  const handleTerminate = () => {
    if (playerRef.current && typeof playerRef.current.destroy === "function") {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.warn("Error while destroying player:", e);
      }
    }
    playerRef.current = null;
    setCurrentTrack(null);
    setIsPlaying(false);
    setErrorMsg(null);
  };

  // Volume slider control
  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    if (playerRef.current && typeof playerRef.current.setVolume === "function") {
      playerRef.current.setVolume(isMuted ? 0 : newVal);
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (playerRef.current && typeof playerRef.current.setVolume === "function") {
      playerRef.current.setVolume(nextMute ? 0 : volume);
    }
  };

  // Play YouTube Video from Link (URL) or Video ID
  const handlePlayLink = (inputVal: string = searchQuery) => {
    const trimmed = inputVal.trim();
    if (!trimmed) {
      setErrorMsg("Please enter a YouTube link or video ID.");
      return;
    }

    let finalId = trimmed;

    // If it's a full youtube URL or embed link, extract the ID
    try {
      if (finalId.includes("youtube.com/watch")) {
        const urlObj = new URL(finalId);
        const extracted = urlObj.searchParams.get("v");
        if (extracted) finalId = extracted;
      } else if (finalId.includes("youtu.be/")) {
        const segments = finalId.split("youtu.be/");
        if (segments[1]) {
          const cleanSeg = segments[1].split("?")[0];
          finalId = cleanSeg;
        }
      } else if (finalId.includes("youtube.com/embed/")) {
        const segments = finalId.split("youtube.com/embed/");
        if (segments[1]) {
          const cleanSeg = segments[1].split("?")[0];
          finalId = cleanSeg;
        }
      }
    } catch (e) {
      console.warn("Failed to parse URL:", e);
    }

    // A standard YouTube video ID is 11 alphanumeric characters (including underscores and hyphens)
    const isValidId = /^[a-zA-Z0-9_-]{11}$/.test(finalId);
    if (!isValidId) {
      setErrorMsg("Invalid YouTube Link. Please paste a full YouTube URL or a valid 11-digit Video ID.");
      return;
    }

    const customTrack: VideoTrack = {
      id: finalId,
      title: `YouTube Track [${finalId}]`,
      channel: "YouTube Playback",
      thumbnail: `https://img.youtube.com/vi/${finalId}/hqdefault.jpg`
    };

    setErrorMsg(null);
    playTrack(customTrack);
    setSearchQuery(""); // Clear the input field after successful play
  };

  // Auto clean up player on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  return (
    <>
      {/* Target element for YouTube iframe API (MUST BE OUTSIDE THE TOGGLED PANEL AND PERMANENTLY MOUNTED) */}
      <div
        className="absolute pointer-events-none opacity-0 select-none overflow-hidden"
        style={{ width: "1px", height: "1px", left: "-9999px", top: "-9999px" }}
      >
        <div id="global-youtube-player-iframe" />
      </div>

      {/* Floating circular button at the bottom-right corner */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
        {/* Expanded Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="mb-3.5 w-80 md:w-96 rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl p-4 text-white overflow-hidden flex flex-col max-h-[520px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-full bg-orange-500/10 text-orange-400 ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "6s" }}>
                    <Disc className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-widest uppercase text-slate-100">Himalayan Beats</h4>
                    <p className="text-[9px] text-slate-400 font-medium">Persistent Background Music</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content - Scrollable */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {/* Now Playing Widget */}
                {currentTrack && (
                  <div className="p-3 bg-slate-850/50 rounded-2xl border border-slate-850 space-y-2.5">
                    <div className="flex items-center gap-3">
                      <img
                        referrerPolicy="no-referrer"
                        src={currentTrack.thumbnail}
                        alt={currentTrack.title}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-800 shadow shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="overflow-hidden whitespace-nowrap">
                          {isPlaying ? (
                            <div className="inline-block animate-marquee font-bold text-xs text-orange-400">
                              {currentTrack.title} &nbsp;&bull;&nbsp; {currentTrack.title}
                            </div>
                          ) : (
                            <p className="font-bold text-xs text-slate-200 truncate">{currentTrack.title}</p>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{currentTrack.channel}</p>
                      </div>
                      
                      {/* Audio visualizer bar animations when active */}
                      {isPlaying && (
                        <div className="flex items-end gap-0.5 h-4 shrink-0 px-1">
                          <span className="w-0.5 bg-orange-400 rounded-full animate-pulse h-3" style={{ animationDelay: "0.1s" }} />
                          <span className="w-0.5 bg-orange-400 rounded-full animate-pulse h-4" style={{ animationDelay: "0.3s" }} />
                          <span className="w-0.5 bg-orange-400 rounded-full animate-pulse h-2" style={{ animationDelay: "0.5s" }} />
                        </div>
                      )}
                    </div>

                    {/* Progress slider simulation & Volume slide indicator */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <button
                        onClick={handleToggleMute}
                        className="text-slate-400 hover:text-white transition-colors shrink-0"
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-slate-300" />}
                      </button>
                      
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-colors"
                        style={{ backgroundSize: `${volume}% 100%` }}
                        title={`Volume: ${volume}%`}
                      />
                      <span className="text-[9px] font-mono text-slate-400 w-6 text-right shrink-0">
                        {volume}%
                      </span>
                    </div>

                    {/* Compact controls block */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                      <div className="flex items-center gap-1.5">
                        {isPlaying ? (
                          <button
                            onClick={handlePause}
                            className="p-1.5 rounded-full bg-white text-slate-900 hover:bg-slate-200 transition-all flex items-center justify-center cursor-pointer shadow"
                            title="Pause"
                          >
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          </button>
                        ) : (
                          <button
                            onClick={handlePlay}
                            className="p-1.5 rounded-full bg-orange-500 text-white hover:bg-orange-400 transition-all flex items-center justify-center cursor-pointer shadow"
                            title="Play"
                          >
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </button>
                        )}

                        <button
                          onClick={handleRestart}
                          className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 transition-colors cursor-pointer"
                          title="Restart Song"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setIsLooping(!isLooping)}
                          className={`p-1.5 rounded-full transition-all cursor-pointer ${
                            isLooping
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                          title="Toggle Loop"
                        >
                          <Repeat className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={handleTerminate}
                        className="px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors text-[10px] font-bold flex items-center gap-1 cursor-pointer border border-rose-500/20"
                        title="Shutdown Player"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>Stop Music</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* API Info / Error Notification panel */}
                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex gap-2 items-start">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <div className="leading-relaxed">
                      <p className="font-semibold text-[11px]">{errorMsg}</p>
                    </div>
                  </div>
                )}

                {/* YouTube Link Paste Input */}
                <div className="space-y-2 p-3.5 bg-slate-850/50 rounded-2xl border border-slate-800">
                  <label className="block text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span>Paste YouTube Video Link</span>
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Paste link (e.g. https://youtu.be/...)"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setErrorMsg(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handlePlayLink()}
                      className="flex-1 bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-semibold"
                    />
                    <button
                      onClick={() => handlePlayLink()}
                      className="px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-black hover:from-orange-400 hover:to-amber-400 transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-lg hover:shadow-orange-500/10 active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                      <span>Play</span>
                    </button>
                  </div>
                  <p className="text-[9.5px] text-slate-400 leading-normal">
                    📢 Paste any direct YouTube link (or 11-digit Video ID) above to play. Direct URL streaming is fast & reliable.
                  </p>
                </div>

                {/* List Header */}
                <div className="pt-1.5">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-orange-400 shrink-0" />
                    <span>{searchResults.length > 0 ? "Search Results" : "Nepalese Curated Chill Presets"}</span>
                  </h5>

                  {/* Tracks list */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-slate-800">
                    {(searchResults.length > 0 ? searchResults : PRESET_TRACKS).map((track) => (
                      <button
                        key={track.id}
                        onClick={() => playTrack(track)}
                        className={`w-full flex items-center gap-2.5 p-1.5 rounded-xl text-left transition-all group border ${
                          currentTrack?.id === track.id
                            ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
                            : "bg-slate-850/40 border-slate-850 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
                        }`}
                      >
                        <img
                          referrerPolicy="no-referrer"
                          src={track.thumbnail}
                          alt={track.title}
                          className="w-9 h-9 rounded-lg object-cover shrink-0 bg-slate-800 border border-slate-700/50"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold truncate group-hover:text-orange-400 transition-colors leading-tight">
                            {track.title}
                          </p>
                          <p className="text-[9px] text-slate-500 truncate mt-0.5 font-medium">{track.channel}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer hint */}
              <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center text-[8.5px] text-slate-500 font-mono">
                <span>Free IFrame Audio-Only API</span>
                <span className="text-orange-400">Continuous Navigation Active</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating circular button itself */}
        <button
          id="btn-bg-music-player-toggle"
          onClick={() => setIsOpen(!isOpen)}
          className={`h-12 w-12 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#8B1A1A] hover:from-[#ff7d4e] hover:to-[#a11f1f] text-white flex items-center justify-center shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer relative z-50 ${
            isPlaying ? "ring-4 ring-orange-500/20" : ""
          }`}
          title="Toggle Background Music Player"
        >
          {/* Pulsing visual circles back when playing */}
          {isPlaying && (
            <>
              <span className="absolute inset-0 rounded-full bg-orange-500/40 animate-ping opacity-60 pointer-events-none" style={{ animationDuration: "2.5s" }} />
              <span className="absolute inset-[-4px] rounded-full bg-[#8B1A1A]/20 animate-pulse pointer-events-none" />
            </>
          )}

          {/* Dynamic rotating music icon */}
          <div className={isPlaying ? "animate-spin" : ""} style={{ animationDuration: "6s" }}>
            <Music className="w-5.5 h-5.5 fill-current" />
          </div>
        </button>
      </div>

      {/* Embedded CSS for custom simple marquee and shake */}
      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          padding-left: 100%;
          animation: marquee 15s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}

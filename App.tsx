
import React, { useState, useCallback, useRef, useEffect } from 'react';
import WorldMap from './components/WorldMap';
import InfoPanel from './components/InfoPanel';
import { CulturalData, LoadingState } from './types';
import { fetchCulturalData, generateCulturalAudio, decodeAudioBuffer } from './services/geminiService';

const App: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [culturalData, setCulturalData] = useState<CulturalData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  
  // Audio State
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const currentBufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const updateProgress = useCallback(() => {
    if (audioCtxRef.current && isPlaying && !isPaused) {
      const elapsed = audioCtxRef.current.currentTime - startTimeRef.current + offsetRef.current;
      setCurrentTime(Math.min(elapsed, duration));
      if (elapsed >= duration) {
        handleAudioEnded();
        return;
      }
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying, isPaused, duration]);

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
    offsetRef.current = 0;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  const stopCurrentAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
        audioSourceRef.current.onended = null;
      } catch (e) {}
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  const playFromOffset = (buffer: AudioBuffer, offset: number) => {
    if (!audioCtxRef.current) return;
    
    stopCurrentAudio();
    
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current.destination);
    
    startTimeRef.current = audioCtxRef.current.currentTime;
    offsetRef.current = offset;
    
    source.start(0, offset);
    audioSourceRef.current = source;
    setIsPlaying(true);
    setIsPaused(false);
    
    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const handleTogglePause = () => {
    if (!currentBufferRef.current || !audioCtxRef.current) return;

    if (isPlaying && !isPaused) {
      // Pause
      stopCurrentAudio();
      offsetRef.current += audioCtxRef.current.currentTime - startTimeRef.current;
      setIsPaused(true);
    } else if (isPaused) {
      // Resume
      playFromOffset(currentBufferRef.current, offsetRef.current);
    }
  };

  const handleSeek = (time: number) => {
    if (!currentBufferRef.current) return;
    setCurrentTime(time);
    offsetRef.current = time;
    if (isPlaying && !isPaused) {
      playFromOffset(currentBufferRef.current, time);
    }
  };

  const handleCountryClick = useCallback(async (name: string) => {
    if (loadingState === LoadingState.LOADING_DATA || name === selectedCountry) return;

    setSelectedCountry(name);
    setLoadingState(LoadingState.LOADING_DATA);
    handleAudioEnded(); // Reset audio on country change
    
    try {
      const data = await fetchCulturalData(name);
      setCulturalData(data);
      setLoadingState(LoadingState.IDLE);
      await handlePlayAudio(undefined, data);
    } catch (error) {
      console.error("Failed to fetch country data:", error);
      setLoadingState(LoadingState.ERROR);
    }
  }, [loadingState, selectedCountry]);

  const handlePlayAudio = async (textOverride?: string, dataToSpeak: CulturalData | null = culturalData) => {
    if (!dataToSpeak) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    handleAudioEnded();
    setIsAudioLoading(true);

    try {
      const textToSpeak = textOverride || `Welcome to ${dataToSpeak.country}. In ${dataToSpeak.languageName}, we say ${dataToSpeak.languageGreeting}. ${dataToSpeak.historicalContext}`;
      const audioData = await generateCulturalAudio(textToSpeak);
      const audioBuffer = await decodeAudioBuffer(audioData, audioCtxRef.current);
      
      currentBufferRef.current = audioBuffer;
      setDuration(audioBuffer.duration);
      playFromOffset(audioBuffer, 0);
    } catch (error) {
      console.warn("Audio generation failed:", error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="h-20 flex items-center justify-between px-10 bg-white border-b border-slate-200/60 shadow-sm z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
            <i className="fa-solid fa-earth-asia text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-slate-900">Heritage <span className="text-indigo-600">Voyager</span></h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400">Global Cultural Atlas</p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
            <i className="fa-solid fa-microphone text-indigo-500"></i> AI Narrations
          </span>
          <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
            <i className="fa-solid fa-magnifying-glass-location text-indigo-500"></i> Anthropology
          </span>
        </div>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <section className="flex-1 relative bg-[#fcfdfe]">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          <WorldMap 
            onCountryHover={() => {}} 
            onCountryClick={handleCountryClick} 
          />
          
          <div className="absolute bottom-10 left-10">
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200 shadow-xl max-w-xs space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Quick Guide</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px]">1</div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">Click a region to unlock its cultural profile.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px]">2</div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">Listen to native greetings and narrations.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="w-full lg:w-[480px] bg-white border-l border-slate-200 shadow-2xl z-40 relative">
          <div className="h-full flex flex-col relative z-10">
            <InfoPanel 
              data={culturalData} 
              loadingState={loadingState} 
              onPlayAudio={(text) => handlePlayAudio(text)}
              isAudioLoading={isAudioLoading}
              isPlaying={isPlaying}
              isPaused={isPaused}
              currentTime={currentTime}
              duration={duration}
              onTogglePause={handleTogglePause}
              onSeek={handleSeek}
            />
          </div>
          {loadingState === LoadingState.LOADING_DATA && (
            <div className="absolute inset-0 shimmer pointer-events-none"></div>
          )}
        </aside>
      </main>

      <footer className="h-12 bg-white border-t border-slate-200 flex items-center justify-between px-10 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
        <div className="flex items-center gap-4">
          <span>&copy; 2025 HERITAGE AI</span>
          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
          <span className="text-indigo-400">Open Knowledge Initiative</span>
        </div>
        <div className="flex gap-8">
          <span className="hover:text-indigo-600 transition-colors cursor-help">Linguistics v4.2</span>
          <span className="hover:text-indigo-600 transition-colors cursor-help">Atlas-X Core</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

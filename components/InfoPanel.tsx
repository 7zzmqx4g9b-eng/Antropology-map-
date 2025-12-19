
import React from 'react';
import { CulturalData, LoadingState } from '../types';

interface InfoPanelProps {
  data: CulturalData | null;
  loadingState: LoadingState;
  onPlayAudio: (textOverride?: string) => void;
  isAudioLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  onTogglePause: () => void;
  onSeek: (time: number) => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  data, 
  loadingState, 
  onPlayAudio, 
  isAudioLoading,
  isPlaying,
  isPaused,
  currentTime,
  duration,
  onTogglePause,
  onSeek
}) => {
  if (loadingState === LoadingState.IDLE && !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center space-y-6">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
          <i className="fa-solid fa-earth-americas text-4xl text-slate-200"></i>
        </div>
        <div className="space-y-2">
          <p className="text-2xl font-serif text-slate-800">Select a Nation</p>
          <p className="text-sm text-slate-500 max-w-[280px] leading-relaxed">
            Click on the map to begin your voyage through the world's diverse anthropological heritage and linguistic sounds.
          </p>
        </div>
      </div>
    );
  }

  if (loadingState === LoadingState.LOADING_DATA) {
    return (
      <div className="h-full flex flex-col p-8 space-y-8 animate-pulse bg-white">
        <div className="space-y-3">
          <div className="h-10 w-2/3 bg-slate-100 rounded-lg"></div>
          <div className="h-4 w-1/2 bg-slate-50 rounded"></div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-slate-50 rounded w-full"></div>
          <div className="h-4 bg-slate-50 rounded w-5/6"></div>
          <div className="h-4 bg-slate-50 rounded w-4/6"></div>
        </div>
        <div className="aspect-video bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="h-full overflow-y-auto p-8 space-y-10 custom-scrollbar bg-white">
      <header className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-4xl font-serif font-bold text-slate-900 leading-tight">{data.country}</h2>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-bold">{data.officialName}</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => onPlayAudio()}
              disabled={isAudioLoading}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isAudioLoading ? 'bg-indigo-50 text-indigo-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-200 active:scale-95'}`}
              title="Narrate Profile"
            >
              {isAudioLoading ? (
                <i className="fa-solid fa-spinner animate-spin"></i>
              ) : isPlaying ? (
                <i className="fa-solid fa-volume-high text-lg"></i>
              ) : (
                <i className="fa-solid fa-play ml-1"></i>
              )}
            </button>
          </div>
        </div>

        {/* Persistent Audio Player Card */}
        {(isPlaying || isPaused || isAudioLoading) && (
          <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={onTogglePause}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
                >
                  {isPaused ? <i className="fa-solid fa-play ml-0.5"></i> : <i className="fa-solid fa-pause"></i>}
                </button>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Now Narrating</p>
                  <p className="text-xs font-semibold truncate max-w-[180px]">{data.country} Cultural Profile</p>
                </div>
              </div>
              <div className="text-[10px] font-mono opacity-60">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <div className="relative group pt-2 pb-1">
              <input 
                type="range"
                min="0"
                max={duration || 0}
                step="0.01"
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:h-2 transition-all"
              />
            </div>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full text-slate-600 text-xs border border-slate-100 font-medium">
          <i className="fa-solid fa-landmark text-indigo-500"></i>
          <span>Capital: {data.capital}</span>
        </div>
        <p className="text-slate-600 italic text-lg font-serif leading-relaxed border-l-4 border-indigo-100 pl-4">
          {data.historicalContext}
        </p>
      </header>

      {/* Modern Geography Card */}
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
          <i className="fa-solid fa-mountain-sun text-6xl text-indigo-900"></i>
        </div>
        <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
          <i className="fa-solid fa-map-location-dot"></i> Land & Geography
        </h4>
        <p className="text-slate-700 text-sm leading-relaxed relative z-10">
          {data.geographyFact}
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
          <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-sm">
            <i className="fa-solid fa-dna"></i>
          </span>
          Anthropology
        </h3>
        <p className="text-slate-600 leading-relaxed text-sm">{data.anthropology}</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <i className="fa-solid fa-language text-indigo-500"></i> Language
          </h4>
          <div className="space-y-3">
            <p className="text-slate-600 text-xs font-medium">{data.languageName}</p>
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100/50">
              <div className="flex items-center justify-between">
                <span className="text-indigo-900 font-bold text-lg">"{data.languageGreeting}"</span>
                <button 
                  onClick={() => onPlayAudio(data.languageGreeting)}
                  disabled={isAudioLoading}
                  className="w-8 h-8 rounded-full bg-white hover:bg-indigo-600 hover:text-white flex items-center justify-center text-indigo-600 transition-all shadow-sm"
                >
                  <i className="fa-solid fa-volume-high text-xs"></i>
                </button>
              </div>
              <p className="text-[10px] text-indigo-400 font-mono mt-1 font-bold uppercase tracking-widest">
                Pronunciation: {data.phoneticGreeting}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <i className="fa-solid fa-shirt text-indigo-500"></i> Heritage Attire
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">{data.outfitDescription}</p>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
          <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-sm">
            <i className="fa-solid fa-users-rays"></i>
          </span>
          Cultural Essence
        </h3>
        <p className="text-slate-600 leading-relaxed text-sm">{data.culture}</p>
      </section>

      <div className="relative rounded-3xl overflow-hidden group border border-slate-200">
        <img 
          src={`https://picsum.photos/seed/${data.country}-heritage/800/450`} 
          alt={data.country} 
          className="w-full h-56 object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent opacity-80"></div>
        <div className="absolute bottom-4 left-4 flex flex-col">
          <span className="text-[9px] text-slate-500 uppercase tracking-[0.4em] font-black">Visual Reference</span>
          <span className="text-xs text-slate-900 font-serif italic">Atmospheric rendering of {data.country}</span>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;

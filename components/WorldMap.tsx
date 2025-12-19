
import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

interface WorldMapProps {
  onCountryHover: (name: string | null) => void;
  onCountryClick: (name: string) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ onCountryHover, onCountryClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [loadError, setLoadError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getFlagEmoji = (name: string) => {
    const flags: { [key: string]: string } = {
      "United States of America": "🇺🇸",
      "Canada": "🇨🇦",
      "Brazil": "🇧🇷",
      "United Kingdom": "🇬🇧",
      "France": "🇫🇷",
      "Germany": "🇩🇪",
      "China": "🇨🇳",
      "Japan": "🇯🇵",
      "India": "🇮🇳",
      "Australia": "🇦🇺",
      "Thailand": "🇹🇭",
      "Italy": "🇮🇹",
      "Spain": "🇪🇸",
      "Mexico": "🇲🇽",
      "Egypt": "🇪🇬",
      "South Africa": "🇿🇦",
      "Russia": "🇷🇺",
      "Indonesia": "🇮🇩"
    };
    return flags[name] || "🏳️";
  };

  const loadMapData = () => {
    setIsLoading(true);
    setLoadError(false);
    const width = 1000;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto');

    const projection = d3.geoNaturalEarth1()
      .scale(180)
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    const g = svg.append('g');

    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((data: any) => {
        const countries = feature(data, data.objects.countries);

        g.selectAll('path')
          .data((countries as any).features)
          .enter()
          .append('path')
          .attr('d', path as any)
          .attr('class', 'country')
          .attr('fill', '#f1f5f9') // Slate 100
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 0.8)
          .style('cursor', 'pointer')
          .style('transition', 'fill 0.3s ease, stroke 0.3s ease')
          .on('mouseenter', (event, d: any) => {
            const name = d.properties.name;
            setHoveredCountry(name);
            onCountryHover(name);
            d3.select(event.currentTarget)
              .attr('fill', '#4f46e5') // Indigo 600
              .attr('stroke', '#4338ca');
          })
          .on('mousemove', (event) => {
            setTooltipPos({ x: event.clientX, y: event.clientY });
          })
          .on('mouseleave', (event) => {
            setHoveredCountry(null);
            onCountryHover(null);
            d3.select(event.currentTarget)
              .attr('fill', '#f1f5f9')
              .attr('stroke', '#ffffff');
          })
          .on('click', (event, d: any) => {
            onCountryClick(d.properties.name);
          });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading map data:", error);
        setLoadError(true);
        setIsLoading(false);
      });

    return svg;
  };

  useEffect(() => {
    const svg = loadMapData();
    return () => {
      svg.selectAll('*').remove();
    };
  }, [onCountryClick, onCountryHover]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 backdrop-blur-sm rounded-3xl">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading World Atlas...</p>
          </div>
        </div>
      )}

      {loadError ? (
        <div className="flex flex-col items-center justify-center gap-6 p-12 bg-white rounded-[2rem] border border-slate-200 shadow-xl max-w-md text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Map Connection Failed</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              We encountered an issue fetching the world map data. Please check your internet connection and try again.
            </p>
          </div>
          <button 
            onClick={() => loadMapData()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2"
          >
            <i className="fa-solid fa-rotate-right"></i> Retry Loading
          </button>
        </div>
      ) : (
        <svg ref={svgRef} className="max-w-full"></svg>
      )}
      
      {/* Clean Light Tooltip */}
      {hoveredCountry && !loadError && (
        <div 
          className="fixed pointer-events-none z-[100] px-4 py-2 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center gap-3 transition-transform duration-75 ease-out"
          style={{ 
            left: tooltipPos.x + 15, 
            top: tooltipPos.y + 15,
          }}
        >
          <span className="text-2xl filter drop-shadow-sm">{getFlagEmoji(hoveredCountry)}</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 leading-none mb-1">Explore</p>
            <p className="text-sm font-bold text-slate-900 whitespace-nowrap">{hoveredCountry}</p>
          </div>
        </div>
      )}

      {/* Floating Indicator */}
      {hoveredCountry && !loadError && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-5 py-2 bg-white/80 backdrop-blur-md rounded-full text-slate-500 text-xs font-semibold border border-slate-200 shadow-sm pointer-events-none transition-all duration-300">
          Discovering <span className="text-indigo-600 ml-1">{hoveredCountry}</span>
        </div>
      )}
    </div>
  );
};

export default WorldMap;

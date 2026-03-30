'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Maximize, Volume2, Info, ChevronRight, Zap, Shield } from 'lucide-react';

const VideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex flex-col gap-1 mb-8">
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Cinematic <span className="text-mvxteal">Trailer</span></h2>
          <p className="text-mvxmuted text-sm font-medium">Experience the vision behind the collection</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative aspect-video rounded-3xl overflow-hidden glass-card p-1 group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="w-full h-full rounded-[20px] bg-mvxdark/50 overflow-hidden relative">
          {/* Video element with fallback */}
          <video 
            src="/media/empyreans-trailer.mp4" 
            controls={false}
            playsInline 
            className="w-full h-full object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            Your browser does not support the video tag.
          </video>

          {/* Overlay for premium feel */}
          <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none bg-gradient-to-t from-mvxdark/80 via-transparent to-mvxdark/20 ${isPlaying && !isHovered ? 'opacity-0' : 'opacity-100'}`} />

          {/* Custom Controls UI (Conceptual/Overlay) */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isPlaying && !isHovered ? 'opacity-0' : 'opacity-100'}`}>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-20 h-20 rounded-full bg-mvxteal/90 text-black flex items-center justify-center shadow-[0_0_30px_rgba(35,247,221,0.5)] group-hover:scale-105 transition-all"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </motion.button>
          </div>

          {/* Info bar at bottom */}
          <div className={`absolute bottom-0 left-0 right-0 p-8 transition-transform duration-500 transform translate-y-0 ${isPlaying && !isHovered ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border border-white/20 bg-mvxsurface p-1">
                      <img 
                        src="https://mediadev.oox.art/nfts/collections/OLVGROVE-90fae5/profilePicture.webp" 
                        alt="Empyreans" 
                        className="w-full h-full object-cover rounded-full"
                      />
                  </div>
                  <div>
                      <h4 className="text-white font-bold text-sm tracking-tight">The Vision Concept</h4>
                      <p className="text-mvxmuted text-[10px] font-bold uppercase tracking-widest">Empyreans Studios • 2026</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 opacity-50">
                    <Volume2 className="w-5 h-5 text-white" />
                    <Maximize className="w-5 h-5 text-white" />
                </div>
              </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Utility First', icon: Zap, text: 'Each NFT grants governance rights and early access to upcoming drops.' },
            { title: 'Visual Excellence', icon: Info, text: 'Rendered in high-fidelity 4K for a truly immersive digital experience.' },
            { title: 'Built on Scale', icon: Shield, text: 'Leveraging the MultiversX ecosystem for secure and fast ownership.' }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 border-white/5"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-mvxteal" />
              </div>
              <h5 className="text-white font-bold text-lg mb-2">{feature.title}</h5>
              <p className="text-mvxmuted text-sm leading-relaxed">{feature.text}</p>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default VideoPlayer;

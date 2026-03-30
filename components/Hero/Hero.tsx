'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowUpRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative w-full overflow-hidden pt-32 pb-12 sm:pt-40 sm:pb-20">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-mvxteal/5 blur-[120px] rounded-full" />
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-mvxblue/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-mvxpurple/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-md mb-8"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-mvxteal">New Collection Live</span>
            <ChevronRight className="w-3 h-3 text-mvxmuted" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 uppercase italic"
          >
            Enter the <span className="gradient-text">Empyreans</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl text-lg sm:text-xl text-mvxmuted mb-10 leading-relaxed font-medium"
          >
            A limited collection of 10,000 unique digital artifacts residing on the MultiversX blockchain. Discover a new dimension of digital ownership.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <button className="btn-primary px-8 py-4 text-lg">
              Explore Collection
              <ArrowUpRight className="w-5 h-5 ml-2" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};


export default Hero;

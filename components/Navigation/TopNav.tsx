'use client';

import React from 'react';
import { useGetIsLoggedIn, useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import { logout } from '@multiversx/sdk-dapp/utils';
import { Wallet, LogOut, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopNavProps {
  onOpenLogin: () => void;
}

const TopNav = ({ onOpenLogin }: TopNavProps) => {
  const isLoggedIn = useGetIsLoggedIn();
  const { address } = useGetAccountInfo();

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  const handleLogout = () => logout('/');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-mvxdark/60 backdrop-blur-xl border-b border-white/5 h-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mvxteal to-mvxblue flex items-center justify-center text-black shadow-[0_0_20px_rgba(35,247,221,0.3)]">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">Empyreans</span>
            <span className="text-[10px] font-bold text-mvxteal tracking-[0.2em] uppercase leading-none opacity-80">Phase 01 Dashboard</span>
          </div>
        </motion.div>

        <div className="flex items-center gap-6">
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[11px] font-bold uppercase tracking-wider"
          >
            <div className="w-2 h-2 rounded-full bg-mvxteal animate-pulse" />
            <span className="text-mvxmuted">Network:</span>
            <span className="text-white">Mainnet</span>
          </motion.div>

          {isLoggedIn ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <button 
                className="btn-premium group"
                onClick={handleLogout}
              >
                <Wallet className="w-4 h-4 text-mvxteal group-hover:scale-110 transition-transform" />
                <span className="font-mono text-sm">{shortAddress}</span>
                <LogOut className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:text-red-400 transition-all" />
              </button>
            </motion.div>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenLogin}
              className="btn-primary"
            >
              <Shield className="w-4 h-4" />
              <span>Connect Portal</span>
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNav;

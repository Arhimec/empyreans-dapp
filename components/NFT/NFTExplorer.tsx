'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, LayoutGrid, Wallet, Shield } from 'lucide-react';
import { useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks';

interface NFTExplorerProps {
  nfts: any[];
  loading: boolean;
  error: string;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  traitDictionary: Record<string, Set<string>>;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedValue: string;
  setSelectedValue: (val: string) => void;
  onOpenLogin: () => void;
  onTransfer: (nft: any) => void;
  selectedNfts: any[];
  onToggleSelection: (nft: any) => void;
}

const NFTExplorer = ({
  nfts,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  traitDictionary,
  selectedCategory,
  setSelectedCategory,
  selectedValue,
  setSelectedValue,
  onOpenLogin,
  onTransfer,
  selectedNfts,
  onToggleSelection
}: NFTExplorerProps) => {

  const isLoggedIn = useGetIsLoggedIn();

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 mb-12">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl sm:text-4xl font-black text-white italic uppercase tracking-tighter">Your <span className="text-mvxteal">Assets</span></h2>
          <p className="text-mvxmuted text-sm font-medium">Filtering {nfts.length} owned artifacts</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mvxmuted" />
            <input 
              type="text" 
              placeholder="Search ID or Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-sm focus:outline-none focus:border-mvxteal/50 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:min-w-[140px]">
              <select 
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setSelectedValue(''); }}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl py-3.5 pl-4 pr-10 text-sm focus:outline-none focus:border-mvxteal/50 transition-all font-medium cursor-pointer"
              >
                <option value="">Category</option>
                {Object.keys(traitDictionary).sort().map(cat => (
                  <option key={cat} value={cat} className="bg-mvxcard">{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mvxmuted pointer-events-none" />
            </div>

            <div className="relative flex-1 sm:min-w-[140px]">
              <select 
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                disabled={!selectedCategory}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl py-3.5 pl-4 pr-10 text-sm focus:outline-none focus:border-mvxteal/50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="">Value</option>
                {selectedCategory && Array.from(traitDictionary[selectedCategory] || []).sort().map(val => (
                  <option key={val} value={val} className="bg-mvxcard">{val}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mvxmuted pointer-events-none" />
            </div>
          </div>
        </div>
      </div>


      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-4 border-mvxteal/20 border-t-mvxteal rounded-full animate-spin" />
          <p className="text-mvxmuted font-bold tracking-widest uppercase text-xs">Syncing Your Ledger...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-center font-medium">
          {error}
        </div>
      ) : !isLoggedIn ? (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 glass-card rounded-[3rem] p-12 text-center"
        >
            <div className="w-20 h-20 rounded-3xl bg-mvxteal/10 flex items-center justify-center text-mvxteal mb-8">
                <Shield className="w-10 h-10" />
            </div>
            <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">Connect Your <span className="text-mvxteal">Portal</span></h3>
            <p className="max-w-md text-mvxmuted text-lg font-medium mb-10 leading-relaxed">
                Log in to view and filter the Empyreans digital artifacts verified within your wallet.
            </p>
            <button onClick={onOpenLogin} className="btn-primary px-10 py-5 text-xl">
                <Wallet className="w-6 h-6" />
                Authenticate Wallet
            </button>
        </motion.div>
      ) : nfts.length === 0 ? (
        <div className="py-32 text-center glass-card rounded-[3rem] bg-white/5">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <LayoutGrid className="w-8 h-8 text-mvxmuted" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Artifacts Found</h3>
            <p className="text-mvxmuted font-medium">This wallet does not currently own any Empyreans NFTs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {nfts.map((nft, index) => (
            <NFTCard 
              key={nft.identifier} 
              nft={nft} 
              index={index} 
              onTransfer={onTransfer}
              isSelected={selectedNfts.some(item => item.identifier === nft.identifier)}
              onToggle={() => onToggleSelection(nft)}
            />
          ))}
        </div>
      )}
    </div>
  );
};


const NFTCard = ({ 
  nft, 
  index, 
  onTransfer, 
  isSelected, 
  onToggle 
}: { 
  nft: any, 
  index: number, 
  onTransfer: (nft: any) => void,
  isSelected: boolean,
  onToggle: () => void 
}) => {
  const imageUrl = (nft.media && nft.media.length > 0) ? nft.media[0].url : nft.url;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 1) }}
      className="group relative"
    >
      <div 
        onClick={onToggle}
        className={`glass-card rounded-[2rem] p-3 transition-all duration-500 cursor-pointer flex flex-col h-full ${isSelected ? 'border-mvxteal shadow-[0_0_40px_rgba(35,247,221,0.2)]' : 'hover:border-mvxteal/40 hover:shadow-[0_0_30px_rgba(35,247,221,0.1)]'}`}
      >
        <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-mvxdark mb-4">
          <img 
            src={imageUrl} 
            alt={nft.name} 
            className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-105' : 'group-hover:scale-110'}`}
            loading="lazy"
          />
          
          {/* Custom Neon Checkbox */}
          <div 
            className={`absolute top-4 left-4 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-mvxteal border-mvxteal shadow-[0_0_15px_rgba(35,247,221,0.6)]' : 'bg-black/40 border-white/20'}`}
          >
            {isSelected && <Shield className="w-4 h-4 text-black fill-current" />}
          </div>

          <div className="absolute top-4 right-4 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black text-white">
            #{nft.nonce}
          </div>
        </div>
        
        <div className="px-2 pb-2 flex-1 flex flex-col">
            <h3 className={`font-bold text-sm truncate uppercase tracking-tight transition-colors ${isSelected ? 'text-mvxteal' : 'text-white group-hover:text-mvxteal'}`}>
                {nft.name || 'Anonymous Asset'}
            </h3>
            <div className="flex items-center justify-between mt-2 mb-4">
                <span className="text-[10px] font-bold text-mvxmuted tracking-wide">{nft.identifier.split('-')[0]}</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-mvxteal/20' : 'bg-white/5'}`}>
                    <LayoutGrid className={`w-3 h-3 ${isSelected ? 'text-mvxteal' : 'text-mvxteal/50'}`} />
                </div>
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); onTransfer(nft); }}
              className={`mt-auto w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isSelected ? 'bg-mvxteal text-black' : 'bg-mvxteal/10 border border-mvxteal/20 text-mvxteal hover:bg-mvxteal hover:text-black'}`}
            >
              <Shield className="w-3.5 h-3.5 fill-current" />
              Transfer Single
            </button>
        </div>
      </div>
    </motion.div>
  );
};



export default NFTExplorer;

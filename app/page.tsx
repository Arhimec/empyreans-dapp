'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ExtensionLoginButton, WebWalletLoginButton, WalletConnectLoginButton } from '@multiversx/sdk-dapp/UI';
import { useGetIsLoggedIn, useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import { logout } from '@multiversx/sdk-dapp/utils';

const COLLECTION_ID = 'EMP-897b49';
const API_BASE = `https://api.multiversx.com/collections/${COLLECTION_ID}/nfts`;

export default function Home() {
  // --- Web3 Authentication State ---
  const isLoggedIn = useGetIsLoggedIn();
  const { address } = useGetAccountInfo();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // --- Dashboard Data State ---
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'media' | 'posts'>('media');
  
  // --- Filter & Search State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [traitDictionary, setTraitDictionary] = useState<Record<string, Set<string>>>({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [totalMediaCount, setTotalMediaCount] = useState(0);

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  // 1. Fetch NFTs from Blockchain API
  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true);
      setError('');
      try {
        let fetchUrl = `${API_BASE}?size=100`;
        
        if (selectedCategory && selectedValue) {
          fetchUrl += `&traits=${selectedCategory}:${selectedValue}`;
        }

        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`Blockchain API error! status: ${response.status}`);
        
        const data = await response.json();
        setNfts(data);

        if (!selectedCategory && Object.keys(traitDictionary).length === 0) {
          extractTraits(data);
          setTotalMediaCount(data.length);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [selectedCategory, selectedValue]);

  // Helper: Dig through metadata to build Category/Value dropdown dynamically
  const extractTraits = (nftData: any[]) => {
    const dict: Record<string, Set<string>> = {};
    nftData.forEach(nft => {
      if (nft.metadata?.attributes) {
        nft.metadata.attributes.forEach((attr: any) => {
          if (attr.trait_type && attr.value) {
            if (!dict[attr.trait_type]) dict[attr.trait_type] = new Set();
            dict[attr.trait_type].add(attr.value);
          }
        });
      }
    });
    setTraitDictionary(dict);
  };

  // 2. Local Search Filter
  const filteredNfts = useMemo(() => {
    return nfts.filter(nft => {
      const matchName = nft.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchId = nft.identifier?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchName || matchId;
    });
  },[nfts, searchQuery]);

  const handleLogout = () => logout('/');

  return (
    <>
      {/* --- TOP NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-mvxdark/80 backdrop-blur-md border-b border-mvxborder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-mvxteal to-mvxblue flex items-center justify-center text-black font-bold text-lg">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Empyreans <span className="text-gray-500 font-normal text-sm ml-2 hidden sm:inline">| Owner Dashboard</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-400 hidden sm:block">
              <i className="fa-solid fa-circle text-mvxteal text-[8px] align-middle mr-1 animate-pulse"></i> Mainnet
            </div>
            
            {isLoggedIn ? (
              <button onClick={handleLogout} className="bg-mvxcard hover:bg-mvxborder border border-mvxborder text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2">
                <i className="fa-solid fa-wallet text-mvxteal"></i> {shortAddress} <i className="fa-solid fa-right-from-bracket ml-2 text-gray-500 hover:text-red-400"></i>
              </button>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all hover:border-mvxteal">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* --- LOGIN MODAL --- */}
      {isLoginModalOpen && !isLoggedIn && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center px-4">
          <div className="bg-mvxsurface border border-mvxborder p-6 sm:p-8 rounded-2xl w-full max-w-sm relative shadow-2xl">
            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Connect Wallet</h2>
            <p className="text-sm text-gray-400 text-center mb-6">Select your MultiversX provider.</p>
            
            <div className="flex flex-col gap-3 wallet-buttons">
              <WalletConnectLoginButton callbackRoute="/" loginButtonText="xPortal App" />
              <ExtensionLoginButton callbackRoute="/" loginButtonText="DeFi Wallet Extension" />
              <WebWalletLoginButton callbackRoute="/" loginButtonText="MultiversX Web Wallet" />
            </div>
          </div>
        </div>
      )}

      {/* --- COLLECTION HEADER --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="h-48 sm:h-72 w-full rounded-2xl relative overflow-hidden border border-mvxborder group">
          <div className="absolute inset-0 bg-gradient-to-t from-mvxdark via-transparent to-transparent z-10"></div>
          <img src="https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=1200&auto=format&fit=crop" alt="Empyreans Banner" className="w-full h-full object-cover transform transition duration-700 group-hover:scale-105 opacity-60" />
        </div>

        <div className="relative -mt-16 sm:-mt-20 z-20 flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-8 border-b border-mvxborder">
          <div className="w-32 h-32 rounded-2xl border-4 border-mvxdark bg-mvxsurface overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 border border-mvxteal rounded-2xl opacity-50"></div>
            {/* Keeping the specific logo URL as it is part of the collection data */}
            <img src="https://mediadev.oox.art/nfts/collections/OLVGROVE-90fae5/profilePicture.webp" alt="Empyreans Logo" className="w-full h-full object-cover" />
          </div>

          <div className="text-center sm:text-left flex-1 mb-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
              Empyreans <i className="fa-solid fa-badge-check text-mvxteal text-xl"></i>
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-sm">
              <span className="bg-mvxblue/20 text-blue-400 px-3 py-1 rounded-full border border-mvxblue/30 font-mono">ID: {COLLECTION_ID}</span>
              <span className="text-gray-400"><i className="fa-solid fa-cube text-mvxteal mr-1"></i> MultiversX Native</span>
            </div>
          </div>

          <div className="flex gap-4 sm:mb-2 w-full sm:w-auto justify-center">
            <div className="bg-mvxsurface border border-mvxborder rounded-xl px-5 py-3 text-center min-w-[100px]">
              <div className="text-2xl font-bold text-white">{totalMediaCount || '-'}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- NAVIGATION TABS --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex gap-6 border-b border-mvxborder">
          <button onClick={() => setActiveTab('media')} className={`pb-4 text-sm font-bold tracking-wide transition-colors border-b-2 uppercase ${activeTab === 'media' ? 'text-mvxteal border-mvxteal' : 'text-gray-500 hover:text-gray-300 border-transparent'}`}>
            <i className="fa-solid fa-border-all mr-2"></i> Collection
          </button>
          <button onClick={() => setActiveTab('posts')} className={`pb-4 text-sm font-bold tracking-wide transition-colors border-b-2 uppercase ${activeTab === 'posts' ? 'text-mvxteal border-mvxteal' : 'text-gray-500 hover:text-gray-300 border-transparent'}`}>
            <i className="fa-solid fa-play mr-2"></i> Trailer
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[50vh]">

        {/* --- TAB: COLLECTION --- */}
        {activeTab === 'media' && (
          <div>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-mvxsurface border border-mvxborder rounded-xl p-4 mb-8 shadow-lg gap-4">
              <div className="text-sm font-semibold text-gray-400 flex items-center gap-2 whitespace-nowrap">
                <i className="fa-solid fa-sliders text-mvxteal"></i> Explorer Filters
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto text-black">
                <div className="relative w-full sm:w-48 lg:w-56">
                  <input type="text" placeholder="Search name or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-mvxdark border border-mvxborder text-white py-2.5 pl-10 pr-4 rounded-lg focus:outline-none focus:border-mvxteal focus:ring-1 focus:ring-mvxteal transition-all text-sm placeholder-gray-500" />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <i className="fa-solid fa-magnifying-glass text-xs"></i>
                  </div>
                </div>

                <div className="relative w-full sm:w-40 lg:w-48">
                  <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedValue(''); }} className="appearance-none w-full bg-mvxdark border border-mvxborder text-white py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:border-mvxteal focus:ring-1 focus:ring-mvxteal transition-all text-sm font-medium cursor-pointer">
                    <option value="" className="bg-mvxcard">All Categories</option>
                    {Object.keys(traitDictionary).sort().map(cat => (
                      <option key={cat} value={cat} className="bg-mvxcard">{cat}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400"><i className="fa-solid fa-chevron-down text-xs"></i></div>
                </div>

                <div className="relative w-full sm:w-40 lg:w-48">
                  <select value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)} disabled={!selectedCategory} className="appearance-none w-full bg-mvxdark border border-mvxborder text-white py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:border-mvxteal focus:ring-1 focus:ring-mvxteal transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                    <option value="" className="bg-mvxcard">All Values</option>
                    {selectedCategory && Array.from(traitDictionary[selectedCategory] ||[]).sort().map(val => (
                      <option key={val} value={val} className="bg-mvxcard">{val}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400"><i className="fa-solid fa-chevron-down text-xs"></i></div>
                </div>
              </div>
            </div>

            {loading && (
              <div className="text-center py-20 text-gray-400">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4 text-mvxteal"></i>
                <p className="font-medium tracking-wide">Syncing with MultiversX Blockchain...</p>
              </div>
            )}
            {error && <div className="text-center py-20 bg-red-900/10 border border-red-500/30 rounded-xl text-red-400">{error}</div>}
            {!loading && !error && filteredNfts.length === 0 && (
              <div className="text-center py-20 text-gray-500 bg-mvxsurface border border-mvxborder rounded-xl">
                <i className="fa-solid fa-ghost text-5xl mb-4 opacity-30"></i>
                <p className="font-medium">No NFTs found.</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {!loading && filteredNfts.map(nft => {
                const imageUrl = (nft.media && nft.media.length > 0) ? nft.media[0].url : nft.url;
                return (
                  <div key={nft.identifier} className="bg-mvxcard border border-mvxborder rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(35,247,221,0.4)] hover:border-mvxteal group cursor-pointer">
                    <div className="aspect-square bg-mvxdark overflow-hidden relative">
                      <img src={imageUrl} alt={nft.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-mono px-2 py-1 rounded border border-white/10">#{nft.nonce}</div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-mvxteal transition-colors" title={nft.name}>{nft.name || 'Unnamed Asset'}</h3>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500 truncate mr-2">{nft.identifier}</span>
                        <i className="fa-solid fa-cube text-mvxteal/50 text-xs"></i>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB: TRAILER --- */}
        {activeTab === 'posts' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-mvxsurface border border-mvxborder rounded-2xl overflow-hidden shadow-2xl p-1">
              <div className="w-full bg-black rounded-xl overflow-hidden relative group">
                {/* Note: Make sure to rename your local file from Olive-strip.mp4 to empyreans-trailer.mp4 inside the /public/media folder */}
                <video src="/media/empyreans-trailer.mp4" controls playsInline controlsList="nodownload" className="w-full max-h-[70vh] object-contain">
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mvxteal to-mvxblue mb-2">The Empyreans Experience</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  A cinematic look into the Empyreans universe. Exclusive behind-the-scenes visuals mapping the conceptual phase of our MultiversX digital assets.
                </p>
                <div className="flex items-center justify-between border-t border-mvxborder pt-4">
                  <div className="flex items-center gap-3">
                    <img src="https://mediadev.oox.art/nfts/collections/OLVGROVE-90fae5/profilePicture.webp" alt="Creator" className="w-8 h-8 rounded-full border border-gray-600" />
                    <span className="text-sm font-medium text-gray-300">Empyreans Studios</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

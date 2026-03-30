'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ExtensionLoginButton, WebWalletLoginButton, WalletConnectLoginButton } from '@multiversx/sdk-dapp/UI';
import { useGetIsLoggedIn, useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { Address } from '@multiversx/sdk-core';
import { X, Globe, Shield, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import New Components
import TopNav from './Navigation/TopNav';
import Hero from './Hero/Hero';
import NFTExplorer from './NFT/NFTExplorer';
const COLLECTION_ID = 'EMP-897b49';
const VAULT_ADDRESS = 'erd18x0qllr9h9xy4xvdd6pycg8px3jh8dk66x0kq2g3eyq4meyp6must0qqzs';

export default function Dashboard() {
  const isLoggedIn = useGetIsLoggedIn();
  const { address } = useGetAccountInfo();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // --- Dashboard Data State ---

  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // --- Filter & Search State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [traitDictionary, setTraitDictionary] = useState<Record<string, Set<string>>>({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedNfts, setSelectedNfts] = useState<any[]>([]);

  // 1. Fetch NFTs from Blockchain API
  useEffect(() => {
    const fetchNFTs = async () => {
      if (!isLoggedIn || !address) {
        setNfts([]);
        setLoading(false);
        setTraitDictionary({});
        setSelectedNfts([]);
        return;
      }

      setLoading(true);
      setError('');
      try {
        // Fetch only NFTs owned by the logged-in wallet from the specific collection
        let fetchUrl = `https://api.multiversx.com/accounts/${address}/nfts?collection=${COLLECTION_ID}&size=2000&withMetadata=true`;
        
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`Blockchain API error! status: ${response.status}`);
        
        const data = await response.json();
        setNfts(data);

        // Build trait dictionary from the user's owned NFTs
        extractTraits(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [isLoggedIn, address]);

  // Helper: Build Category/Value dropdown dynamically
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

  // 2. Local Filter (Search + Traits)
  const filteredNfts = useMemo(() => {
    return nfts.filter(nft => {
      // 1. Search Filter
      const matchName = nft.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchId = nft.identifier?.toLowerCase().includes(searchQuery.toLowerCase());
      const searchMatch = matchName || matchId;

      // 2. Trait Filter
      let traitMatch = true;
      if (selectedCategory && selectedValue) {
        traitMatch = nft.metadata?.attributes?.some((attr: any) => 
          attr.trait_type === selectedCategory && attr.value === selectedValue
        );
      }

      return searchMatch && traitMatch;
    });
  },[nfts, searchQuery, selectedCategory, selectedValue]);

  // Utility: Hex Encoding and Padding
  const toHex = (str: string) => {
    return Array.from(str)
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  };

  const padHex = (hex: string) => {
    return hex.length % 2 === 0 ? hex : '0' + hex;
  };

  // 3. Individual Transfer Action
  const handleTransferToVault = async (nft: any) => {
    if (!isLoggedIn || !address) return;

    try {
      const receiverAddressHex = Address.fromBech32(VAULT_ADDRESS).hex();
      const tokenIdentifierHex = toHex(nft.collection);
      const nonceHex = padHex(nft.nonce.toString(16));
      const quantityHex = '01'; 
      
      const txData = `ESDTNFTTransfer@${tokenIdentifierHex}@${nonceHex}@${quantityHex}@${receiverAddressHex}`;

      const transferTransaction = {
        value: '0',
        data: txData,
        receiver: address, 
        gasLimit: 1000000,
        chainID: '1' 
      };

      await sendTransactions({
        transactions: [transferTransaction],
        transactionsDisplayInfo: {
          processingMessage: `Transferring ${nft.name || nft.identifier} to vault...`,
          errorMessage: 'Transfer failed. Please check your signature or address.',
          successMessage: 'NFT successfully sent to the vault.'
        }
      });
    } catch (err: any) {
      console.error('Transfer preparation error:', err);
      alert(`Transfer Error: ${err.message}`);
    }
  };

  // 4. Bulk Transfer Action (MultiESDTNFTTransfer)
  const handleBulkTransferToVault = async () => {
    if (!isLoggedIn || !address || selectedNfts.length === 0) return;

    try {
      const receiverAddressHex = Address.fromBech32(VAULT_ADDRESS).hex();
      const numTokensHex = padHex(selectedNfts.length.toString(16));
      
      // MultiESDTNFTTransfer@<receiver>@<num_tokens>@<token1_id>@<nonce1>@<amount1>@...
      let txData = `MultiESDTNFTTransfer@${receiverAddressHex}@${numTokensHex}`;

      selectedNfts.forEach(nft => {
        const tokenIdentifierHex = toHex(nft.collection);
        const nonceHex = padHex(nft.nonce.toString(16));
        const quantityHex = '01'; // Standard NFT amount is 1
        txData += `@${tokenIdentifierHex}@${nonceHex}@${quantityHex}`;
      });


      const bulkTransaction = {
        value: '0',
        data: txData,
        receiver: address, // Protocol requirement for direct transfers
        gasLimit: Math.max(1000000, 500000 + (selectedNfts.length * 300000)), // dynamic gas
        chainID: '1'
      };

      await sendTransactions({
        transactions: [bulkTransaction],
        transactionsDisplayInfo: {
          processingMessage: `Sending ${selectedNfts.length} artifacts to vault...`,
          errorMessage: 'Bulk transfer failed. Please check your signature.',
          successMessage: `${selectedNfts.length} artifacts successfully moved!`
        }
      });

      // Clear selection on success
      setSelectedNfts([]);
    } catch (err: any) {
      console.error('Bulk Transfer Error:', err);
      alert(`Bulk Transfer Error: ${err.message}`);
    }
  };

  const toggleNftSelection = (nft: any) => {
    setSelectedNfts(prev => {
      const isSelected = prev.find(item => item.identifier === nft.identifier);
      if (isSelected) {
        return prev.filter(item => item.identifier !== nft.identifier);
      } else {
        return [...prev, nft];
      }
    });
  };


  return (
    <div className="min-h-screen bg-mvxdark overflow-hidden">
      {/* 1. NAVIGATION */}
      <TopNav onOpenLogin={() => setIsLoginModalOpen(true)} />

      {/* 2. LOGIN MODAL (unchanged) */}
      <AnimatePresence>
        {isLoginModalOpen && !isLoggedIn && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsLoginModalOpen(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm glass-card rounded-[2.5rem] p-8 border-mvxteal/20"
                >
                    <button 
                        onClick={() => setIsLoginModalOpen(false)}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors text-mvxmuted hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mvxteal to-mvxblue flex items-center justify-center text-black mb-6 shadow-[0_0_30px_rgba(35,247,221,0.3)]">
                            <Shield className="w-8 h-8 fill-current" />
                        </div>
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Connect <span className="text-mvxteal">Portal</span></h2>
                        <p className="text-mvxmuted text-sm font-medium">Authenticate your wallet to continue.</p>
                    </div>

                    <div className="flex flex-col gap-2 wallet-buttons">
                        <WalletConnectLoginButton callbackRoute="/" loginButtonText="xPortal App" />
                        <ExtensionLoginButton callbackRoute="/" loginButtonText="Browser Extension" />
                        <WebWalletLoginButton callbackRoute="/" loginButtonText="MultiversX Web Wallet" />
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <main className="relative pt-20">
        <div className="max-w-7xl mx-auto px-6 pb-32">
            <NFTExplorer 
                nfts={filteredNfts}
                loading={loading}
                error={error}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                traitDictionary={traitDictionary}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedValue={selectedValue}
                setSelectedValue={setSelectedValue}
                onOpenLogin={() => setIsLoginModalOpen(true)}
                onTransfer={handleTransferToVault}
                selectedNfts={selectedNfts}
                onToggleSelection={toggleNftSelection}
            />
        </div>
      </main>

      {/* 3. BULK ACTION BAR */}
      <AnimatePresence>
        {selectedNfts.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6"
          >
            <div className="glass-card rounded-3xl p-4 border-mvxteal/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-mvxteal text-xs font-black uppercase tracking-widest leading-none mb-1">Batch Transfer</span>
                <span className="text-white text-lg font-bold">{selectedNfts.length} Assets Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedNfts([])}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-mvxmuted hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleBulkTransferToVault}
                  className="btn-primary px-6 py-3 shadow-[0_0_20px_rgba(35,247,221,0.25)]"
                >
                  <Globe className="w-4 h-4" />
                  Send to Vault
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>




      <footer className="py-20 border-t border-white/5 relative z-10 bg-mvxdark">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <span className="text-xl font-black italic text-white uppercase tracking-tighter mb-2">Empyreans</span>
                  <p className="text-mvxmuted text-xs font-medium max-w-xs">All rights reserved © 2026. Built on MultiversX Blockchain.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                  <Globe className="w-4 h-4 text-mvxteal" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">System Status: Online</span>
              </div>
          </div>
      </footer>
    </div>
  );
}

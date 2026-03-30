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

  // 1. Fetch NFTs from Blockchain API
  useEffect(() => {
    const fetchNFTs = async () => {
      if (!isLoggedIn || !address) {
        setNfts([]);
        setLoading(false);
        setTraitDictionary({});
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

  // Utility: Hex Encoding without Buffer for browser safety
  const toHex = (str: string) => {
    return Array.from(str)
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  };

  // 3. Transfer Action (Refined with MultiversX Skills)
  const handleTransferToVault = async (nft: any) => {
    if (!isLoggedIn || !address) return;

    try {
      // 1. Validate & Encode Address
      const receiverAddressHex = Address.fromBech32(VAULT_ADDRESS).hex();
      
      // 2. Encode Token ID and Nonce
      // Note: nft.collection is the collection ID (e.g. EMP-897b49)
      const tokenIdentifierHex = toHex(nft.collection);
      const nonceHex = nft.nonce.toString(16).padStart(2, '0');
      const quantityHex = '01'; // Standard NFT amount is 1
      
      // 3. Construct Data Field
      // Format: ESDTNFTTransfer@{TokenIdHex}@{NonceHex}@{QuantityHex}@{ToAddressHex}
      const txData = `ESDTNFTTransfer@${tokenIdentifierHex}@${nonceHex}@${quantityHex}@${receiverAddressHex}`;

      // 4. Create Transaction Profile
      const transferTransaction = {
        value: '0',
        data: txData,
        receiver: address, // Protocol REQUIREMENT: Must be sender for ESDTNFTTransfer to user accounts
        gasLimit: 1000000,
        chainID: '1' // Mainnet
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
      // More descriptive error handling for the user
      const msg = err.message === 'ErrAddressCannotCreate' 
        ? 'Invalid Vault Address checksum. Please check the address.' 
        : err.message;
      alert(`Transfer Error: ${msg}`);
    }
  };


  return (
    <div className="min-h-screen bg-mvxdark overflow-hidden">
      {/* 1. NAVIGATION */}
      <TopNav onOpenLogin={() => setIsLoginModalOpen(true)} />

      {/* 2. LOGIN MODAL */}
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
        <Hero />
        
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
            />
        </div>
      </main>



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

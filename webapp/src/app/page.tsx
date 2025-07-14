"use client"

import { VideoCapture } from "@scarf/components/VideoCapture";
import { WalletConnect } from "@scarf/components/WalletConnect";
import { BiometricContractClient } from "../contracts/contractHelpers";
import { useState } from "react";
import useGlobalAuthenticationStore from "@scarf/store/wallet";
import { AnimatedBackground } from "../components/animated-background";

export default function Home() {
  const [biometricHash, setBiometricHash] = useState<string>('');
  const [didCreated, setDidCreated] = useState<string>('');
  const [isCreatingDID, setIsCreatingDID] = useState(false);
  
  // Obtener wallet address del store
  const walletAddress = useGlobalAuthenticationStore((state) => state.address);

  const handleBiometricHash = (hash: string) => {
    setBiometricHash(hash);
    console.log('✅ Biometric hash generated:', hash);
  };

  const createDID = async () => {
    if (!walletAddress || !biometricHash) {
      alert('Necesitas conectar wallet y generar hash biométrico primero');
      return;
    }

    setIsCreatingDID(true);
    
    try {
      console.log('🚀 Initiating REAL transaction on Stellar testnet...');
      
      // Usar el cliente del contrato REAL
      const contractClient = new BiometricContractClient();
      
      // Llamada REAL al smart contract en testnet
      const didResult = await contractClient.createDID(
        walletAddress,
        biometricHash
      );
      
      setDidCreated(didResult);
      
      console.log('✅ REAL DID created on testnet:', didResult);
      
      // Opcional: verificar que se creó
      const hasDidNow = await contractClient.hasDID(walletAddress);
      console.log('🔍 DID verification:', hasDidNow);
      
    } catch (error) {
      console.error('❌ Error creating DID on testnet:', error);
      alert(`Error al crear DID: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsCreatingDID(false);
    }
  };
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <AnimatedBackground />
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🔐 Biometric DID System
          </h1>
          <p className="text-xl text-white-600 mb-4">
            Sistema de Identidad Digital con Biométricos en Stellar
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full">
            <span className="text-blue-800 font-semibold">
              🌐 LIVE on Stellar Testnet
            </span>
          </div>
          <div className="mt-2 text-sm text-white-500">
            Contract: CBF24N5...SE4H
          </div>
        </div>
      

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Wallet Connection */}
          <WalletConnect />
          
          {/* Video Capture */}
          <VideoCapture onBiometricHash={handleBiometricHash} />
        </div>

        {/* Status Indicators */}
        <div className="flex justify-center space-x-4 mb-8">
          <div className={`px-4 py-2 rounded-full font-semibold transition-all ${
            walletAddress ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
          }`}>
            {walletAddress ? '✅ Wallet Conectada' : '⏳ Conectar Wallet'}
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold transition-all ${
            biometricHash ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
          }`}>
            {biometricHash ? '✅ Biométricos Capturados' : '⏳ Capturar Biométricos'}
          </div>
        </div>

        {/* Create DID Section - TRANSACCIÓN REAL */}
        {walletAddress && biometricHash && (
          <div className="bg-blue-500/20 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-blue-300/30 mb-6">
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
              ⛓️ Crear DID en Blockchain
            </h3>
            
            <div className="bg-blue-400/20 backdrop-blur-sm p-4 rounded-lg mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Wallet:</span>
                <span className="font-mono text-sm bg-blue-200/30 px-2 py-1 rounded">
                  {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 8)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Hash Biométrico:</span>
                <span className="font-mono text-sm bg-blue-200/30 px-2 py-1 rounded">
                  {biometricHash.substring(0, 16)}...
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Network:</span>
                <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  🌐 Stellar Testnet
                </span>
              </div>
            </div>
            
            <button
              onClick={createDID}
              disabled={isCreatingDID}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-lg hover:from-green-600 hover:to-emerald-700 font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingDID ? '⏳ Creando DID en Testnet...' : '🆔 Crear DID en Blockchain'}
            </button>
            
            <div className="mt-3 text-center text-sm text-white-500">
              ⚠️ Esta será una transacción REAL en Stellar testnet
            </div>
          </div>
        )}

        {/* DID Created Success */}
        {didCreated && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-8 rounded-xl shadow-lg border border-green-200">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-2xl font-bold text-green-800">
                ¡DID Creado en Testnet!
              </h3>
            </div>
            
            <div className="bg-blue-200/30 backdrop-blur-sm p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2 font-medium">Identificador DID:</p>
              <p className="font-mono text-lg break-all text-green-700 bg-green-50 p-3 rounded">
                {didCreated}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-green-700 font-medium mb-2">
                ✅ Identidad registrada exitosamente en Stellar blockchain
              </p>
              <a 
                href="https://stellar.expert/explorer/testnet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                🔗 Ver en Stellar Explorer
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

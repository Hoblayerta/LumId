import { useState } from 'react';
import { VideoCapture } from './components/VideoCapture';
import { WalletConnect } from './components/WalletConnect';
import { BiometricContractClient } from './contracts/contractHelpers';

function App() {
  const [walletPublicKey, setWalletPublicKey] = useState<string>('');
  const [biometricHash, setBiometricHash] = useState<string>('');
  const [didCreated, setDidCreated] = useState<string>('');
  const [isCreatingDID, setIsCreatingDID] = useState(false);

  const handleWalletConnect = (publicKey: string) => {
    setWalletPublicKey(publicKey);
    console.log('Wallet connected:', publicKey);
  };

  const handleBiometricHash = (hash: string) => {
    setBiometricHash(hash);
    console.log('Biometric hash generated:', hash);
  };

  const createDID = async () => {
    if (!walletPublicKey || !biometricHash) {
      alert('Necesitas conectar wallet y generar hash biométrico primero');
      return;
    }

    setIsCreatingDID(true);
    
    try {
      // Usar el cliente del contrato
      const contractClient = new BiometricContractClient();
      
      console.log('🚀 Iniciando creación de DID en Stellar...');
      
      const didResult = await contractClient.createDID(
        null, // sourceKeypair - por ahora null
        walletPublicKey,
        biometricHash
      );
      
      setDidCreated(didResult);
      
      console.log('✅ DID created successfully:', {
        did: didResult,
        wallet: walletPublicKey,
        biometricHash: biometricHash.substring(0, 20) + '...'
      });
      
    } catch (error) {
      console.error('❌ Error creating DID:', error);
      alert('Error al crear DID. Ver consola para detalles.');
    } finally {
      setIsCreatingDID(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🔐 Biometric DID System
          </h1>
          <p className="text-xl text-gray-600">
            Sistema de Identidad Digital con Biométricos en Stellar
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 rounded-full">
            <span className="text-blue-800 font-semibold">
              🚀 Powered by Stellar Blockchain
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Wallet Connection */}
          <WalletConnect onWalletConnect={handleWalletConnect} />
          
          {/* Video Capture */}
          <VideoCapture onBiometricHash={handleBiometricHash} />
        </div>

        {/* Status Indicators */}
        <div className="flex justify-center space-x-4 mb-8">
          <div className={`px-4 py-2 rounded-full font-semibold ${walletPublicKey ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
            {walletPublicKey ? '✅ Wallet Conectada' : '⏳ Conectar Wallet'}
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold ${biometricHash ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
            {biometricHash ? '✅ Biométricos Capturados' : '⏳ Capturar Biométricos'}
          </div>
        </div>

        {/* Create DID Section */}
        {walletPublicKey && biometricHash && (
          <div className="bg-white p-8 rounded-xl shadow-lg border mb-6">
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
              ✨ Crear Identidad Digital (DID)
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Wallet:</span>
                <span className="font-mono text-sm bg-white px-2 py-1 rounded">
                  {walletPublicKey.substring(0, 8)}...{walletPublicKey.substring(walletPublicKey.length - 8)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Hash Biométrico:</span>
                <span className="font-mono text-sm bg-white px-2 py-1 rounded">
                  {biometricHash.substring(0, 16)}...
                </span>
              </div>
            </div>
            
            <button
              onClick={createDID}
              disabled={isCreatingDID}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingDID ? '⏳ Creando DID en Stellar...' : '🆔 Crear DID en Blockchain'}
            </button>
          </div>
        )}

        {/* DID Created */}
        {didCreated && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-8 rounded-xl shadow-lg border border-green-200">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-2xl font-bold text-green-800">
                ¡DID Creado Exitosamente!
              </h3>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2 font-medium">Identificador DID:</p>
              <p className="font-mono text-lg break-all text-green-700 bg-green-50 p-3 rounded">
                {didCreated}
              </p>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-green-700 font-medium">
                ✅ Tu identidad digital ha sido registrada en Stellar blockchain
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
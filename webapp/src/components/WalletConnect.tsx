import React, { useEffect } from 'react';
import { useWallet } from '../hooks/wallet';
import useGlobalAuthenticationStore from '../store/wallet';

interface WalletConnectProps {
  onWalletConnect?: (publicKey: string) => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onWalletConnect }) => {
  const { handleConnect, handleDisconnect } = useWallet();
  const address = useGlobalAuthenticationStore((state) => state.address);

  // Notificar al padre cuando hay dirección
  useEffect(() => {
    if (address && onWalletConnect) {
      onWalletConnect(address);
      console.log('🔗 Notifying parent with address:', address);
    }
  }, [address, onWalletConnect]);

  const formatAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 8)}`;
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-blue-500/20 backdrop-blur-sm rounded-xl shadow-lg border border-blue-300/30">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        🔗 Stellar Wallet
      </h2>
      
      {!address ? (
        <div className="text-center">
          <p className="mb-4 text-gray-600">
            Conecta tu wallet Freighter para continuar
          </p>
          <button
            onClick={handleConnect}
            className="w-full bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 font-semibold transition-colors"
          >
            🚀 Conectar Freighter
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-4">
            <div className="text-green-600 text-2xl mb-2">✅</div>
            <p className="text-green-600 font-semibold">Wallet Conectada</p>
          </div>
          
          <div className="bg-blue-400/20 backdrop-blur-sm p-3 rounded-lg mb-4">
            <p className="text-sm text-gray-600 mb-1">Dirección:</p>
            <p className="font-mono text-sm text-gray-800">
              {formatAddress(address)}
            </p>
          </div>
          
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            🔌 Desconectar
          </button>
        </div>
      )}
      
      {/* Debug info */}
      <div className="mt-2 text-xs text-gray-400 text-center">
        DEBUG: address = {address || 'null'}
      </div>
    </div>
  );
};

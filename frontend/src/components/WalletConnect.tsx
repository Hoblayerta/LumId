import { useWallet } from '../hooks/wallet';
import useGlobalAuthenticationStore from '../store/wallet';

interface WalletConnectProps {
  onWalletConnect?: (publicKey: string) => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onWalletConnect }) => {
  const { handleConnect, handleDisconnect } = useWallet();
  const address = useGlobalAuthenticationStore((state) => state.address);

  // Notificar al componente padre cuando hay address
  React.useEffect(() => {
    if (address && onWalletConnect) {
      onWalletConnect(address);
    }
  }, [address, onWalletConnect]);

  const formatPublicKey = (key: string) => {
    if (!key || key.length < 10) return key;
    return `${key.substring(0, 6)}...${key.substring(key.length - 6)}`;
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg border">
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
            className="w-full bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 font-semibold disabled:opacity-50 transition-colors"
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
          
          <div className="bg-gray-100 p-3 rounded-lg mb-3">
            <p className="text-sm text-gray-600 mb-1">Dirección:</p>
            <p className="font-mono text-sm break-all">
              {formatPublicKey(address)}
            </p>
          </div>
          
          <button
            onClick={handleDisconnect}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            🔌 Desconectar
          </button>
        </div>
      )}
    </div>
  );
};
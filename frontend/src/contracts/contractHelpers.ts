import { Contract, SorobanRpc, TransactionBuilder, Networks, BASE_FEE } from '@stellar/stellar-sdk';

// Configuración para testnet
const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
const networkPassphrase = Networks.TESTNET;

// ID del contrato (lo actualizaremos después del deploy)
const CONTRACT_ID = 'YOUR_CONTRACT_ID_HERE';

export interface BiometricDID {
  wallet_address: string;
  biometric_hash: string;
  created_at: number;
  is_verified: boolean;
}

export class BiometricContractClient {
  constructor(private contractId: string = CONTRACT_ID) {}

  async createDID(
    sourceKeypair: any,
    walletAddress: string,
    biometricHash: string
  ): Promise<string> {
    try {
      console.log('Creating DID with:', {
        walletAddress,
        biometricHash: biometricHash.substring(0, 20) + '...'
      });
      
      // Simular transacción por ahora
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return `did:stellar:${walletAddress}`;
    } catch (error) {
      console.error('Error creating DID:', error);
      throw error;
    }
  }

  async verifyBiometrics(
    walletAddress: string,
    biometricHash: string
  ): Promise<boolean> {
    try {
      console.log('Verifying biometrics for:', walletAddress);
      return true;
    } catch (error) {
      console.error('Error verifying biometrics:', error);
      return false;
    }
  }

  async hasDID(walletAddress: string): Promise<boolean> {
    try {
      console.log('Checking DID for:', walletAddress);
      return false;
    } catch (error) {
      console.error('Error checking DID:', error);
      return false;
    }
  }
}
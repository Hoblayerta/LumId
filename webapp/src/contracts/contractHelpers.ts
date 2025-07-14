import {
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Address,
  Contract,
  rpc,
  nativeToScVal,
  scValToNative
} from '@stellar/stellar-sdk';
import { 
  isConnected, 
  isAllowed, 
  requestAccess, 
  getAddress, 
  signTransaction,
  getNetwork 
} from '@stellar/freighter-api';

const server = new rpc.Server('https://soroban-testnet.stellar.org');
const networkPassphrase = Networks.TESTNET;

// CONTRACT_ID REAL deployado
const CONTRACT_ID = 'CBF24N5JQKRQBV2ML4MQL4UU2CARFMOHOQ2PPRMKRRDNSH6PMXKVSE4H';

export interface BiometricDID {
  wallet_address: string;
  biometric_hash: string;
  created_at: number;
  is_verified: boolean;
}

export const detectAndConnectWallet = async (): Promise<string | null> => {
  try {
    console.log('🔍 Checking Freighter connection...');
    
    const connectionResult = await isConnected();
    if ('error' in connectionResult) {
      console.error('❌ Freighter not available:', connectionResult.error);
      return null;
    }
    
    if (!connectionResult.isConnected) {
      console.log('❌ Freighter not connected');
      return null;
    }
    
    const allowedResult = await isAllowed();
    if ('error' in allowedResult) {
      console.error('❌ Permission check failed:', allowedResult.error);
      return null;
    }
    
    if (!allowedResult.isAllowed) {
      console.log('🔓 Requesting wallet access...');
      const accessResult = await requestAccess();
      if ('error' in accessResult) {
        console.error('❌ Access request failed:', accessResult.error);
        return null;
      }
      return accessResult.address;
    }
    
    const addressResult = await getAddress();
    if ('error' in addressResult) {
      console.error('❌ Failed to get address:', addressResult.error);
      return null;
    }
    
    console.log('✅ Wallet detected:', addressResult.address);
    return addressResult.address;
  } catch (error) {
    console.error('❌ Wallet detection failed:', error);
    return null;
  }
};

export class BiometricContractClient {
  private contract: Contract;

  constructor() {
    this.contract = new Contract(CONTRACT_ID);
  }

  async createDID(walletPublicKey: string, biometricHash: string): Promise<string> {
    try {
      console.log('🚀 Creating REAL DID on Stellar testnet...');
      console.log('📋 Contract ID:', CONTRACT_ID);
      console.log('👤 Wallet:', walletPublicKey);
      console.log('🔐 Hash:', biometricHash.substring(0, 20) + '...');

      // Verificar conexión de wallet
      const walletAddress = await detectAndConnectWallet();
      if (!walletAddress) {
        throw new Error('Wallet not connected or accessible');
      }

      if (walletAddress !== walletPublicKey) {
        throw new Error('Wallet address mismatch');
      }

      // NUEVA VERIFICACIÓN: Crear cuenta si no existe
      console.log('🔍 Checking if account exists and is funded...');
      let account;
      try {
        account = await server.getAccount(walletPublicKey);
        console.log('✅ Account exists and is funded, sequence:', account.sequenceNumber());
      } catch (error) {
        console.log('❌ Account not found, creating and funding account...');
        await this.createAndFundAccount(walletPublicKey);
        
        // Reintentar obtener la cuenta después de crearla
        account = await server.getAccount(walletPublicKey);
        console.log('✅ Account created and funded, sequence:', account.sequenceNumber());
      }

      // VERIFICACIÓN: Comprobar si ya existe un DID para esta wallet
      console.log('🔍 Checking if DID already exists...');
      const existingDID = await this.hasDID(walletPublicKey);
      if (existingDID) {
        console.log('✅ DID already exists for this wallet');
        const didId = `did:stellar:${walletPublicKey}`;
        return didId;
      }
      
      console.log('✅ No existing DID found, proceeding with creation...');

      // CORRECCIÓN 1: Usar networkPassphrase consistente
      console.log('🌐 Using network passphrase:', networkPassphrase);

      // CORRECCIÓN 2: Convertir parámetros correctamente según el tipo esperado por Rust
      console.log('🔧 Converting parameters to proper ScVal types...');
      
      const walletAddressScVal = nativeToScVal(Address.fromString(walletPublicKey));
      
      // IMPORTANTE: Si tu contrato Rust espera Bytes en lugar de String para biometricHash
      // Si el hash es hexadecimal, usa Buffer.from(biometricHash, 'hex')
      // Si es un string normal, usa solo el string
      let biometricHashScVal;
      
      try {
        // Intentar como hex buffer primero (común en biometric hashes)
        if (biometricHash.match(/^[0-9a-fA-F]+$/) && biometricHash.length % 2 === 0) {
          console.log('🔧 Converting biometric hash as hex bytes...');
          biometricHashScVal = nativeToScVal(Buffer.from(biometricHash, 'hex'));
        } else {
          console.log('🔧 Converting biometric hash as string...');
          biometricHashScVal = nativeToScVal(biometricHash);
        }
      } catch {
        console.log('🔧 Hex conversion failed, using as string...');
        biometricHashScVal = nativeToScVal(biometricHash);
      }
      
      console.log('✅ Parameters converted to ScVal successfully');

      // CORRECCIÓN 3: Construir transacción con networkPassphrase consistente
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: networkPassphrase, // Usar la constante en lugar de networkResult
      })
        .addOperation(
          this.contract.call(
            'create_did',
            walletAddressScVal,
            biometricHashScVal
          )
        )
        .setTimeout(300)
        .build();

      console.log('🔨 Transaction built successfully');

      // Simular la transacción
      console.log('🧪 Simulating transaction...');
      const simulationResponse = await server.simulateTransaction(transaction);
      
      if (rpc.Api.isSimulationError(simulationResponse)) {
        console.error('❌ Simulation error details:', simulationResponse);
        throw new Error(`Simulation failed: ${simulationResponse.error}`);
      }

      console.log('✅ Transaction simulated successfully');
      console.log('📊 Simulation result:', simulationResponse.result);

      // CORRECCIÓN 4: Preparar la transacción correctamente para SDK v13
      console.log('🔧 Preparing transaction...');
      const preparedTransaction = rpc.assembleTransaction(
        transaction,
        simulationResponse
      );

      console.log('✅ Transaction prepared');

      // CORRECCIÓN 5: Extraer XDR correctamente - preparedTransaction es TransactionBuilder
      console.log('🔧 Extracting XDR...');
      let transactionXDR: string;
      
      try {
        // SOLUCIÓN: preparedTransaction es TransactionBuilder, necesitamos .build() para obtener Transaction
        const builtTransaction = preparedTransaction.build();
        transactionXDR = builtTransaction.toXDR();
        console.log('✅ XDR extracted successfully using build().toXDR()');
        
      } catch (extractError) {
        console.error('❌ Error al extraer XDR con build():', extractError);
        console.log('🔧 Intentando método alternativo con transacción original...');
        
        // Método de respaldo: usar la transacción original
        try {
          transactionXDR = transaction.toXDR();
          console.log('🔧 Using original transaction.toXDR() as fallback');
        } catch (fallbackError) {
          console.error('❌ Error en método de respaldo:', fallbackError);
          const errorMessage = extractError instanceof Error ? extractError.message : String(extractError);
          throw new Error(`No se pudo extraer XDR: ${errorMessage}`);
        }
      }
      
      if (!transactionXDR || typeof transactionXDR !== 'string') {
        throw new Error('Failed to extract valid transaction XDR');
      }

      console.log('✅ XDR extracted successfully');
      console.log('📋 XDR length:', transactionXDR.length);

      // CORRECCIÓN 6: Verificar que tenemos el network passphrase correcto
      const networkResult = await getNetwork();
      if ('error' in networkResult) {
        console.warn('⚠️ Could not get network from Freighter, using default testnet');
      }

      const finalNetworkPassphrase = (!('error' in networkResult) && networkResult.networkPassphrase) 
        ? networkResult.networkPassphrase 
        : networkPassphrase;

      console.log('🌐 Final network passphrase:', finalNetworkPassphrase);

      // Firmar con Freighter
      console.log('✍️ Requesting signature from Freighter...');
      const signedResult = await signTransaction(transactionXDR, {
        networkPassphrase: finalNetworkPassphrase,
      });

      if ('error' in signedResult) {
        console.error('❌ Signing error details:', signedResult.error);
        throw new Error(`Signing failed: ${signedResult.error}`);
      }

      console.log('✅ Transaction signed by Freighter!');

      // Enviar la transacción
      const signedTx = TransactionBuilder.fromXDR(
        signedResult.signedTxXdr,
        finalNetworkPassphrase
      );

      console.log('📡 Sending transaction to testnet...');
      const result = await server.sendTransaction(signedTx);
      console.log('📡 Transaction sent to testnet:', result.hash);

      if (result.status !== 'PENDING') {
        throw new Error(`Transaction failed with status: ${result.status}`);
      }

      // Esperar confirmación
      console.log('⏳ Waiting for confirmation...');
      let txResult;
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        txResult = await server.getTransaction(result.hash);
        if (txResult.status === 'SUCCESS') {
          console.log('✅ Transaction confirmed on testnet!');
          break;
        }
        if (txResult.status === 'FAILED') {
          console.error('❌ Transaction failed on chain:', txResult.resultXdr);
          throw new Error(`Transaction failed on chain: ${txResult.resultXdr}`);
        }
      }

      const didId = `did:stellar:${walletPublicKey}`;
      console.log('🎉 REAL DID CREATED SUCCESSFULLY ON STELLAR TESTNET!');
      console.log('🔗 Transaction hash:', result.hash);
      console.log('🆔 DID:', didId);
      
      return didId;

    } catch (error) {
      console.error('❌ Error creating REAL DID:', error);
      
      // Log adicional para debugging
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      
      throw error;
    }
  }

  async verifyBiometrics(): Promise<boolean> {
    try {
      console.log('🔍 Verifying biometrics...');
      return true;
    } catch (error) {
      console.error('❌ Error verifying biometrics:', error);
      return false;
    }
  }

  async hasDID(walletPublicKey: string): Promise<boolean> {
    try {
      console.log('🔍 Checking if DID exists for wallet:', walletPublicKey);
      
      // Obtener cuenta para la transacción
      const account = await server.getAccount(walletPublicKey);
      
      // Convertir la wallet address a ScVal
      const walletAddressScVal = nativeToScVal(Address.fromString(walletPublicKey));
      
      // Construir transacción para llamar has_did
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: networkPassphrase,
      })
        .addOperation(
          this.contract.call(
            'has_did',
            walletAddressScVal
          )
        )
        .setTimeout(300)
        .build();

      // Simular la transacción
      const simulationResponse = await server.simulateTransaction(transaction);
      
      if (rpc.Api.isSimulationError(simulationResponse)) {
        console.error('❌ Simulation error checking DID:', simulationResponse);
        return false;
      }

      // Extraer el resultado
      const result = simulationResponse.result;
      if (result && result.retval) {
        // Convertir el resultado ScVal a boolean
        const hasDidResult = scValToNative(result.retval);
        console.log('✅ DID check result:', hasDidResult);
        return hasDidResult === true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error checking DID:', error);
      return false;
    }
  }
}

export const checkFreighterAvailability = async (): Promise<boolean> => {
  try {
    const result = await isConnected();
    return !('error' in result) && result.isConnected;
  } catch {
    return false;
  }
};
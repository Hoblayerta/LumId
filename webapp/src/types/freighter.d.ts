declare global {
  interface Window {
    freighter?: {
      isConnected(): Promise<{ isConnected: boolean; error?: string }>;
      getAddress(): Promise<{ address: string; error?: string }>;
      signTransaction(xdr: string, opts?: { networkPassphrase?: string }): Promise<{ signedTxXdr: string; signerAddress: string; error?: string }>;
      isAllowed(): Promise<{ isAllowed: boolean; error?: string }>;
      requestAccess(): Promise<{ address: string; error?: string }>;
      getNetwork(): Promise<{ network: string; networkPassphrase: string; error?: string }>;
    };
  }
}

export {};

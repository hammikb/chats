import React, { ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletContext: React.FC<{ children: ReactNode }> = ({ children }) => {
  const endpoint = useMemo(() => "https://api.mainnet-beta.solana.com", []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      {/* Pass an empty array to the wallets prop */}
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContext;

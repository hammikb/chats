import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { signUpWithWallet } from '../../api/signUpWithWallet';

const SignUpButton: React.FC = () => {
  const wallet = useWallet();

  const handleSignUp = async () => {
    await signUpWithWallet(wallet);
  };

  return (
    <div>
      <WalletMultiButton />
      <button onClick={handleSignUp} disabled={!wallet.connected}>
        Sign Up with Wallet
      </button>
    </div>
  );
};

export default SignUpButton;

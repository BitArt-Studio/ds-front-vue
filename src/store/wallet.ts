import store from './index';
import { ethers } from 'ethers';

type WalletState = {
  balance: bigint;
  address: string;
  signer: any;
  chainId: bigint;
};

const useWalletStore = defineStore({
  id: 'wallet',
  state: () => {
    return {
      wallet: { balance: 0n, address: '', signer: null, chainId: 0n } as WalletState,
    };
  },
  getters: {
    getWallet(): WalletState {
      return this.wallet;
    },
    isConnect(): boolean {
      return !!this.wallet.address;
    },
    isChainId(): boolean {
      return this.wallet.chainId === BigInt(import.meta.env.VITE_CHAIN_ID);
    },
  },
  actions: {
    async connectWallet() {
      if (this.wallet.address) {
        return;
      }
      let provider: ethers.BrowserProvider;
      // @ts-ignore
      if (window.ethereum == null) {
        // @ts-ignore
        provider = ethers.getDefaultProvider();
      } else {
        // @ts-ignore
        provider = new ethers.BrowserProvider(window.ethereum);
      }

      const signer = await provider.getSigner();
      // 读取钱包地址
      const accounts = await provider.send('eth_requestAccounts', []);

      // 读取ETH余额
      const balance = await provider.getBalance(signer.getAddress());
      this.wallet = {
        chainId: (await provider.getNetwork()).chainId,
        signer: signer,
        address: accounts[0],
        balance: balance,
      };
    },
    disconnect() {
      this.wallet = {
        chainId: 0n,
        balance: 0n,
        address: '',
        signer: null,
      };
    },
  },
});

const useWalletStoreWithOut = () => {
  return useWalletStore(store);
};

export default useWalletStoreWithOut;

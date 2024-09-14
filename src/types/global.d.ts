export {};

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (...args: any[]) => Promise<any>;
      on?: (...args: any[]) => void;
      removeListener?: (...args: any[]) => void;
      // Add other properties you use
    }
  }
}
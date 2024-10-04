declare module '@/utils/ipfsUtil' {
    export function uploadToIPFS(data: any): Promise<string>;
    export function fetchFromIPFS(cid: string): Promise<any>;
  }
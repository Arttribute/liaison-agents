import { PinataService } from "../services/pinata.service.js";

export interface IpfsTool {
  uploadFileToIPFS(
    args: {
      base64String: string;
      fileName: string;
      mimeType: string;
      agentId?: string;
    }
    // _metadata: any
  ): Promise<{ ipfsUrl: string }>;
}

export class IpfsToolEngine implements IpfsTool {
  // @ts-expect-error
  async uploadFileToIPFS(
    args: {
      base64String: string;
      fileName: string;
      mimeType: string;
      agentId?: string;
    },
    _metadata: any
  ): Promise<{ ipfsUrl: string }> {
    try {
      const { base64String, fileName, mimeType } = args;

      // 1) Upload to Pinata
      const pinataResult = await new PinataService().uploadFileFromBase64(
        base64String,
        fileName,
        mimeType
      );

      // 2) Construct a gateway URL.
      // If no GATEWAY_URL is set, fallback to "gateway.pinata.cloud"
      const cid = pinataResult.IpfsHash;
      const gatewayDomain = process.env.GATEWAY_URL ?? "gateway.pinata.cloud";
      const ipfsUrl = `https://${gatewayDomain}/ipfs/${cid}`;

      // 3) Return an object with the IPFS URL
      return { ipfsUrl };
    } catch (error) {
      console.error("Error in uploadFileToIPFS:", error);
      throw error;
    }
  }
}

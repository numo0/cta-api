import { ethers } from "ethers";

export const CONTRACTS = {
  ERC1155: "0xD9FDF19006A6dEce42CED19EA195D2116c8ee717",
  ERC721:  "0x441698f426365Bbb1c16a46c1b722461567925AA",
  METADATA:"0x5Ca4322f29FAb81FbECb1ce002b9e516eaA9b6cE",
};

export const ERC_ABI  = ["function getDNA(uint256 tokenId) view returns (uint256)"];
export const META_ABI = ["function tokenURI(uint256 tokenId, uint256 dna) view returns (string)"];

export const decodeDataURI = (uri: string) => {
  const prefix = "data:application/json;base64,";
  if (!uri.startsWith(prefix)) return null;
  const b64 = uri.slice(prefix.length);
  const json = Buffer.from(b64, "base64").toString("utf8");
  return JSON.parse(json);
};

export const getProvider = () =>
  new ethers.JsonRpcProvider(process.env.RPC_URL);

export const patchImageWithS3 = (meta: any, dna: string | number) => {
  meta.image = `https://creco-images.s3.amazonaws.com/static/CryptoTeddies/${dna}.gif`;
  if (Array.isArray(meta.attributes)) {
    meta.attributes = meta.attributes.filter(
      (attr: any) =>
        attr?.value !== "None" || ["STYLE", "MOOD", "TYPE", "ACCESSORY"].includes(attr?.trait_type)
    );
  }
  return meta;
};

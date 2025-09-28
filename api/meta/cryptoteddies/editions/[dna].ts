import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ethers } from "ethers";
import { CONTRACTS, ERC_ABI, META_ABI, decodeDataURI, getProvider, patchImageWithS3 } from "../_shared.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { dna } = req.query as { dna: string };
    if (!dna || isNaN(Number(dna))) {
      return res.status(400).json({ error: "Bad edition id" });
    }

    const editionId = Number(dna);  // 👈 edition ID from URL
    const provider = getProvider();

    // 1) Fetch DNA for this editionId from ERC1155
    const editionContract = new ethers.Contract(CONTRACTS.ERC1155, ERC_ABI, provider);
    const dnaBN = await editionContract.getDNA(editionId);
    const resolvedDna = dnaBN.toString();
    if (resolvedDna === "0") {
      return res.status(404).json({ error: `Edition ${editionId} has no DNA` });
    }

    // 2) Ask metadata contract with (editionId, resolvedDna)
    const metaC = new ethers.Contract(CONTRACTS.METADATA, META_ABI, provider);
    const tokenURI: string = await metaC.tokenURI(editionId, resolvedDna);

    const meta = decodeDataURI(tokenURI);
    if (!meta) {
      return res.status(502).json({ error: "Unexpected tokenURI format" });
    }

    // 3) Patch image + filter
    patchImageWithS3(meta, resolvedDna);

    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(meta);
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: "Internal error", detail: e?.message });
  }
}

import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { ethers } from "ethers";
import { CONTRACTS, ERC_ABI, META_ABI, decodeDataURI, getProvider, patchImageWithS3 } from "../../api/meta/cryptoteddies/_shared.js";

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Extract dna/editionId from path
  const dna = event.path.split('/').pop();
  
  if (!dna || isNaN(Number(dna))) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Bad edition id" })
    };
  }

  const editionId = Number(dna);

  try {
    const provider = getProvider();

    const editionContract = new ethers.Contract(CONTRACTS.ERC1155, ERC_ABI, provider);
    const dnaBN = await editionContract.getDNA(editionId);
    const resolvedDna = dnaBN.toString();
    
    if (resolvedDna === "0") {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `Edition ${editionId} has no DNA` })
      };
    }

    const metaC = new ethers.Contract(CONTRACTS.METADATA, META_ABI, provider);
    const tokenURI: string = await metaC.tokenURI(editionId, resolvedDna);

    const meta = decodeDataURI(tokenURI);
    if (!meta) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Unexpected tokenURI format" })
      };
    }

    patchImageWithS3(meta, resolvedDna);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600"
      },
      body: JSON.stringify(meta)
    };
  } catch (e: any) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal error", detail: e?.message })
    };
  }
};
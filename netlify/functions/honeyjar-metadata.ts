import type { Handler, HandlerEvent } from "@netlify/functions";

const IMAGE_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANwAAADSCAYAAAAhUK7xAAAAAXNSR0IArs4c6QAABSdJREFUeJzt3cFqVVcYhuEccXCKQnEYSgvJUCE1SAMOvAXtRGp7CcVx8RKk4+IliKEdWK+g0EEgHdgGdJhCS4kzKVgai5jeQIvfISvfPtHnGS/23iH7ZQ3Oz9qzFf7P0dQPcMrNpn6AZXRm6geAd4ngoEhwUCQ4KBIcFAkOigQHRYKDIsFB0WmYBphk4mP/7uoUt42tffXJ0Ov9+vVPQ6+3fucgWnf0+vrQ+87OPFrqd9oOB0WCgyLBQZHgoEhwUCQ4KBIcFAkOigQHRVP+Kh9NkDy8dSG62I3716J16URFOsmx9dFOtG73t6vRumWX/r3bt88Ove/oyZqpJlLscFAkOCgSHBQJDgoEB0WCgyLBQZHgoEhwUHQSv7ZHEySjz7JYdu/aRMrbYvREih0OigQHRYKDIsFBkeCgSHBQJDgoEhwUCQ6Kxh48cQJGn0EylXSC5PDe4xN/lv8y/3Jz6PXSvyO979vyHtjhoEhwUCQ4KBIcFAkOigQHRYKDIsFBkeCgaPikSXpWyezMo2hd+vWctWjVeKMnIEZPfEzl4MWraN3eFz8Ove9U70HKDgdFgoMiwUGR4KBIcFAkOCgSHBQJDooEB0XDv55z9Pp69PWcdEJjtHTi4/vBExCpG/evTXLf9O9Nny+93sblebRutPQ98PUcOMUEB0WCgyLBQZHgoEhwUCQ4KBIcFAkOipb+6zmr57NHnF+8NPS+U01ATCX9e9MJoXhi5od/omWHT59E69KzVNIzddLJqXQixQ4HRYKDIsFBkeCgSHBQJDgoEhwUCQ6KBAdF8aRJ+ov7d59nZ1lc2cwmG0ZPkKTSCZfRDu89jtaN/srOVH9vKn4Pdn+Jln37WfZVpnQiJWWHgyLBQZHgoEhwUCQ4KBIcFAkOigQHRYKDorMrKyvRWSWpD96PPiIS23mwO/R6mxvnhl6P4xn9/02l72l69snN7edRR3Y4KBIcFAkOigQHRYKDIsFBkeCgSHBQJDgomqWTJukv7qMnTWBKf/yZDWLd3H4erbPDQZHgoEhwUCQ4KBIcFAkOigQHRYKDIsFBkeCgSHBQJDgoEhwUCQ6KBAdFgoMiwUGR4KBIcFB0Nl14ZXMerXu2//I4zwNLJX3vV7azZXY4KBIcFAkOigQHRYKDIsFBkeCgSHBQJDgoiidNUpsb56J1j/f+Gn1riKXv6cGLV0Pva4eDIsFBkeCgSHBQJDgoEhwUCQ6KBAdFgoOi2QJrj5JFf3/zYXSx+cVLC9z6zXYe7A69HqfT1Vtb0brDp0+ide/d/j29ddSSHQ6KBAdFgoMiwUGR4KBIcFAkOCgSHBQJDoqGn2mSngGxNvi+6RkVLJfRE0fpBMnos0pSdjgoEhwUCQ6KBAdFgoMiwUGR4KBIcFAkOChaZNIkOrNh/c5BdPbJ/t3spmtbH2cLYYEJkvU7B+klFzn3543scFAkOCgSHBQJDooEB0WCgyLBQZHgoEhwUDT0V/QFRRMpD29diC62cXkerVs9P/wYF44hnQzZ+/kwWvfpg+fprSd59+1wUCQ4KBIcFAkOigQHRYKDIsFBkeCgSHBQNOWkSSqaSEmlkyt0LDAZklrqd9oOB0WCgyLBQZHgoEhwUCQ4KBIcFAkOigQHRUv9q/wJGTq5wrG9U++gHQ6KBAdFgoMiwUGR4KBIcFAkOCgSHBQJDor+BS9OvYEjp+peAAAAAElFTkSuQmCC";

const METADATA = {
  name: "Honey Jar",
  description:
    "A Honey Jar from the CryptoTeddies burn economy. Collect 3 Honey Jars to redeem a handmade 1/1 OG CryptoTeddy.",
  image: IMAGE_DATA_URI,
  attributes: [
    { trait_type: "Type", value: "Honey Jar" },
  ],
};

export const handler: Handler = async (_event: HandlerEvent) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
    body: JSON.stringify(METADATA),
  };
};

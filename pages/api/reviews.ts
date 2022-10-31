import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { getUser } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

const privateKey = process.env.THIRDWEB_AUTH_PRIVATE_KEY || "";
const sdk = ThirdwebSDK.fromPrivateKey(privateKey, "polygon");

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const reviews = await prisma.review.findMany();
    return res.json({ reviews: reviews.reverse() });
  }

  if (req.method === "POST") {
    const session = await getUser(req, res);

    if (!session) {
      res.status(401).json({ message: "Not authorized." });
      return;
    }

    const { review } = req.body;

    await prisma.review.create({
      data: {
        user: (session.user as any)?.address || session.user?.email || "",
        image: session.user?.image || "",
        review,
      },
    });

    const address = (session.user as any).address;
    if (address) {
      const contract = await sdk.getEditionDrop(
        process.env.EDITION_DROP_ADDRESS || ""
      );
      const balance = await contract.balanceOf(address, 0);

      if (balance.toNumber() === 0) {
        contract.claimTo(address, 0, 1);
        return res.status(200).json({
          message:
            "Thanks for leaving a review - you've received an NFT, check your wallet!",
        });
      }
    }

    return res.status(200).json({
      message: "Thanks for leaving a review!",
    });
  }

  return res.status(400).end();
};

export default handler;

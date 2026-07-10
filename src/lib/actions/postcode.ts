"use server";

import { lookupPostcode, type PostcodeMatch } from "@/lib/auspost";

export async function lookupPostcodeAction(postcode: string): Promise<PostcodeMatch[]> {
  return lookupPostcode(postcode);
}

import type { NextApiRequest, NextApiResponse } from "next";
import {run} from "../../scripts/ingest-data-azure";
import * as fs from "node:fs";
import { join } from "path";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{
    data: {
      url: string | string[];
    } | null;
    error: string | null;
  }>
) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({
      data: null,
      error: "Method Not Allowed",
    });
    return;
  }
  // Just after the "Method Not Allowed" code
  const uploadDir = join(
    process.env.ROOT_DIR || process.cwd(),
    `/docs/`
  );
  console.log('docs dir =' + uploadDir);

  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    await run(true, false);

  } catch (e) {
      console.error(e);
      res.status(500).json({ data: null, error: "Internal Server Error" });
    
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;

import type { NextApiRequest, NextApiResponse } from "next";
import { parseForm, FormidableError } from "@/lib/parse-form";
import {run} from "../../scripts/ingest-data";
import * as fs from "node:fs";
import * as path from "node:path";
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
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({
      data: null,
      error: "Method Not Allowed",
    });
    return;
  }
  // Just after the "Method Not Allowed" code
  try {
    const { files, fields} = await parseForm(req);
    const file = files.media;
    let url = Array.isArray(file) ? file.map((f) => f.filepath) : file?.["filePath"];
    if(!url)
      url = [];

    const uploadDir = join(
      process.env.ROOT_DIR || process.cwd(),
      `/docs/tmp`
    );

    console.log('parsing dir = ' + uploadDir);
    await run(uploadDir, true, false);

    console.log('removing tmp files from : ', uploadDir);
    fs.rmSync(path.dirname(uploadDir), { recursive: true, force: true });
    res.status(200).json({
      data: {
        url,
      },
      error: null,
    });
  } catch (e) {
    if (e instanceof FormidableError) {
      res.status(e.httpCode || 400).json({ data: null, error: e.message });
    } else {
      console.error(e);
      res.status(500).json({ data: null, error: "Internal Server Error" });
    }
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;

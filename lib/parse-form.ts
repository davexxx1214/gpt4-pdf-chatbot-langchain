import type { NextApiRequest } from "next";
import mime from "mime";
import { join } from "path";
import formidable from "formidable";
import { mkdir, stat } from "fs/promises";

export const FormidableError = formidable.errors.FormidableError;

export const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return await new Promise(async (resolve, reject) => {
    const uploadDir = join(
      process.env.ROOT_DIR || process.cwd(),
      `/docs/tmp`
    );
    console.log('upload dir =' + uploadDir);
    
    try {
      await stat(uploadDir);
    } catch (e: any) {
      if (e.code === "ENOENT") {
        await mkdir(uploadDir, { recursive: true });
      } else {
        console.error(e);
        reject(e);
        return;
      }
    }

    const form = formidable({
      maxFiles: 10,
      maxFileSize: 1024 * 1024 * 10, // 10mb
      uploadDir,
      filename: (_name, _ext, part) => {
        const filename = `${_name}.${
          mime.getExtension(part.mimetype || "") || "unknown"
        }`;
        return filename;
      }
    });

    form.parse(req, function (err, fields, files) {
      if (err) reject(err);
      else resolve({ fields, files});
    });
  });
};

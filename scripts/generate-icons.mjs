import sharp from "sharp";
import fs from "node:fs";

const src = "public/logo-light.png";
const outDir = "public/icons";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const sizes = [192, 512];
for (const size of sizes) {
  await sharp(src)
    .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(`${outDir}/icon-${size}x${size}.png`);
  console.log(`created any ${size}`);

  const inner = Math.round(size * 0.66);
  const logoResized = await sharp(src)
    .resize(inner, inner, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite([{ input: logoResized, gravity: "center" }])
    .png()
    .toFile(`${outDir}/icon-${size}x${size}-maskable.png`);
  console.log(`created maskable ${size}`);
}

await sharp(src)
  .resize(180, 180, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .png()
  .toFile("public/apple-touch-icon.png");
console.log("created apple-touch");

await sharp(src)
  .resize(192, 192, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .png()
  .toFile("public/icon-192.png");
await sharp(src)
  .resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .png()
  .toFile("public/icon-512.png");
console.log("created root icons");
console.log("done");

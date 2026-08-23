import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url);
const catalog = JSON.parse(await readFile(new URL("../catalog.v1.json", import.meta.url), "utf8"));

if (catalog.catalogVersion !== 1 || !Array.isArray(catalog.plugins)) {
  throw new Error("catalog.v1.json must use catalogVersion 1 and contain plugins[]");
}

const ids = new Set();
const semver = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
const allowedPermissions = new Set(["events:pet", "pet:reaction", "timer", "config", "storage"]);

for (const item of catalog.plugins) {
  if (!item.id?.startsWith("furinapet.")) throw new Error(`invalid plugin id: ${item.id}`);
  if (ids.has(item.id)) throw new Error(`duplicate plugin id: ${item.id}`);
  ids.add(item.id);

  if (!semver.test(item.version)) throw new Error(`${item.id}: invalid version ${item.version}`);
  if (item.manifestVersion !== 1) throw new Error(`${item.id}: unsupported manifestVersion`);
  if (!item.source?.path || item.source.repository !== "sheetung/furinapet-plugins") {
    throw new Error(`${item.id}: invalid source`);
  }

  const dir = new URL(`../${item.source.path}/`, import.meta.url);
  const manifestText = await readFile(new URL("furinapet.plugin.json", dir), "utf8");
  const manifest = JSON.parse(manifestText);

  for (const key of ["id", "name", "description", "version", "manifestVersion", "sdkVersion", "minAppVersion"]) {
    if (manifest[key] !== item[key]) {
      throw new Error(`${item.id}: catalog/manifest mismatch for ${key}`);
    }
  }

  if (manifest.runtime !== "javascript" || manifest.entry !== "index.js") {
    throw new Error(`${item.id}: SDK v1 plugins must use javascript/index.js`);
  }

  for (const permission of manifest.permissions ?? []) {
    if (!allowedPermissions.has(permission)) throw new Error(`${item.id}: unknown permission ${permission}`);
  }

  for (const file of item.files ?? []) {
    const bytes = await readFile(new URL(file.path, dir));
    const actual = createHash("sha256").update(bytes).digest("hex");
    if (actual !== file.sha256) {
      throw new Error(`${item.id}/${file.path}: sha256 mismatch\nexpected ${file.sha256}\nactual   ${actual}`);
    }
  }

  const declared = new Set((item.files ?? []).map((file) => file.path));
  if (!declared.has("furinapet.plugin.json") || !declared.has(manifest.entry)) {
    throw new Error(`${item.id}: catalog must hash manifest and entry`);
  }
}

console.log(`Validated ${catalog.plugins.length} FurinaPet plugins.`);

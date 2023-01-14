import git from "isomorphic-git";
import fs from "fs";
import { join } from "path";
import { spawn } from "child_process";
import { compare, SemVer, valid } from "semver";

export const getLernaChangedPackages: () => Promise<Array<string>> = () =>
  new Promise((resolve) => {
    const cmd = spawn("node", [
      join(process.cwd(), "node_modules", ".bin", "lerna"),
      "changed",
      "--all",
      "--parseable",
      "--long",
    ]);
    cmd.stdout.on("data", (buf) =>
      resolve(
        buf
          .toString()
          .split("\n")
          .filter((str: string) => !!str)
          .map((str: string) => {
            const [, pkg] = str.split(":");
            return pkg;
          })
      )
    );
  });

export const getLastTag: () => Promise<SemVer | null> = async () => {
  const tags = (
    await git.listTags({
      fs,
      dir: process.cwd(),
    })
  ).reduce((acc, curr) => {
    const s = new SemVer(curr, { includePrerelease: true });
    if (valid(s)) {
      return [...acc, s].sort((v1, v2) => compare(v2, v1));
    } else {
      return acc;
    }
  }, [] as Array<SemVer>);

  return tags[0] ?? null;
};

export const produceNextTag: (
  prefix: string,
  prerelease?: string
) => Promise<string> = async (prefix: string, prerelease?: string) => {
  const d = new Date();
  const major = d.getFullYear();
  const minor = d.getMonth() + 1;
  const patch = d.getDate();
  const baseTag = new SemVer(`${major}.${minor}.${patch}-${prefix}.${prerelease ?? "0"}`, {
    includePrerelease: true,
  });

  const lastTag = await getLastTag();

  if (!lastTag || prerelease || compare(baseTag, lastTag) > 0) {
    return baseTag.version;
  } else {
    return lastTag.inc("prerelease").version;
  }
};

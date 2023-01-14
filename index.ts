import { produceNextTag } from "./util";
import { buildContainers } from "./container";
import git from "isomorphic-git";
import fs from "fs";
import { gitEmail, gitUsername, versionPrefix, versionPrerelease } from "./env";

(async () => {
  const nextVersion = await produceNextTag(versionPrefix, versionPrerelease);
  console.log(`Next version: ${nextVersion}`);
  await buildContainers(nextVersion);

  await git.annotatedTag({
    fs,
    dir: process.cwd(),
    ref: nextVersion,
    message: nextVersion,
    tagger: {
      email: gitEmail,
      name: gitUsername,
    },
  });
  console.log(`Tagged ${nextVersion} successfully`);
})();

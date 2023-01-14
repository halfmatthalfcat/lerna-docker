import fs from "fs";
import ignore from "ignore";
import { join } from "path";
import tarfs from "tar-fs";
import Dockerode from "dockerode";
import { getLernaChangedPackages } from "./util";
import {
  dockerBuildArgs,
  dockerImagePrefix,
  dockerLabels,
  dockerRegistry,
  dockerRegistryPassword,
  dockerRegistryUsername
} from "./env";

const fullImagePrefix = dockerImagePrefix ? join(
  dockerRegistry, dockerImagePrefix,
) : dockerRegistry;

const docker = new Dockerode();

const ig = ignore().add(
  fs.readFileSync(join(process.cwd(), ".dockerignore"), "utf8")
);

export const buildContainers = async (version: string) => {
  const changedPackages = await getLernaChangedPackages();

  const containerPackages = await changedPackages.reduce(async (acc, name) => {
    const resolvedAcc = await acc;
    name = name.split("/").pop() ?? name;

    try {
      await fs.promises.stat(
        join(process.cwd(), "docker", `${name}.Dockerfile`)
      );
      return [...resolvedAcc, name];
    } catch {
      return resolvedAcc;
    }
  }, Promise.resolve([] as Array<string>));

  if (containerPackages.length) {
    console.log(
      `Found containers to build:${containerPackages
        .map((container) => `\n\t- ${container}:${version}`)
        .join("")}`
    );
  } else {
    console.log("Found no containers to build.");
  }

  for (const project of containerPackages) {
    const pack = tarfs.pack(process.cwd(), {
      ignore: (f) => ig.ignores(f.replace(`${process.cwd()}/`, "")),
    });
    console.log(
      `Building image ${fullImagePrefix}/${project}:${version} via docker/${project}.Dockerfile`
    );
    const buildStream = await docker.buildImage(pack, {
      t: `${fullImagePrefix}/${project}:${version}`,
      dockerfile: join(process.cwd(), "docker", `${project}.Dockerfile`),
      buildargs: dockerBuildArgs(),
      labels: dockerLabels(),
    });
    await new Promise((resolve, reject) =>
      docker.modem.followProgress(buildStream, (err, res) => {
        const isErr = res.find(({ error }) => error);
        err || isErr ? reject(err || isErr.error) : resolve(res);
      })
    );
    console.log(
      `Successfully built image ${fullImagePrefix}/${project}:${version}`
    );
    const image = await docker.getImage(
      `${fullImagePrefix}/${project}:${version}`
    );
    console.log(`Pushing image ${fullImagePrefix}/${project}:${version}`);
    const pushStream = await image.push({
      ...(dockerRegistryUsername && dockerRegistryPassword ? {
        authconfig: {
          serveraddress: dockerRegistry,
          username: dockerRegistryUsername,
          password: dockerRegistryPassword,
        },
      } : {}),
    });
    await new Promise((resolve, reject) =>
      docker.modem.followProgress(pushStream, (err, res) => {
        const isErr = res.find(({ error }) => error);
        err || isErr ? reject(err || isErr.error) : resolve(res);
      })
    );
    console.log(
      `Successfully pushed image ${fullImagePrefix}/${project}:${version}`
    );
  }
};

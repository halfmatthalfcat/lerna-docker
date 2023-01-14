export const versionPrefix = (() => {
  const prefix = Object.keys(process.env).find(key => /^(?:INPUT_)?VERSION_PREFIX$/.test(key));
  if (!prefix) {
    console.log(`Version prefix required.`);
    process.exit(1);
  } else {
    return process.env[prefix]!;
  }
})();

export const versionPrerelease = (() => {
  const prerelease = Object.keys(process.env).find(key => /^(?:INPUT_)?VERSION_PRERELEASE$/.test(key));
  if (prerelease) {
    return process.env[prerelease]!;
  }
})();

export const gitEmail = (() => {
  const email = Object.keys(process.env).find(key => /^(?:INPUT_)?GIT_EMAIL$/.test(key));
  if (!email) {
    console.log(`Git email required.`);
    process.exit(1);
  } else {
    return process.env[email]!;
  }
})();

export const gitUsername = (() => {
  const username = Object.keys(process.env).find(key => /^(?:INPUT_)?GIT_USERNAME$/.test(key));
  if (!username) {
    console.log(`Git username required.`);
    process.exit(1);
  } else {
    return process.env[username]!;
  }
})();

export const dockerBuildArgs = () => Object
  .keys(process.env)
  .reduce((acc, curr) => {
    const [, arg ] = /^(?:INPUT_)?DOCKER_BUILD_ARG_(.+)$/.exec(curr) ?? [];

    if (arg) {
      return {
        ...acc,
        [arg]: process.env[curr],
      };
    } else {
      return acc;
    }
  }, {});

export const dockerLabels = () => Object
  .keys(process.env)
  .reduce((acc, curr) => {
    const [, arg ] = /^(?:INPUT_)?DOCKER_LABEL_(.+)$/.exec(curr) ?? [];

    if (arg) {
      return {
        ...acc,
        [arg]: process.env[curr],
      };
    } else {
      return acc;
    }
  }, {});

export const dockerRegistry = (() => {
  const registry = Object.keys(process.env).find(key => /^(?:INPUT_)?DOCKER_REGISTRY$/.test(key));
  if (!registry) {
    console.log(`Docker registry url required.`);
    process.exit(1);
  } else {
    return process.env[registry]!;
  }
})();

export const dockerImagePrefix = (() => {
  const imagePrefix = Object.keys(process.env).find(key => /^(?:INPUT_)?DOCKER_IMAGE_PREFIX$/.test(key));
  if (imagePrefix) {
    return process.env[imagePrefix]!;
  }
})();

export const dockerRegistryUsername = (() => {
  const registryUsername = Object.keys(process.env).find(key => /^(?:INPUT_)?DOCKER_REGISTRY_USERNAME$/.test(key));
  if (registryUsername) {
    return process.env[registryUsername]!;
  }
})();

export const dockerRegistryPassword = (() => {
  const registryPassword = Object.keys(process.env).find(key => /^(?:INPUT_)?DOCKER_REGISTRY_PASSWORD$/.test(key));
  if (registryPassword) {
    return process.env[registryPassword]!;
  }
})();

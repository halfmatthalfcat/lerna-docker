export const versionPrefix = (() => {
  const prefix = Object.keys(process.env).find(key => /^(?:INPUT_)?VERSION_PREFIX$/.test(key));
  if (!prefix) {
    console.log(`Version prefix required.`);
    process.exit(1);
  } else {
    return prefix;
  }
})();

export const versionPrerelease = Object
  .keys(process.env)
  .find(key => /^(?:INPUT_)?VERSION_PRERELEASE$/.test(key));

export const gitEmail = (() => {
  const email = Object.keys(process.env).find(key => /^(?:INPUT_)?GIT_EMAIL$/.test(key));
  if (!email) {
    console.log(`Git email required.`);
    process.exit(1);
  } else {
    return email;
  }
})();

export const gitUsername = (() => {
  const username = Object.keys(process.env).find(key => /^(?:INPUT_)?GIT_USERNAME$/.test(key));
  if (!username) {
    console.log(`Git username required.`);
    process.exit(1);
  } else {
    return username;
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
    return registry;
  }
})();

export const dockerImagePrefix = Object
  .keys(process.env)
  .find(key => /^(?:INPUT_)?DOCKER_IMAGE_PREFIX$/.test(key));

export const dockerRegistryUsername = Object
  .keys(process.env)
  .find(key => /^(?:INPUT_)?DOCKER_REGISTRY_USERNAME$/.test(key));

export const dockerRegistryPassword = Object
  .keys(process.env)
  .find(key => /^(?:INPUT_)?DOCKER_REGISTRY_PASSWORD$/.test(key));

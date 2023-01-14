# lerna-docker
Streamline building Docker containers from lerna monorepo projects.

### When To Use lerna-docker

lerna-docker solves a bit of a niche problem, albeit a frustrating one. If you:
* Are using `lerna`.
* Have multiple deployable projects that depend on common packages.
* Need those deployable projects built into Docker containers.
* Want to only build those deployable projects when there are changes to it or it's dependencies.

...this is the library for you

### Usage

There are multiple ways to use `lerna-docker` but you'll most likely use it within CI in some fashion.

#### As An NPM Package

```
yarn add @halfmatthalfcat/lerna-docker
```
_or_
```
npm i @halfmatthalfcat/lerna-docker
```

After installing into your project, you can either add a script into your `package.json` and call
`lerna-docker` from there or you can call `./node_modules/@halfmatthalfcat/lerna-docker/index.js` directly.

#### As A Github Action

`lerna-docker` comes out-of-the-box as a Github Action _*however*_, you still must install it into your project as
a dev dependency. This is mostly to avoid committing node_modules into this repo. To use it in a Github Workflow, can do
the following:

```yaml
jobs:
  build:
    steps:
      # all your usual build steps
      - name: Dockerize
        uses: ./node_modules/@halfmatthalfcat/lerna-docker
        with:
          # any/all the configuration options
```

#### Configuration

| Variable                 | Required | Description                                                         |
|--------------------------|----------|---------------------------------------------------------------------|
| VERSION_PREFIX           | **X**    | The SemVer prerelease prefix (rc, dev, pr)                          |
| VERSION_PRERELEASE       |          | The SemVer prerelease to "force"                                    |
| GIT_EMAIL                | **X**    | The git email to use when tagging                                   |
| GIT_USERNAME             | **X**    | The git username to use when tagging                                |
| DOCKER_REGISTRY          | **X**    | The docker registry to publish to                                   |
| DOCKER_REGISTRY_USERNAME |          | An optional username to use when auth-ing against a docker registry |
| DOCKER_REGISTRY_PASSWORD |          | An optional password to use when auth-ing against a docker registry |
| DOCKER_IMAGE_PREFIX      |          | An optional docker image prefix to use in the final image path      |
| DOCKER_BUILD_ARG_*       |          | Optional build args to use when building                            |
| DOCKER_LABEL_*           |          | Optional image labels to attach when building                       |

### How lerna-docker Works

There are certain requirements/concessions necessary in order for lerna-docker to work.
1. You are already using [`lerna`](https://lerna.js.org/).
   1. You technically don't have to be _using_ lerna, however a properly configured `lerna.json` file at the root of your project is necessary.
2. You have a top-level `/docker` directory that contains Dockerfiles for the projects which require containerizing.
   1. The Dockerfiles should directly map to the package name. Packages that do not have an associated Dockerfile will not be built.
3. You are comfortable with a time-based SemVer tag pattern (`year`.`month`.`date`).

#### High Level Flow

1. Changes are made to the repository to any or all dependencies.
2. Those changes are pushed to the origin.
3. `lerna changed` is ran to determine which packages changed from the previous tag.
4. If any packages that have changed have an associated Dockerfile under `/docker`, that Dockerfile is built against the root of the project.
5. A new SemVer tag is created based on the current date and current build against the trunk.
6. The container(s) are pushed to their respective registries.
7. The created tag is push to the origin.
   1. This is a **manual step** done by the pipeline after successful pushes

#### Example

Consider the following directory structure:

```
project_root/
├─ docker/
│  ├─ user_service.Dockerfile/
│  ├─ auth_service.Dockerfile/
├─ packages/
│  ├─ common/
│  ├─ models/
│  │  ├─ dependencies: common
│  ├─ user_service/
│  │  ├─ dependencies: common, models
│  ├─ auth_service/
│  │  ├─ dependencies: common, models
├─ .dockerignore
├─ lerna.json

```

We have four packages (common, models, user_service and auth_service) that all have various dependencies on each other.
We want to deploy user_service and auth_service both independently and if/when their dependencies on other packages change.

##### Changes to auth_service

Direct changes to `auth_service` will trigger a build of `auth_service` alone during CI. A new container of `auth_service`
will be created with the latest tag and pushed to the registry.

##### Changes to models

Both `auth_service` and `user_service` have dependencies on `models` and thus, will be built, tagged with the latest version
and pushed to the registry.

##### Changes to common

Since everything is dependent on `common`, everything has "changed". However, `models` does not have an associated Dockerfile
under `/docker`, so no container will be built for `models` however, containers will be built, tagged and pushed for
`user_service` and `auth_service`.

### Versioning

`lerna-docker` takes an opinionated approach to versioning. The primary reasoning behind this is
traditional `major.minor.patch` versioning is difficult in a monorepo. How do we decide what to bump when?
Projects like `Conventional Commits` try to accomplish this through commit messages however `lerna-docker` strives to streamline this process.

Because of this, it's probably less appropriate to use `lerna-docker` for packaging libraries that need to abide by
`major.minor.patch` to telegraph actual changes to the project.

The versioning for `lerna-docker` operates as so:

```
{year}.         - the current year
{month}.        - the current month
{day}.          - the current day
-{prefix}.      - a user-defined prerelease prefix (rc, dev, pr)
{prerelease}    - a prerelease version (automatic or manual)
```

Imagine it's the first day of the year and we've designated builds against `main` to hold the prefix `rc`, for
release candidate. The resulting first version of the first commit on main would be `2023.1.1-rc.0`.

Any subsequent builds for that day would increment the `rc` version monotonically. The value would reset to `0`
on the following day.

Now let's imagine we want to build containers for each commit of a pull request. For this we'll designate the
prefix to be `pr`. We can manually define the prerelease version (as an environment variable) instead of letting
`lerna-docker` manually increment one. For example, we could use the Pull Request number and Workflow run as our
prerelease, resulting in a tag such as `2023.1.1-pr.22.53`. The `prerelease` value should be a valid SemVer prerelease value.
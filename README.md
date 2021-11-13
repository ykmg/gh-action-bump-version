## gh-action-bump-version

GitHub Action for automated npm version bump.

This action based on 'phips28/gh-action-bump-version' with small changes.

This Action bumps the version in package.json and push it back to the repo. 
It is meant to be used on every successful merge to master but 
you'll need to configured that workflow yourself. You can look to the
[`.github/workflows/push.yml`](./.github/workflows/push.yml) file in this project as an example.

**Attention**

Make sure you use the `actions/checkout@v2` action!

### Workflow

* Based on the input VERSION_COMMAND, increment the version from the latest release.
  * If the string "major" is found in VERSION_COMMAND the major 
    version will be incremented.
  * If includes "minor" then the minor version will be increased.
  * If includes "patch" then the patch version will be increased.
* Push the bumped npm version in package.json back into the repo.
* Push a tag for the new version back into the repo.

### Usage:
**tag-prefix:** Prefix that is used for the git tag  (optional). Example:
```yaml
- name:  'Automated Version Bump'
  uses:  ''
  with:
    tag-prefix:  ''
```
**PACKAGEJSON_DIR:** Param to parse the location of the desired package.json (optional). Example:
```yaml
- name:  'Automated Version Bump'
  uses:  ''
  env:
    PACKAGEJSON_DIR:  'frontend'
```
**VERSION_COMMAND:** Param to trigger the version bump. (can be none, minor, patch or major)  Example:
```yaml
- name:  'Automated Version Bump'
  uses:  ''
  env:
    VERSION_COMMAND:  'major'
```



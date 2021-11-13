const { Toolkit } = require('actions-toolkit')
const { execSync } = require('child_process')

// Change working directory if user defined PACKAGEJSON_DIR
if (process.env.PACKAGEJSON_DIR) {
  process.env.GITHUB_WORKSPACE = `${process.env.GITHUB_WORKSPACE}/${process.env.PACKAGEJSON_DIR}`
  process.chdir(process.env.GITHUB_WORKSPACE)
}

// Run your GitHub Action!
Toolkit.run(async tools => {
  const pkg = tools.getPackageJSON()
  const event = tools.context.payload

  const commitMessage = 'version bump to'
  if (!process.env.VERSION_COMMAND || process.env.VERSION_COMMAND === '' || process.env.VERSION_COMMAND === 'none') {
    tools.exit.success('No action necessary!')
    return
  }

  let version = process.env.VERSION_COMMAND
  
  if (process.env.VERSION_COMMAND.includes('patch')) {
    version = 'patch'
  } else if (process.env.VERSION_COMMAND.includes('major')) {
    version = 'major'
  } else if (process.env.VERSION_COMMAND.includes('minor')) {
    version = 'minor'
  } else {
    tools.exit.success('Commits with changes version not found')
    exit
  }

  try {
    const current = pkg.version.toString()
    // set git user
    await tools.exec('git', ['config', 'user.name', `"${process.env.GITHUB_USER || 'Automated Version Bump'}"`])
    await tools.exec('git', ['config', 'user.email', `"${process.env.GITHUB_EMAIL || 'gh-action-bump-version@users.noreply.github.com'}"`])

    const currentBranch = /refs\/[a-zA-Z]+\/(.*)/.exec(process.env.GITHUB_REF)[1]
    console.log('currentBranch:', currentBranch)

    // do it in the current checked out github branch (DETACHED HEAD)
    // important for further usage of the package.json version
    await tools.exec('npm',
      ['version', '--allow-same-version=true', '--git-tag-version=false', current])
    console.log('current:', current, '/', 'version:', version)
    let newVersion = execSync(`npm version --git-tag-version=false ${version}`).toString().trim()
    await tools.exec('git', ['commit', '-a', '-m', `ci: ${commitMessage} ${newVersion}`])

    // now go to the actual branch to perform the same versioning
    await tools.exec('git', ['checkout', currentBranch])
    await tools.exec('npm',
      ['version', '--allow-same-version=true', '--git-tag-version=false', current])
    console.log('current:', current, '/', 'version:', version)
    newVersion = execSync(`npm version --git-tag-version=false ${version}`).toString().trim()
    newVersion = `${process.env['INPUT_TAG-PREFIX'] ? process.env['INPUT_TAG-PREFIX'] :""}${newVersion}`
    console.log('new version:', newVersion)
    try {
      // to support "actions/checkout@v1"
      await tools.exec('git', ['commit', '-a', '-m', `ci: ${commitMessage} ${newVersion}`])
    } catch (e) {
      console.warn('git commit failed because you are using "actions/checkout@v2"; ' +
        'but that doesnt matter because you dont need that git commit, thats only for "actions/checkout@v1"')
    }

    const remoteRepo = `https://${process.env.GITHUB_ACTOR}:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`
    // console.log(Buffer.from(remoteRepo).toString('base64'))
    await tools.exec('git', ['tag', newVersion.replace("undefined","")])
    await tools.exec('git', ['push', remoteRepo, '--follow-tags'])
    await tools.exec('git', ['push', remoteRepo, '--tags'])
  } catch (e) {
    tools.log.fatal(e)
    tools.exit.failure('Failed to bump version')
  }
  tools.exit.success('Version bumped!')
})

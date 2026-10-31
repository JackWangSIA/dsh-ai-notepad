# Market submission

`awesome-entry.yml` is the ready-to-copy entry for
[awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin).
The dsh-market catalog is built from that repository.

To submit:

1. Make sure the GitHub repository is public, has the `dsh-plugin` topic, and is
   at least one day old.
2. Fork `awesome-dsh-plugin/awesome-dsh-plugin`.
3. Copy this file to `data/plugins/JackWangSIA__dsh-ai-notepad.yml`.
4. Open a pull request that adds only that one file.

The `dsh-market` repository itself is the market application, not the catalog;
do not open a plugin-entry PR there.

After the PR is merged, dsh-market picks the entry up from the catalog. The
`bradeGithub/DSH-Plugins-Marketplace` project also indexes public repositories
with the `dsh-plugin` topic automatically, usually within two hours.

If the npm package is not published yet, add a GitHub Release tarball and point
the entry at it:

```yaml
tarball: https://github.com/JackWangSIA/dsh-ai-notepad/releases/latest/download/dsh-ai-notepad.tgz
```

The `latest/download` asset name should stay version-free, or use a pinned tag
URL with a versioned filename.

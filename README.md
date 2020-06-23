maxghenis.github.io
===================

Powers https://maxghenis.com, using https://jupyterbook.org

To deploy after updating the source files, run `. build.sh`.
This rebuilds the jupyterbook, copies `CNAME` to `jupyterbook/_build/html`,
and uses `ghp-import` to push `jupyterbook/_build/html` files to the `master` branch.
(*The default branch here is `src`, not `master`.*)

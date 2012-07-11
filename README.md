Torch Web Terminal
==================

Dependencies: node.js + node packages: express, stripcolorcodes

On Mac OS X, these can be installed like this (using Homebrew):

```bash
$ brew install nodejs
$ npm install express ejs stripcolorcodes
```

Then simply deploy this project:

```bash
$ torch-pkg -local deploy
```

Note1: you have to deploy webterm locally, as the node packages are
only available to the current user.

Note2: depending on the version of Node.js, you might have to do
the NPM thing in the package directory, i.e.:

```bash
$ cd ~/.torch/usr/share/torch/lua/webterm/
$ npm install express ejs stripcolorcodes
```

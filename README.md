Torch Web Terminal
==================

Dependencies: node.js + node packages: express, stripcolorcodes

On Mac OS X, these can be installed like this (using Homebrew):

```bash
$ brew install nodejs
$ npm install express
$ npm install stripcolorcodes
```

Then simply deploy this project:

```bash
$ torch-pkg -local deploy
```

(note that you have to deploy it locally, as the node packages are
only available to the current user)

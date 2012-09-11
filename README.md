Torch Web Terminal
==================

This is a browser-based terminal for [Torch7](http://www.torch.ch). 
The goal of this project is to supersed the Qt4 interface, and to 
enable full graphics capabilities within the browser.

This project is built around [Node.js](http://nodejs.org/), 
a super lightweight asynchronous framework to build servers. In
our case, the server is only use to connect clients (browser 
terminals) to Torch7 kernels. For now, one server instance can
support an arbitrary number of clients, but each client only
has access to one Torch7 kernel.

Dependencies
------------

You will need to install a couple of dependencies to enable
this web terminal:
  
  * Node.js, which can be found [here](http://nodejs.org/), and
  should also be installable with your system's package manager

  * NPM: Node's package manager (sometimes comes with Node.js)

  * Three Node.js packages: `ejs`, `stripcolorcodes` and `express`
    (version 2.x)

For instance, on MacOS:

```bash
$ brew install nodejs
$ curl http://npmjs.org/install.sh | sh
$ npm install express@2.x ejs stripcolorcodes
```

Installation
------------

This project is bundled as a `torch-pkg` project, and can be 
easily installed like this:

```bash
$ torch-pkg -local install webterm
```

Or, if you have downloaded this repository on your machine, and
you are in its directory:

```bash
$ torch-pkg -local deploy
```

Note1: you have to deploy webterm locally (-local flag), as the node 
packages are only available to the current user. This could probably
be fixed, but I still don't know how.

Note2: depending on the version of Node.js, you might have to do
the NPM install in the package directory, i.e.:

```bash
$ cd ~/.torch/usr/share/torch/lua/webterm/
$ npm install express@2.x ejs stripcolorcodes
```

Running it
----------

`webterm` is a standard package, so you can either require it from
a running torch instance, or start torch with it like that:

```bash
$ torch -lwebterm
```

This should produce the following output:

```text
Try the IDE: torch -ide
Type help() for more info
Torch 7.0  Copyright (C) 2001-2011 Idiap, NEC Labs, NYU
==> Torch server listening on port 8080
==> Open http://localhost:8080/ in your browser!
=><= Torch instance started for [t7]
```

At this stage, you just have to open a browser and go to 
[http://localhost:8080/](http://localhost:8080/). The cool thing
of course is that you can access this adress remotely. Beware though
that this might open up serious security issues.

Functions
---------

In the broswer, you will see a terminal, which provides full history
and live completion. Completed entries are shown on the left pane, and
are actual hyperlinks to documentation:

![](https://github.com/clementfarabet/thwebterm/raw/master/img/term1.png)

One cool thing about a browser-based terminal is that all the plots
and renderings you can generate during your session can be transparently
piped to the console:

![](https://github.com/clementfarabet/thwebterm/raw/master/img/term2.png)

The mechanism we use to do this is very simple: the image, or plot, is dumped
as a png into the root of the Node.js server; and we then simply print a string
of that form: `<img src="dumped.png"/>` to the terminal.

In fact, this mechanism is completely general: try doing this in the terminal:

```lua
print '<h1>Some title</h1> <p>a paragraph...</a>'
```

Now even more powerful: you can really print arbitrary html there, so printing 
something like:

```lua
print '<script> console.log("this is javascript!") </script>'
```

... will just work perfectly fine!

Multiple Users
--------------

By default, the user is set to `t7`, which is what you should see in the terminal.
You can create a new user by appending the string `?user=bob` to the URL. That'll
create a __completely__ new Torch7 kernel, which only Bob sees.

TO DO
-----

  * completion is still buggy: it starts screwing up after too many nested parenthesis
  * inline help (triggered by the `?` symbol) is shitty: we should use the full html
  help instead of the poor text-based help
  * I'd love to have notebook-like capabilities, where we can load a markdown file into
  the browser (using the URL would be ok for now, _e.g._ `?file=myscript.md`), and 
  the text part would get rendered as html, and all the code blocks will be transformed
  in interpretable code blocks, _ala_ Mathematica/IPython.
  * that last point implies that we need more flexible code entries, where we can go
  back and forth to edit the code.
  * ctrl+C: not working yet. It generates a INT signal, but it doesn't seem to
  do much for now.

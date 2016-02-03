# Game development with JS and Phaser

Talk on HTML 5 game development using [Phaser](http://phaser.io).

- View the [slides online](https://belen-albeza.github.io/talk-js-gamedev)
- View the [snippets and demo game](https://belen-albeza.github.io/talk-js-gamedev/examples/)

Images for the examples are made by [Kenney](http://kenney.nl/) and have been released under a [CC0 license](https://creativecommons.org/publicdomain/zero/1.0/).

Slide deck generated with [generator-simple-bespoke](https://github.com/belen-albeza/generator-simple-bespoke).

## Run the examples locally

You need to **run a local server** that can serve the `src/examples` directory statically.

With Python:

```
cd src/examples
python -m SimpleHTTPServer
```

With Node's `http-server`:

```
npm install -g http-server
http-server src/examples
```

## View the slideshow locally

### Requirements

- Gulp client `npm install -g gulp`

### Usage

Download or clone the repository, then install dependencies:

```
npm install
```

To build the project in a `dist` folder:

```
gulp dist
```

To start development mode, with automatic asset rebuilding and browser reloading:

```
gulp dev
```

To deploy to Github pages:

```
gulp deploy
```

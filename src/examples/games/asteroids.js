//
// Preloader & boot scenes
//

var BootScene = {
  preload: function () {
    // load here assets required for the loading screen
    this.game.load.image('preloader_bar', '../assets/images/preloader_bar.png');
  },

  create: function () {
    this.game.state.start('preloader');
  }
};

var PreloaderScene = {
  preload: function () {
    this.loadingBar = this.game.add.sprite(0, 240, 'preloader_bar');
    this.loadingBar.anchor.setTo(0, 0.5);
    this.load.setPreloadSprite(this.loadingBar);

    // load assets for the game

    // images
    [
      'background',
      'ship',
      'bullet',
      'asteroid_big', 'asteroid_medium', 'asteroid_small'
    ].forEach(function (x) {
      this.game.load.image(x, '../assets/images/' + x + '.png');
    }.bind(this));

    this.game.load.audio('shoot', '../assets/audio/shoot.wav');
    this.game.load.audio('explosion', '../assets/audio/explosion.wav');
  },

  create: function () {
    this.game.state.start('play');
  }
};

//
// Main scene
//

ASTEROID_AMOUNT = 2;
FRAGMENT_AMOUNT = 3;

var PlayScene = {
  create: function () {
    // sound effects
    this.sfx = {
        shoot: this.game.add.audio('shoot'),
        explosion: this.game.add.audio('explosion')
    };

    // background
    this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');

    this.ship = new Ship(this.game, 320, 240);
    this.game.add.existing(this.ship);

    this.bullets = this.game.add.group();
    this.asteroids = this.game.add.group();

    this.spawnAsteroids(ASTEROID_AMOUNT);

    // setup keys
    this.keys = this.game.input.keyboard.createCursorKeys();
    this.keys.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.keys.spacebar.onDown.add(function () {
      this.ship.shoot(this.bullets);
      this.sfx.shoot.play();
    }.bind(this));
  },

  update: function () {
    // player input
    this._handleInput();

    // collision bullets vs asteroids
    this.game.physics.arcade.overlap(this.bullets, this.asteroids,
    function (bullet, asteroid) {
      // fragment asteroid
      this.spawnAsteroidFragments(FRAGMENT_AMOUNT, asteroid);
      // kill both the bullet and the asteroid sprites
      bullet.kill();
      asteroid.kill();
      // play sound
      this.sfx.explosion.play();
    }.bind(this));
  },

  spawnAsteroids: function (amount) {
    for (var i = 0; i < amount; i++) {
      this.asteroids.add(new Asteroid(
        this.game,
        this.game.rnd.between(0, this.game.width),
        this.game.rnd.between(0, this.game.height),
        Asteroid.SIZE.BIG));
    }
  },

  spawnAsteroidFragments: function (amount, asteroid) {
    var size = Asteroid.getSmallerSize(asteroid.size);
    if (!size) { return };

    for (var i = 0; i < amount; i++) {
      this.asteroids.add(new Asteroid(this.game, asteroid.x, asteroid.y, size));
    }
  },

  _handleInput: function () {
    // turn ship
    if (this.keys.left.isDown) {
      this.ship.turn(-1);
    }
    else if (this.keys.right.isDown) {
      this.ship.turn(1);
    }
    else {
      this.ship.turn(0);
    }

    // move and stop ship
    this.ship.move(this.keys.up.isDown ? 1 : 0);
  }
};

//
// Sprites
//

// Ship

function Ship(game, x, y) {
  // call Phaser constructor
  Phaser.Sprite.call(this, game, x, y, 'ship');

  this.anchor.setTo(0.5, 0.5);

  // setup physics
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.maxVelocity.setTo(Ship.MAX_SPEED, Ship.MAX_SPEED);
  this.body.drag.setTo(Ship.DRAG, Ship.DRAG);
}

Ship.ROTATION_SPEED = 180; // degrees / second
Ship.ACCELERATION = 200; // pixels / second^2
Ship.MAX_SPEED = 300; // pixels / second (per axis)
Ship.DRAG = 50; // pixels / second

Ship.prototype = Object.create(Phaser.Sprite.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.turn = function (direction) {
  this.body.angularVelocity = direction * Ship.ROTATION_SPEED;
};

Ship.prototype.move = function (direction) {
  this.body.acceleration.setTo(
    Math.cos(this.rotation - Math.PI / 2) * Ship.ACCELERATION * direction, // x
    Math.sin(this.rotation - Math.PI / 2) * Ship.ACCELERATION * direction  // y
  );
};

Ship.prototype.shoot = function (group) {
  Bullet.spawn(group, this.x, this.y, this.rotation);
};

Ship.prototype.update = function () {
  wrapSprite(this);
};


// Bullet

function Bullet(game, x, y, rotation) {
  // call Phaser constructor
  Phaser.Sprite.call(this, game, x, y, 'bullet');

  this.anchor.setTo(0.5, 0.5);

  // enable physics
  game.physics.enable(this, Phaser.Physics.ARCADE);

  // We split part of the initialization so we can have it when
  // we recycle the sprite
  this.init(x, y, rotation);
}

Bullet.SPEED = 350;
Bullet.LIFETIME = 1200;

Bullet.spawn = function (group, x, y, rotation) {
  var bullet = group.getFirstExists(false);
  // re-use existing slot if available
  if (bullet) {
    bullet.reset(x, y);
    bullet.init(x, y, rotation);
  }
  // if there is no slot available, create a new sprite
  else {
    bullet = group.add(new Bullet(group.game, x, y, rotation));
  }
}

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.init = function (x, y, rotation) {
    var offset = 30;
    this.x = x + Math.cos(rotation - Math.PI / 2) * offset;
    this.y = y + Math.sin(rotation - Math.PI / 2) * offset,

    this.body.velocity.setTo(
      Math.cos(rotation - Math.PI / 2) * Bullet.SPEED,
      Math.sin(rotation - Math.PI / 2) * Bullet.SPEED
    );

    // auto-destroy the bullet after Bullet.LIFETIME time
    var timer = this.game.time.create(true); // autodestroy
    timer.add(Bullet.LIFETIME, this.kill, this);
    timer.start();
};

Bullet.prototype.update = function () {
  wrapSprite(this);
};

// Asteroid

function Asteroid(game, x, y, size) {
  // call Phaser constructor
  Phaser.Sprite.call(this, game, x, y, 'asteroid_' + size);

  this.anchor.setTo(0.5, 0.5);
  this.size = size;

  // setup physics
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.angularVelocity = game.rnd.between(Asteroid.MIN_ROTATION_SPEED,
    Asteroid.MAX_ROTATION_SPEED);
  var angle = game.rnd.realInRange(0, 2 * Math.PI);
  this.body.velocity.setTo(
    Math.cos(angle) * Asteroid.SPEED,
    Math.sin(angle) * Asteroid.SPEED
  );
}

Asteroid.getSmallerSize = function (size) {
  switch (size) {
    case Asteroid.SIZE.BIG:
      return Asteroid.SIZE.MEDIUM;
    case Asteroid.SIZE.MEDIUM:
      return Asteroid.SIZE.SMALL;
    default:
      return null;
  }
}

Asteroid.MIN_ROTATION_SPEED = 10;
Asteroid.MAX_ROTATION_SPEED = 100;
Asteroid.SPEED = 100;
Asteroid.SIZE = {
  SMALL: 'small',
  MEDIUM: 'medium',
  BIG: 'big'
};

Asteroid.prototype = Object.create(Phaser.Sprite.prototype);
Asteroid.prototype.constructor = Asteroid;

Asteroid.prototype.update = function () {
  wrapSprite(this);
};


//
// Utils
//

function wrapSprite(sprite) {
  // wrap in world bounds
  if (sprite.x > sprite.game.width)  { sprite.x = 0; }
  if (sprite.y > sprite.game.height) { sprite.y = 0; }
  if (sprite.x < 0) { sprite.x = sprite.game.width; }
  if (sprite.y < 0) { sprite.y = sprite.game.height; }
}

window.onload = function () {
  var game = new Phaser.Game(640, 480, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('play', PlayScene);

  game.state.start('boot');
};

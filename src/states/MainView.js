import { WidthSpriteSheetHero, HeightSpriteSheetHero, Size, CursorSize, Width, Height, HudText, HudTextX, HudTextY, HelpButtonRatio } from '../Constants.js';
import { Tileset, Level1, Levels, HeroSprite } from '../ConstantsKey.js';
import Character from 'objects/Character';
import InformationString from 'objects/InformationString';

import MapManager from "objects/MapManager";
import Controls from "objects/Controls";

class MainView extends Phaser.State {

  constructor() {
    super();
  }

  init(indexLevel) {
    this.indexLevel = indexLevel || 1;
    this.hasLevel = Object.keys(Levels).length >= this.indexLevel;
    if(!this.game.controls) {
      let controls = new Controls();
      controls.PostMortemDefaultConfig();
      this.game.controls = controls;
    }
    //no more levels :|
  }

  create() {
    if(!this.hasLevel) {
      this.game.goToMenu();
    } else {

      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      // Add the physics engine to all game objects
      this.game.world.enableBody = true;

      this.map = this.game.add.tilemap(Levels[`Level${this.indexLevel}`].key);
      this.map.addTilesetImage(Levels[`Level${this.indexLevel}`].key, Tileset.key);

      this.map.createLayer('thirdLayer');
      this.map.createLayer('secondLayer');
      this.map.createLayer('firstLayer');
      // This resizes the game world to match the layer dimensions
      this.collisionLayer = this.map.createLayer('colissionLayer');
      this.map.setCollisionByExclusion([], true, this.collisionLayer);

      this.collisionLayer.resizeWorld();
      const heroX = this.game.paramsLevel.playerPosition.x;
      const heroY = this.game.paramsLevel.playerPosition.y;
      this.hero = new Character(this.game, heroX, heroY, HeroSprite.key, 0);
      this.game.add.existing(this.hero);
      this.game.camera.follow(this.hero);

      this.marker = null;
      this.createTileSelector();
      this.game.input.addMoveCallback(this.updateMarker, this);

      this.mapManager = new MapManager(this.map, this.game.paramsLevel.lastLayer);
      this.mapManager.setUpCollisionLayer(this.collisionLayer);

      this.text = new InformationString(this.game, Width/2, this.game.paramsLevel.text );
      this.game.add.existing(this.text);
      this.text.blink();

      let group = this.game.add.group();
      const button = this.game.make.button(950, 40, 'go_to_command_button', this.game.goToCommands, this.game, 2, 1, 0);
      button.scale.setTo(HelpButtonRatio, HelpButtonRatio)
      this.textInfo = this.game.add.text(965, 50, "?", { font: "bold 22px Arial", fill: "#FFFFFF", stroke: '#4D4D4D',strokeThickness: 1 });
      group.add(button);


      this.hud = this.game.add.text(400, 400, HudText, { font: "bold 22px Arial", fill: '#FFFFFF' });
      this.hud.x = this.game.camera.x + HudTextX;
      this.hud.y = this.game.camera.y + HudTextY;

      this.keyRemoveLayer = this.game.input.keyboard.addKey(this.game.controls.getKey("undoLayer"));
      this.keyRemoveLayer.onDown.add(this.eraseBlockKeyboard, this);
      this.keyUndoLayer = this.game.input.keyboard.addKey(this.game.controls.getKey("removeLayer"));
      this.keyUndoLayer.onDown.add(this.undoBlockKeyboard, this);

      this.keyUpLayer = this.game.input.keyboard.addKey(this.game.controls.getKey("moveUpCursor"));
      this.keyUpLayer.onDown.add(this.moveUp, this);
      this.keyDownLayer = this.game.input.keyboard.addKey(this.game.controls.getKey("moveDownCursor"));
      this.keyDownLayer.onDown.add(this.moveDown, this);
      this.keyLeftLayer = this.game.input.keyboard.addKey(this.game.controls.getKey("moveLeftCursor"));
      this.keyLeftLayer.onDown.add(this.moveLeft, this);
      this.keyRightLayer = this.game.input.keyboard.addKey(this.game.controls.getKey("moveRightCursor"));
      this.keyRightLayer.onDown.add(this.moveRight, this);
    }
  }


  update() {
    this.game.physics.arcade.collide(this.hero, this.collisionLayer, this.additionalCheck, this.hasPortal , this);
    if(this.hero.y > Height + this.hero.height) {
      this.game.reset();
    }

    this.updateGui();
  }

  updateGui() {
    this.hud.setText(HudText + this.mapManager.currentGems + " / " + this.mapManager.nbGems);
    this.hud.x = this.game.camera.x + HudTextX;
    this.hud.y = this.game.camera.y + HudTextY;

  }

  hasPortal(tile1, tile2) {
    if(tile2.properties && tile2.properties.portal == 1 && !this.mapManager.portalEnable()) {
      return false;
    }
    return true;
  }

  additionalCheck(tile1, tile2) {
    if(!tile2.properties) {
      return;
    }

    if(tile2.properties.is_gem == 1) {
      this.map.removeTile(tile2.x, tile2.y, "colissionLayer").destroy();
      this.mapManager.killGem();
      return;
    }

    if(tile2.properties.portal == 1 && this.mapManager.portalEnable()) {
      //maybe make an animation
      this.game.reset();
    }
  }

  eraseBlockKeyboard() {
    this.mapManager.eraseBlock(this.marker.x / Size, this.marker.y / Size);
    this.hero.eraseBlocksAnimation(this.marker);
  }

  undoBlockKeyboard() {
    this.mapManager.undoBlock(this.marker.x / Size, this.marker.y / Size);
    this.hero.eraseBlocksAnimation(this.marker);
  }

  updateMarker() {
    this.marker.x = this.game.math.snapToFloor(this.game.input.activePointer.worldX, CursorSize, 0);
    this.marker.y = this.game.math.snapToFloor(this.game.input.activePointer.worldY, CursorSize, 0);

    if (this.game.input.mousePointer.isDown && this.marker.y > Size) {
      this.mapManager.eraseBlock(this.marker.x / Size, this.marker.y / Size);
      this.hero.eraseBlocksAnimation(this.marker);
    }
  }

  createTileSelector() {
    //Our painting marker
    this.marker = this.game.add.graphics();
    this.marker.lineStyle(2, 0xea4335, 1);
    this.marker.drawRect(0, 0, CursorSize, CursorSize);
    this.marker.x = 4 * CursorSize;
    this.marker.y = 4 * CursorSize;
  }

  moveUp() {
    this.marker.y -= CursorSize;
    if(this.marker.y < 0) {
      this.marker.y = 0;
    }
  }

  moveDown() {
    this.marker.y += CursorSize;
    if(this.marker.y > Height - CursorSize) {
      this.marker.y = Height - CursorSize;
    }
  }

  moveLeft() {
    this.marker.x -= CursorSize;
    if(this.marker.x < 0) {
      this.marker.x = 0;
    }
  }

  moveRight() {
    this.marker.x += CursorSize;
    if(this.marker.x > Width - CursorSize) {
      this.marker.x = Width - CursorSize;
    }
  }

  preload() {
    this.game.load.spritesheet(HeroSprite.key, `res/${HeroSprite.path}`, WidthSpriteSheetHero, HeightSpriteSheetHero);
    this.game.load.image(Tileset.key, `res/${Tileset.path}`);
    this.game.load.spritesheet('go_to_command_button', "res/help_button.png", 64, 64);
    if(this.hasLevel) {
      this.game.load.tilemap(Levels[`Level${this.indexLevel}`].key, `res/${Levels[`Level${this.indexLevel}`].path}` , null, Phaser.Tilemap.TILED_JSON);
    }
  }

}

export default MainView;
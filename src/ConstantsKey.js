export const Tileset = {
  path: "tileset.png",
  key: "tileset"
  };

/*
path : link to the file
key: Always put "TEST",
lastLayer: number of layers available in the level. 3 for only one layer, 1, for three layers,
text: Text to explain the level
playerPostion: original position of the player with the format {x: valueX, y: valueY}
*/
export const Level1 = {
  path: "LVL_9.json",
  key: "Test",
  lastLayer: 1,
  text: "",
  playerPosition: {x: 500, y: 80}
};

export const Levels = {
  Level1
};

export const HeroSprite = {
  key: "hero",
  path: "hero.png"
}
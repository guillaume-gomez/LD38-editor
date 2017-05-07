import MainView from 'states/MainView';
import Commands from 'states/Commands';
import { Width, Height } from  "./Constants.js"

class Game extends Phaser.Game {

  constructor() {
    super(Width, Height, Phaser.AUTO, 'content', null);
    this.currentLevel = 1;
    this.state.add('MainView', MainView, false);
    this.state.add('Commands', Commands, false);
    this.state.start('MainView');
  }

  goToMainGame() {
     this.state.start('MainView');
  }

  goToCommands() {
    this.state.start('Commands');
  }

  goToMenu() {
    this.state.start('Commands');
    this.currentLevel = 1;
  }

  reset() {
    this.state.start('MainView', Phaser.Plugin.StateTransition.In.ScaleUp, Phaser.Plugin.StateTransition.Out.SlideBottom, true, true, this.currentLevel);
  }
}

new Game();

import { AUTO, Game } from "phaser";
import Preloader from "./scenes/Preloader";
import GameScene from "./scenes/Game";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 512 - 94,
    height: window.innerHeight - 10,
    parent: "game-container",
    // backgroundColor: "#028af8",
    physics: {
        default: "matter",
        matter: {
            gravity: { x: 0, y: 0.3 },
            // setBounds: true
            // debug: true,
        },
    },
    scene: [Preloader, GameScene],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;


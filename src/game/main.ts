import { AUTO, Game } from "phaser";
import Preloader from "./scenes/Preloader";
import GameScene from "./scenes/Game";
import { IGameDataParams } from "./PhaserGame";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    parent: "game-container",
    // backgroundColor: "#028af8",
    physics: {
        default: "matter",
        matter: {
            gravity: { x: 0, y: 0.2 },
            // setBounds: true
            // debug: true,
        },
    },
    pixelArt: true,
    scene: [Preloader, GameScene],
};

const StartGame = (parent: string, data: IGameDataParams) => {
    if (data.gravityY && config.physics?.matter?.gravity)
        config.physics.matter.gravity.y = data.gravityY;
    const game = new Game({
        ...config,
        width: data.width,
        height: (data.width * 16) / 9,
        parent,
    });
    game.scene.start("preloader", data);
    // // Add an event listener to apply the border radius once the game canvas is created
    // game.events.on("ready", () => {
    //     const canvas = document.querySelector("canvas");
    //     if (canvas) {
    //         canvas.style.borderRadius = "32px"; // Adjust the value as needed
    //     }
    // });
    return game;
};

export default StartGame;


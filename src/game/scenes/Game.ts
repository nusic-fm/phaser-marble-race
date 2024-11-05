import Phaser from "phaser";

export default class Game extends Phaser.Scene {
    constructor() {
        super("game");
    }

    create() {
        console.log("Game Scene...");
        this.add.image(0, 0, "background").setOrigin(0, 0);
    }
}


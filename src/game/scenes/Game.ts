import Phaser from "phaser";

export default class Game extends Phaser.Scene {
    constructor() {
        super("game");
        // this.throttledUpdate = _.throttle(this.throttledUpdate.bind(this), 10); // Throttle interval in milliseconds
    }

    create() {
        console.log("Game Scene...");
    }
}

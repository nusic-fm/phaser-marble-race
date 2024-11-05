import Phaser from "phaser";
import { IGameDataParams } from "../PhaserGame";

export type GameVoiceInfo = {
    id: string;
    name: string;
    avatar: string;
};
export default class Preloader extends Phaser.Scene {
    public params: IGameDataParams;
    constructor() {
        super("preloader");
    }

    init(data: IGameDataParams) {
        this.params = data;
    }

    preload() {
        console.log("Preloader...");
        this.load.image("background", this.params.backgroundPath);
    }

    create() {
        this.scene.start("game", this.params);
    }
}


import Phaser from "phaser";
import { IGameDataParams } from "../PhaserGame";

export type GameVoiceInfo = {
    id: string;
    name: string;
    avatar: string;
};
export const ObstacleNames = [
    "shiba",
    "appalled_girlfriend",
    "distracted_boyfriend",
    "harold",
    "meme_man",
    "pedro",
    "roll_safe",
    "wojack",
];
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
        ObstacleNames.map((name) => {
            this.load.image(
                `obstacle_${name}`,
                `assets/sprite/obstacles/${name}.png`
            );
        });
        this.load.image("hammer_1", "assets/sprite/weapons/hammer_level_1.png");
        this.load.image("hammer_2", "assets/sprite/weapons/hammer_level_2.png");
        if (this.params.enableMotion)
            this.load.image("center_logo", "assets/transparent_logo.png");
        if (this.params.voices.length) {
            this.params.voices.map((voice) => {
                this.load.image(`resized_${voice.id}`, voice.avatar);
            });
        }
        this.params.selectedTracks.map((trackNo) => {
            switch (trackNo) {
                case "01":
                    this.load.image(
                        "prod_texture_loaded_01",
                        "assets/sprite/01.png"
                    );
                    break;
                case "02":
                case "22":
                    this.load.image("02_cross", "assets/sprite/02_cross.png");
                    break;
                case "03":
                    this.load.image(
                        "prod_texture_loaded_03",
                        "assets/sprite/03.png"
                    );
                    break;
                case "06":
                    this.load.image(
                        "prod_texture_loaded_06",
                        "assets/sprite/06.png"
                    );
                    this.load.image("06b", "assets/sprite/06b.png");
                    break;
                case "07":
                    this.load.image(
                        "prod_texture_loaded_07",
                        "assets/sprite/07.png"
                    );
                    break;
                case "11":
                    this.load.image(
                        "left_block",
                        "assets/sprite/left_block.png"
                    );
                    this.load.image(
                        "right_block",
                        "assets/sprite/right_block.png"
                    );
                    this.load.image(
                        "prod_texture_loaded_11",
                        "assets/sprite/11.png"
                    );
                    break;
                case "14":
                    this.load.image("mini_star", "assets/sprite/14_mini.png");
                    this.load.image("14_mini", "assets/sprite/14_mini.png");
                    break;
                case "16":
                    this.load.image(
                        "prod_texture_loaded_16",
                        "assets/sprite/16.png"
                    );
                    break;
                case "21":
                    this.load.image(
                        "prod_texture_loaded_21",
                        "assets/sprite/21.png"
                    );
                    break;
            }
        });

        this.load.json("prod_shapes", "assets/physics/new_shapes.json");
        this.load.json(
            "obstacles_shapes",
            "assets/physics/obstacles_shapes.json"
        );
        // Mini
        this.load.image("bar", "assets/sprite/bar.png");
        this.load.json("mini_shapes", "assets/physics/mini_shapes.json");
        this.load.image("textureImage", this.params.skinPath);
        this.load.image("wheel", "assets/sprite/wheel.png");
        this.load.image("finish_line", "assets/finish.png");
        this.load.image("trail", this.params.trailPath);
    }

    create() {
        this.scene.start("game", this.params);
    }
}


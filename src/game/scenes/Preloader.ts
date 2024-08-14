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
        this.load.image(
            "background",
            "https://voxaudio.nusic.fm/marble_race%2Fbackgrounds%2FBG08.png?alt=media"
        );
        // if (this.params.enableMotion)
        //     this.load.image("center_logo", "assets/transparent_logo.png");
        // // TODO: Enable the below and comment out the rest of the images
        // if (this.params.voices.length) {
        //     this.params.voices.map((voice) => {
        //         this.load.image(voice.id, voice.avatar);
        //     });
        // }
        this.load.image(
            "mask",
            "https://voxaudio.nusic.fm/marble_race%2Ftrack_skins%2FsrainyGradient01.png?alt=media"
        );
        this.load.atlas(
            "prod_texture_loaded_07",
            "assets/sprite/07.png",
            "assets/sprite/screen_sprite.json"
        );
        this.load.atlas(
            "prod_texture_loaded_01",
            "assets/sprite/01.png",
            "assets/sprite/screen_sprite.json"
        );
        this.load.atlas(
            "prod_texture_loaded_21",
            "assets/sprite/21.png",
            "assets/sprite/screen_sprite.json"
        );
        this.load.atlas(
            "prod_texture_loaded_03",
            "assets/sprite/03.png",
            "assets/sprite/screen_sprite.json"
        );
        this.load.atlas(
            "prod_texture_loaded_06",
            "assets/sprite/06.png",
            "assets/sprite/screen_sprite.json"
        );
        this.load.atlas(
            "prod_texture_loaded_16",
            "assets/sprite/16.png",
            "assets/sprite/screen_sprite.json"
        );
        this.load.atlas(
            "prod_texture_loaded_11",
            "assets/sprite/11.png",
            "assets/sprite/screen_sprite.json"
        );
        this.load.json("prod_shapes", "assets/physics/new_shapes.json");

        this.load.image("mini_star", "assets/sprite/14_mini.png");
        this.load.image("left_block", "assets/sprite/left_block.png");
        this.load.image("right_block", "assets/sprite/right_block.png");
        // Mini
        this.load.atlas(
            "14_mini",
            "assets/sprite/14_mini.png",
            "assets/sprite/screen_sprite.json"
        );
        this.load.image("bar", "assets/sprite/bar.png");
        this.load.json("mini_shapes", "assets/physics/mini_shapes.json");
        this.load.image("02_cross", "assets/sprite/02_cross.png");
        this.load.image("06b", "assets/sprite/06b.png");
        // this.load.image("textureImage", this.params.skinPath);
        // this.load.image("empty_circle", "assets/empty_circle.png");
        this.load.image("wheel", "assets/sprite/wheel.png");
        this.load.image("finish_line", "assets/finish.png");
        this.load.image(
            "bg",
            "https://labs.phaser.io/assets/skies/deepblue.png"
        );
        this.load.image(
            "eric",
            "https://voxaudio.nusic.fm/voice_models%2Favatars%2Feric-cartman?alt=media"
        );
        this.load.image(
            "kanye",
            "https://voxaudio.nusic.fm/voice_models%2Favatars%2Fkanye-west?alt=media"
        );
        // this.textures.addBase64(
        //     "res",
        //     "data:image/png;base64,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"
        // );
        // this.load.image("flame", "assets/flame.png");
        // this.load.image("trail", this.params.trailPath);
    }

    create() {
        // this.input.on(
        //     "wheel",
        //     (
        //         pointer: any,
        //         gameObjects: any,
        //         deltaX: any,
        //         deltaY: any,
        //         deltaZ: any
        //     ) => {
        //         this.cameras.main.scrollY += deltaY * 0.5; // Adjust the scroll speed
        //     }
        // );
        // this.matter.add.image(400, 300, 'sky')
        this.scene.start("game", this.params);

        // const particles = this.add.particles('red')

        // const emitter = particles.createEmitter({
        //     speed: 100,
        //     scale: { start: 1, end: 0 },
        //     blendMode: 'ADD'
        // })

        // const logo = this.physics.add.image(400, 100, 'logo')

        // logo.setVelocity(100, 200)
        // logo.setBounce(1, 1)
        // logo.setCollideWorldBounds(true)

        // emitter.startFollow(logo)
    }
}


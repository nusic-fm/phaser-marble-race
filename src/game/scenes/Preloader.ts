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
        this.load.image("background", this.params.backgroundPath);
        // TODO: Enable the below and comment out the rest of the images
        if (this.params.voices.length) {
            this.params.voices.map((voice) => {
                this.load.image(voice.id, voice.avatar);
            });
        }
        // this.load.image(
        //     "voice1",
        //     "https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2Favatars%2Fthumbs%2Farthur-morgan_rdr2-_200x200?alt=media&token=330a3b59-e78d-4b88-81a8-94142b3b4182"
        // );
        // this.load.image(
        //     "voice2",
        //     "https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2Favatars%2Fthumbs%2Fbillie-eilish-2019_200x200?alt=media&token=d2b5866e-0640-4bc7-915e-05a15cd532d5"
        // );
        // this.load.image(
        //     "voice3",
        //     "https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2Favatars%2Fthumbs%2Fcardi-b_200x200?alt=media&token=229057a6-3e8d-42ca-a0a4-01e54dee22bd"
        // );
        // this.load.image(
        //     "voice4",
        //     "https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2Favatars%2Fthumbs%2Fchester-bennington-_200x200?alt=media&token=30576234-1f5a-4104-860a-103e06f452d8"
        // );
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
        this.load.image("textureImage", this.params.skinPath);
        this.load.image("empty_circle", "assets/empty_circle.png");
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


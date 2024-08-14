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

    // Create an off-screen canvas
    canvas = document.createElement("canvas");
    resize(img: HTMLImageElement, name: string) {
        const targetWidth = 46;
        const targetHeight = 46;
        const canvas = this.canvas;
        const ctx = canvas.getContext("2d");

        // Set initial size to original image size
        let width = img.width;
        let height = img.height;
        if (!ctx) return;
        // Resample in steps
        while (width > 2 * targetWidth && height > 2 * targetHeight) {
            width = Math.floor(width / 2);
            height = Math.floor(height / 2);

            // Resize the canvas to the new size
            canvas.width = width;
            canvas.height = height;

            // Draw the image onto the canvas
            ctx.drawImage(img, 0, 0, width, height);
        }

        // Now, do the final resize to the target dimensions
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Set high quality for the final resize
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw the image at the final size
        ctx.drawImage(img, 0, 0, 46, 46);

        // canvas.toBlob((blob) => {
        //     if (blob) {
        //         const blobUrl = URL.createObjectURL(blob);
        //         const img = new Image();
        //         img.src = blobUrl;
        //         img.crossOrigin = "anonymous";
        //         const texture = this.textures.addImage("resizedImage", img);
        //         this.add.image(100, 100, "resizedImage").setOrigin(0.5, 0.5);
        //     }
        // });

        // // Pass the resized image data to the callback
        const dataurl = canvas.toDataURL();
        // "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII";

        console.log("running: ", name);
        return dataurl;
    }
    preload() {
        this.load.image("background", this.params.backgroundPath);
        if (this.params.enableMotion)
            this.load.image("center_logo", "assets/transparent_logo.png");
        // TODO: Enable the below and comment out the rest of the images
        if (this.params.voices.length) {
            this.params.voices.map((voice) => {
                // this.load.image(voice.id, voice.avatar);
                const image = new Image();
                image.src = voice.avatar;
                image.crossOrigin = "anonymous";
                new Promise((res) => {
                    image.onload = () => {
                        const dataUrl = this.resize(image, voice.id);
                        res(dataUrl);
                    };
                }).then((dataurl) => {
                    // Add the newly created image as a texture
                    // this.textures.addBase64(`resized_${voice.id}`, dataurl);
                    this.load.image(`resized_${voice.id}`, dataurl as string);
                });
            });
        }
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
        this.load.image("textureImage", this.params.skinPath);
        this.load.image("wheel", "assets/sprite/wheel.png");
        this.load.image("finish_line", "assets/finish.png");
        this.load.image("trail", this.params.trailPath);
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


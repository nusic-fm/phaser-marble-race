import Phaser from "phaser";
import { voices } from "../../App";
import {
    marbleRaceOnlyInstrument,
    marbleRacePlayVocals,
} from "../../hooks/useTonejs";
import _ from "lodash";

export default class Game extends Phaser.Scene {
    constructor() {
        super("game");
        this.throttledUpdate = _.throttle(
            this.throttledUpdate.bind(this),
            1000
        ); // Throttle interval in milliseconds
    }
    public sky: Phaser.Physics.Matter.Image | undefined;
    public voices: MatterJS.BodyType[] = [];
    public voicesImages: Phaser.GameObjects.Image[] = [];
    public isInstrumentPlaying: boolean = false;
    public autoScroll = false;
    public prevVoiceIdx = -1;

    throttledUpdate(index: number) {
        this.prevVoiceIdx = index;
        // Logic that should be throttled
        marbleRacePlayVocals("f0pmE4twBXnJmVrJzh18", voices[index]);
    }

    create() {
        // var shapes = this.cache.json.get('shapes') as any;
        var prodShapes = this.cache.json.get("prod_shapes") as any;
        // NOT WORKING
        // Create a Matter body with the custom shape
        // const crateBody = this.matter.add.fromVertices(200, 50, shapes.small_skel.fixtures[0].vertices, {isStatic: true});
        // // Add a sprite and attach it to the Matter body
        // const crateSprite = this.add.sprite(0, 0, 'sheet', 'texture_out');
        // this.matter.add.gameObject(crateSprite, crateBody);

        // var ground = this.matter.add.sprite(200, 200, 'small', 'ground', {shape: shapes.small_skel, isStatic: true});
        let startOffset = 800;
        this.matter.add.sprite(
            206,
            startOffset,
            "prod_texture_loaded_03",
            "2",
            {
                shape: prodShapes["03"],
                isStatic: true,
            }
        );
        startOffset += 850;
        this.matter.add.sprite(
            206,
            startOffset,
            "prod_texture_loaded_01",
            "2",
            {
                shape: prodShapes["01"],
                isStatic: true,
            }
        );
        startOffset += 850;
        this.matter.add.sprite(
            170,
            startOffset,
            "prod_texture_loaded_07",
            "1",
            {
                shape: prodShapes["07"],
                isStatic: true,
            }
        );
        startOffset += 850;
        this.matter.add.sprite(
            206,
            startOffset,
            "prod_texture_loaded_21",
            "0",
            {
                shape: prodShapes["21"],
                isStatic: true,
            }
        );
        startOffset += 850;
        this.matter.add.sprite(
            206,
            startOffset,
            "prod_texture_loaded_03",
            "2",
            {
                shape: prodShapes["03"],
                isStatic: true,
            }
        );
        startOffset += 850;
        this.matter.add.sprite(
            206,
            startOffset,
            "prod_texture_loaded_01",
            "2",
            {
                shape: prodShapes["01"],
                isStatic: true,
            }
        );
        startOffset += 850;
        this.matter.add.sprite(
            170,
            startOffset,
            "prod_texture_loaded_07",
            "1",
            {
                shape: prodShapes["07"],
                isStatic: true,
            }
        );
        startOffset += 850;
        this.matter.add.sprite(
            206,
            startOffset,
            "prod_texture_loaded_21",
            "0",
            {
                shape: prodShapes["21"],
                isStatic: true,
            }
        );
        startOffset += 850;
        this.matter.add.sprite(
            206,
            startOffset,
            "prod_texture_loaded_03",
            "2",
            {
                shape: prodShapes["03"],
                isStatic: true,
            }
        );
        startOffset += 850;
        this.matter.add.sprite(
            206,
            startOffset,
            "prod_texture_loaded_01",
            "2",
            {
                shape: prodShapes["01"],
                isStatic: true,
            }
        );
        startOffset += 850;
        this.matter.add.sprite(
            170,
            startOffset,
            "prod_texture_loaded_07",
            "1",
            {
                shape: prodShapes["07"],
                isStatic: true,
            }
        );
        startOffset += 850;
        this.matter.add.sprite(
            206,
            startOffset,
            "prod_texture_loaded_21",
            "0",
            {
                shape: prodShapes["21"],
                isStatic: true,
            }
        );
        startOffset += 850; // NOT WORKING
        // var ground = this.matter.add.sprite(0, 0, 'sheet', 'ground', {shape: (shapes as any).ground});
        // ground.setPosition(0 + ground.centerOfMass.x, 280 + ground.centerOfMass.y);  // position (0,280)

        // const ball = this.matter.add.image(150, 100, 'ball', '', {density: 0.2})
        // // ball.setCircle(30)

        // // ball.setTint(0xff0000)
        // ball.scaleX = 0.01
        // ball.scaleY = 0.01
        // // ball.setVelocity(10, 10)
        // const body = ball.body as MatterJS.BodyType;
        // this.matter.body.setInertia(body, Infinity)
        // // ball.setFriction(0, 0);
        // ball.setBounce(1);
        // // this.matter.add.image(300, 300, 'shape', undefined, {isStatic: true});
        const marbleRadius = 23;
        ["voice1", "voice2", "voice3", "voice4"].map((v, i) => {
            const circleBody = this.matter.add.circle(206, 50, marbleRadius, {
                restitution: 0.6,
                // density: 0.02,
                friction: 0,
                frictionAir: 0,
                frictionStatic: 0,
            });
            this.voices.push(circleBody);
            // // Create an image and attach it to the circle body
            const circleImage = this.add.image(
                circleBody.position.x,
                circleBody.position.y,
                v
            );

            circleImage.setDisplaySize(marbleRadius * 2, marbleRadius * 2); // Adjust size to match the physics body
            circleImage.setOrigin(0.5, 0.5);
            this.voicesImages.push(circleImage);
            // // Make the image follow the physics body
            // this.matter.world.on('beforeupdate', function () {
            //     circleImage.setPosition(circleBody.position.x, circleBody.position.y);
            //     circleImage.setRotation(circleBody.angle);
            // });
        });
        // console.log(this.voices[0].scale)
        // this.matter.body.scale(this.voices[0], 1.2, 1.2);
        // setTimeout(() => {
        //     console.log('test');
        // this.matter.body.scale(this.voices[0], 0.8, 0.8);
        // }, 1000)
        marbleRaceOnlyInstrument("f0pmE4twBXnJmVrJzh18", 120).then(
            () => (this.isInstrumentPlaying = true)
        );
    }
    update(time: number, delta: number): void {
        if (this.voices.length) {
            this.voicesImages.map((v, i) => {
                v.setPosition(
                    this.voices[i].position.x,
                    this.voices[i].position.y
                );
                v.setRotation(this.voices[i].angle);
                // TODO: De-Throttle
                // if (this.voices[i].position.y > 1350 && this.voices[i].position.y < 2100) {
                //     this.matter.body.scale(this.voices[i], 1.2, 1.2);
                // } else {
                //     console.log('de-scalling')
                //     this.matter.body.scale(this.voices[i], 0.8, 0.8);
                // }
            });
        }
        if (this.isInstrumentPlaying) {
            const voicesPositions = this.voices.map((m) => m.position.y);
            const largest = Math.max(...voicesPositions);
            const index = voicesPositions.findIndex((v) => v === largest);
            console.log("First: ", index);
            if (this.prevVoiceIdx !== index) this.throttledUpdate(index);
            const container = document.getElementById("app");
            if (
                this.autoScroll &&
                container
                // &&
                // largest - 300 > (container.scrollTop || 0)
            )
                container.scrollTo(0, largest - 300);
            // const index = voicesCircles.findIndex((v) => v === largest);
            // if (voiceIdxRef.current !== index) {
            //     voiceIdxRef.current = index;
            //     throttledSwitchVoice(index);
            //     // marbleRacePlayVocals(coverDocId, voices[index]);
            // }
            // }
            // if (this.sky) {
            //     this.sky.setV
            //     this.sky.rotation += 0.005;
            //     this.sky.y = this.sky.y + Math.sin(time / 1000 * 2)
        }
    }
}


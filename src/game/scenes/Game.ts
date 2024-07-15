import Phaser from "phaser";
import { voiceNames, voices } from "../../App";
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
    public autoScroll = true;
    public prevVoiceIdx = -1;
    public leftRotatableStars: Phaser.Physics.Matter.Sprite[] = [];
    public rightRotatableStars: Phaser.Physics.Matter.Sprite[] = [];
    public reduceSizeScreenOffset = 0;
    public increaseSizeScreenOffset = 0;
    public heightReducedIndices: number[] = [];
    public upDownMotionElems: Phaser.Physics.Matter.Image[] = [];
    public labels: Phaser.GameObjects.Text[] = [];

    throttledUpdate(index: number) {
        this.prevVoiceIdx = index;
        // Logic that should be throttled
        marbleRacePlayVocals("f0pmE4twBXnJmVrJzh18", voices[index]);
    }

    create() {
        // Set the background image
        this.add.image(400, 300, "background").setScrollFactor(0);
        // Enable camera scrolling
        this.cameras.main.setBounds(0, 0, 512 - 94, 9 * 850 - 700);
        this.matter.world.setBounds(0, 0, 512 - 94, 9 * 850 + 500);

        var prodShapes = this.cache.json.get("prod_shapes");
        var miniShapes = this.cache.json.get("mini_shapes");

        let startOffset = 400;
        // Screen 1
        const xOffset = (512 - 94) / 2;
        this.matter.add.sprite(
            xOffset,
            startOffset + 835 / 2,
            "prod_texture_loaded_06",
            undefined,
            {
                shape: prodShapes["06"],
                isStatic: true,
            }
        );
        // Screen 2
        startOffset += 840;
        this.matter.add.sprite(
            xOffset,
            startOffset + 833 / 2,
            "prod_texture_loaded_21",
            undefined,
            {
                shape: prodShapes["21"],
                isStatic: true,
            }
        );
        startOffset += 980;
        // Stars
        const barWidth = 0;
        // this.matter.add.sprite(
        //     barWidth / 2,
        //     startOffset + 270,
        //     "bar",
        //     undefined,
        //     {
        //         shape: miniShapes["bar"],
        //         isStatic: true,
        //     }
        // );
        // this.matter.add.sprite(487, startOffset + 270, "bar", undefined, {
        //     shape: miniShapes["bar"],
        //     isStatic: true,
        // });

        // First Row
        this.leftRotatableStars.push(
            this.matter.add
                .sprite(115 + barWidth, startOffset, "mini_star", undefined, {
                    shape: miniShapes["14"],
                    isStatic: true,
                })
                .setAngle(35)
        );

        this.rightRotatableStars.push(
            this.matter.add.sprite(
                305 + barWidth,
                startOffset,
                "mini_star",
                undefined,
                {
                    shape: miniShapes["14"],
                    isStatic: true,
                }
            )
        );
        // Second Row
        startOffset += 165;
        this.rightRotatableStars.push(
            this.matter.add
                .sprite(10 + barWidth, startOffset, "mini_star", undefined, {
                    shape: miniShapes["14"],
                    isStatic: true,
                })
                .setAngle(5)
        );
        this.rightRotatableStars.push(
            this.matter.add.sprite(
                206 + barWidth,
                startOffset,
                "mini_star",
                undefined,
                {
                    shape: miniShapes["14"],
                    isStatic: true,
                }
            )
            // .setAngle()
        );
        this.leftRotatableStars.push(
            this.matter.add
                .sprite(400 + barWidth, startOffset, "mini_star", undefined, {
                    shape: miniShapes["14"],
                    isStatic: true,
                })
                .setAngle(35)
        );
        // Third Row
        startOffset += 180;
        this.leftRotatableStars.push(
            this.matter.add
                .sprite(115 + barWidth, startOffset, "mini_star", undefined, {
                    shape: miniShapes["14"],
                    isStatic: true,
                })
                .setAngle(30)
        );
        this.rightRotatableStars.push(
            this.matter.add
                .sprite(305 + barWidth, startOffset, "mini_star", undefined, {
                    shape: miniShapes["14"],
                    isStatic: true,
                })
                .setAngle(5)
        );
        // Fourth Row
        startOffset += 160;
        this.rightRotatableStars.push(
            this.matter.add
                .sprite(10 + barWidth, startOffset, "mini_star", undefined, {
                    shape: miniShapes["14"],
                    isStatic: true,
                })
                .setAngle(8)
        );
        this.leftRotatableStars.push(
            this.matter.add
                .sprite(210 + barWidth, startOffset, "mini_star", undefined, {
                    shape: miniShapes["14"],
                    isStatic: true,
                })
                .setAngle(30)
        );
        this.leftRotatableStars.push(
            this.matter.add
                .sprite(400 + barWidth, startOffset, "mini_star", undefined, {
                    shape: miniShapes["14"],
                    isStatic: true,
                })
                .setAngle(35)
        );
        // Triangle
        startOffset += 149;
        this.matter.add.sprite(
            xOffset + 0,
            startOffset + 833 / 2,
            "prod_texture_loaded_03",
            undefined,
            {
                shape: prodShapes["03"],
                isStatic: true,
            }
        );
        startOffset += 854;
        this.reduceSizeScreenOffset = startOffset;
        this.matter.add.sprite(
            xOffset,
            startOffset + 835 / 2,
            "prod_texture_loaded_16",
            undefined,
            {
                shape: prodShapes["16"],
                isStatic: true,
            }
        );
        startOffset += 810;
        this.increaseSizeScreenOffset = startOffset;
        this.matter.add.sprite(
            xOffset - 4,
            startOffset + 833 / 2,
            "prod_texture_loaded_11",
            undefined,
            {
                shape: prodShapes["11"],
                isStatic: true,
            }
        );
        // this.upDownMotionElems.push(
        //     this.matter.add
        //         .image(366, startOffset + 117, "left_block", undefined, {
        //             isStatic: true,
        //         })
        //         .setScale(0.18, 0.18)
        // );
        startOffset += 842;
        this.matter.add.sprite(
            xOffset,
            startOffset + 833 / 2,
            "prod_texture_loaded_01",
            undefined,
            {
                shape: prodShapes["01"],
                isStatic: true,
            }
        );
        startOffset += 832;
        this.matter.add.sprite(
            xOffset,
            startOffset + 833 / 2,
            "prod_texture_loaded_07",
            undefined,
            {
                shape: prodShapes["07"],
                isStatic: true,
            }
        );
        startOffset += 880;
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
            // Create label for each circle
            let label = this.add.text(
                circleImage.x,
                circleImage.y - 80,
                voiceNames[i],
                {
                    fontSize: "32px",
                    color: "#ffffff",
                    stroke: "#000",
                    strokeThickness: 10,
                }
            );
            this.labels.push(label);
        });
        marbleRaceOnlyInstrument("f0pmE4twBXnJmVrJzh18", 120).then(
            () => (this.isInstrumentPlaying = true)
        );
    }
    update(time: number, delta: number): void {
        if (this.voices.length) {
            this.voicesImages.map((v, i) => {
                const voiceBody = this.voices[i];
                v.setPosition(voiceBody.position.x, voiceBody.position.y);
                v.setRotation(voiceBody.angle);
                this.labels[i].setPosition(
                    voiceBody.position.x - 100,
                    voiceBody.position.y - 80
                );
                if (
                    this.heightReducedIndices.includes(i) &&
                    voiceBody.position.y > this.increaseSizeScreenOffset
                ) {
                    this.matter.body.scale(voiceBody, 2, 2);
                    v.setDisplaySize(46, 46);
                    this.heightReducedIndices =
                        this.heightReducedIndices.filter((idx) => idx !== i);
                } else if (
                    this.heightReducedIndices.includes(i) === false &&
                    voiceBody.position.y > this.reduceSizeScreenOffset &&
                    voiceBody.position.y < this.increaseSizeScreenOffset
                ) {
                    this.heightReducedIndices.push(i);
                    this.matter.body.scale(voiceBody, 0.5, 0.5);
                    v.setDisplaySize(23, 23);
                }
            });
        }
        if (this.isInstrumentPlaying) {
            const voicesPositions = this.voices.map((m) => m.position.y);
            const largest = Math.max(...voicesPositions);
            const index = voicesPositions.findIndex((v) => v === largest);
            // console.log("First: ", index);
            if (this.prevVoiceIdx !== index) this.throttledUpdate(index);
            const container = document.getElementById("app");
            if (
                this.autoScroll &&
                container
                // &&
                // largest - 300 > (container.scrollTop || 0)
            ) {
                this.cameras.main.scrollY = largest - 300;
                // container.scrollTo(0, largest - 300);
            }
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
        this.leftRotatableStars.map((rs) => rs.setAngle(rs.angle - 0.4));
        this.rightRotatableStars.map((rs) => rs.setAngle(rs.angle + 0.4));
        // const amplitude = 0.12; // 200 pixels, which is 20 cm
        // const frequency = 0.001; // Adjust frequency to control the speed of oscillation

        // this.upDownMotionElems.map((elem) => {
        //     // Update the rectangle's y position using a sine wave
        //     elem.setPosition(
        //         elem.x,
        //         elem.y + amplitude * Math.sin(frequency * time)
        //     );
        // });
    }
}


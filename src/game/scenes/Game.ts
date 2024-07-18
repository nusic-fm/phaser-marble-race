import Phaser from "phaser";
import {
    marbleRaceOnlyInstrument,
    marbleRacePlayVocals,
} from "../../hooks/useTonejs";
import _ from "lodash";
import { GameVoiceInfo } from "./Preloader";
import { IGameDataParams } from "../PhaserGame";

export default class Game extends Phaser.Scene {
    constructor() {
        super("game");
        this.throttledUpdate = _.throttle(
            this.throttledUpdate.bind(this),
            1000
        ); // Throttle interval in milliseconds
    }
    public sky: Phaser.Physics.Matter.Image | undefined;
    public marbles: MatterJS.BodyType[] = [];
    public marblesImages: Phaser.GameObjects.Image[] = [];
    public marblesMasks: Phaser.GameObjects.Graphics[] = [];
    public isInstrumentPlaying: boolean = false;
    public autoScroll = true;
    public prevVoiceIdx = -1;
    public leftRotatableStars: Phaser.Physics.Matter.Sprite[] = [];
    public rightRotatableStars: Phaser.Physics.Matter.Sprite[] = [];
    public reduceSizeScreenOffset = 0;
    public increaseSizeScreenOffset = 0;
    public heightReducedIndices: number[] = [];
    public upDownMotionElems: {
        matter: Phaser.Physics.Matter.Image;
        startY: number;
        maxTop: number;
        maxBottom: number;
        moveSpeed: number;
    }[] = [];
    public labels: Phaser.GameObjects.Text[] = [];
    public motionTimeForUpDownWard = 0;
    public crossRightRotation: Phaser.Physics.Matter.Sprite[] = [];
    public crossLeftRotation: Phaser.Physics.Matter.Sprite[] = [];
    public horizontalCrossRightRotation: Phaser.Physics.Matter.Sprite[] = [];
    public horizontalCrossLeftRotation: Phaser.Physics.Matter.Sprite[] = [];
    public trails: { x: number; y: number }[][] = [];
    public trailGraphics: Phaser.GameObjects.Graphics[] = [];
    public trailsGroup: Phaser.GameObjects.Group[] = [];
    public trailLength: number;
    public trailPoints: {
        x: number;
        y: number;
        angle: number;
        // size: number;
    }[][] = [];
    // public shape: any;
    public voices: GameVoiceInfo[] = [];
    public coverDocId: string;
    public musicStartOffset: number;

    init(data: IGameDataParams) {
        this.voices = data.voices;
        this.coverDocId = data.coverDocId;
        this.musicStartOffset = data.musicStartOffset;
    }

    throttledUpdate(index: number) {
        this.prevVoiceIdx = index;
        // Logic that should be throttled
        marbleRacePlayVocals(this.coverDocId, this.voices[index].id);
    }

    createTextureMask = (
        xOffset: number,
        yOffset: number,
        baseSprite: Phaser.Physics.Matter.Sprite | Phaser.Physics.Matter.Image
    ) => {
        // Create the texture sprite
        const textureSprite = this.add.sprite(xOffset, yOffset, "textureImage");

        // Use the base sprite's texture as a mask for the texture sprite
        const mask = new Phaser.Display.Masks.BitmapMask(this, baseSprite);
        textureSprite.setMask(mask);

        // Optionally, hide the base sprite if you only want to show the texture
        baseSprite.setVisible(false);
    };

    createCrossScreen = (
        startOffset: number,
        canvasWidth: number,
        miniShapes: any
    ) => {
        startOffset += 151;
        this.crossRightRotation.push(
            this.matter.add.sprite(18, startOffset, "02_cross", undefined, {
                shape: miniShapes["02"],
                isStatic: true,
            })
        );
        this.crossLeftRotation.push(
            this.matter.add.sprite(
                canvasWidth - 18,
                startOffset,
                "02_cross",
                undefined,
                {
                    shape: miniShapes["02"],
                    isStatic: true,
                }
            )
        );
        startOffset += 151 + 40;
        this.crossLeftRotation.push(
            this.matter.add.sprite(138, startOffset, "02_cross", undefined, {
                shape: miniShapes["02"],
                isStatic: true,
            })
        );
        this.crossRightRotation.push(
            this.matter.add.sprite(
                canvasWidth - 120,
                startOffset,
                "02_cross",
                undefined,
                {
                    shape: miniShapes["02"],
                    isStatic: true,
                }
            )
        );
        startOffset += 151 + 40;
        this.crossRightRotation.push(
            this.matter.add.sprite(18, startOffset, "02_cross", undefined, {
                shape: miniShapes["02"],
                isStatic: true,
            })
        );
        this.crossLeftRotation.push(
            this.matter.add.sprite(
                canvasWidth - 18,
                startOffset,
                "02_cross",
                undefined,
                {
                    shape: miniShapes["02"],
                    isStatic: true,
                }
            )
        );
        startOffset += 151 + 40;
        this.crossLeftRotation.push(
            this.matter.add.sprite(132, startOffset, "02_cross", undefined, {
                shape: miniShapes["02"],
                isStatic: true,
            })
        );
        this.crossRightRotation.push(
            this.matter.add.sprite(
                canvasWidth - 135,
                startOffset,
                "02_cross",
                undefined,
                {
                    shape: miniShapes["02"],
                    isStatic: true,
                }
            )
        );
        this.crossLeftRotation.map((baseSprite) =>
            this.createTextureMask(baseSprite.x, baseSprite.y, baseSprite)
        );
        this.crossRightRotation.map((baseSprite) =>
            this.createTextureMask(baseSprite.x, baseSprite.y, baseSprite)
        );
        return startOffset + 250;
    };
    createSeesawScreen = (
        xOffset: number,
        startOffset: number,
        prodShapes: any
    ) => {
        const yOffset = startOffset + 835 / 2;
        const baseSprite = this.matter.add.sprite(
            xOffset,
            yOffset,
            "prod_texture_loaded_06",
            undefined,
            {
                shape: prodShapes["06"],
                isStatic: true,
            }
        );
        this.createTextureMask(xOffset, yOffset, baseSprite);
        return startOffset + 840;
    };
    createCircleBlockers = (
        xOffset: number,
        startOffset: number,
        prodShapes: any
    ) => {
        const yOffset = startOffset + 833 / 2;
        const baseSprite = this.matter.add.sprite(
            xOffset,
            yOffset,
            "prod_texture_loaded_21",
            undefined,
            {
                shape: prodShapes["21"],
                isStatic: true,
            }
        );
        this.createTextureMask(xOffset, yOffset, baseSprite);
        return startOffset + 880;
    };
    createStarRotations = (startOffset: number, miniShapes: any) => {
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
        [...this.leftRotatableStars, ...this.rightRotatableStars].map(
            (baseSprite) =>
                this.createTextureMask(baseSprite.x, baseSprite.y, baseSprite)
        );
        return startOffset + 149;
    };

    createStaticTriangles = (
        xOffset: number,
        startOffset: number,
        prodShapes: any
    ) => {
        const yOffset = startOffset + 833 / 2;
        const baseSprite = this.matter.add.sprite(
            xOffset + 0,
            yOffset,
            "prod_texture_loaded_03",
            undefined,
            {
                shape: prodShapes["03"],
                isStatic: true,
            }
        );
        this.createTextureMask(xOffset, yOffset, baseSprite);

        return startOffset + 1000;
    };

    createReduceSizeSlider = (
        xOffset: number,
        startOffset: number,
        prodShapes: any
    ) => {
        this.reduceSizeScreenOffset = startOffset;
        const yOffset = startOffset + 833 / 2;
        const baseSprite = this.matter.add.sprite(
            xOffset,
            yOffset,
            "prod_texture_loaded_16",
            undefined,
            {
                shape: prodShapes["16"],
                isStatic: true,
            }
        );
        this.createTextureMask(xOffset, yOffset, baseSprite);
        startOffset += 800;
        this.increaseSizeScreenOffset = startOffset;
        startOffset += 300;
        return startOffset;
    };
    createStopperSlider = (
        xOffset: number,
        startOffset: number,
        prodShapes: any
    ) => {
        const yOffset = startOffset + 833 / 2;
        const baseSprite = this.matter.add.sprite(
            xOffset - 4,
            yOffset,
            "prod_texture_loaded_11",
            undefined,
            {
                shape: prodShapes["11"],
                isStatic: true,
            }
        );
        // Motion parts
        this.upDownMotionElems.push(
            {
                matter: this.matter.add
                    .image(315, startOffset + 100, "left_block", undefined, {
                        isStatic: true,
                    })
                    .setScale(0.18, 0.18),
                startY: startOffset + 100,
                maxTop: 1,
                maxBottom: 38,
                moveSpeed: 0.3,
            }
            // .setAngle(7.1)
        );
        this.upDownMotionElems.push(
            {
                matter: this.matter.add
                    .image(106, startOffset + 259, "right_block", undefined, {
                        isStatic: true,
                    })
                    .setScale(0.18, 0.18),
                startY: startOffset + 259,
                maxTop: 1,
                maxBottom: 28,
                moveSpeed: 0.4,
            }
            // .setAngle(7.1)
        );
        this.upDownMotionElems.push(
            {
                matter: this.matter.add
                    .image(316, startOffset + 418, "left_block", undefined, {
                        isStatic: true,
                    })
                    .setScale(0.18, 0.18),
                startY: startOffset + 418,
                maxTop: 15,
                maxBottom: -18,
                moveSpeed: 0.3,
            }
            // .setAngle(7.1)
        );
        this.upDownMotionElems.push(
            {
                matter: this.matter.add
                    .image(105, startOffset + 550, "right_block", undefined, {
                        isStatic: true,
                    })
                    .setScale(0.18, 0.18),
                startY: startOffset + 550,
                maxTop: 1,
                maxBottom: 28,
                moveSpeed: 0.3,
            }
            // .setAngle(7.1)
        );
        this.upDownMotionElems.push(
            {
                matter: this.matter.add
                    .image(316, startOffset + 695, "left_block", undefined, {
                        isStatic: true,
                    })
                    .setScale(0.18, 0.18),
                startY: startOffset + 705,
                maxTop: 20,
                maxBottom: -18,
                moveSpeed: 0.4,
            }
            // .setAngle(7.1)
        );
        //TODO for the right & left blocks
        this.upDownMotionElems
            .map((e) => e.matter)
            .map((image) => this.createTextureMask(image.x, image.y, image));
        this.createTextureMask(baseSprite.x, baseSprite.y, baseSprite);
        return startOffset + 842;
    };
    createStaticCircles = (
        xOffset: number,
        startOffset: number,
        prodShapes: any
    ) => {
        const yOffset = startOffset + 833 / 2;
        const baseSprite = this.matter.add.sprite(
            xOffset,
            yOffset,
            "prod_texture_loaded_01",
            undefined,
            {
                shape: prodShapes["01"],
                isStatic: true,
            }
        );
        this.createTextureMask(xOffset, yOffset, baseSprite);
        return startOffset + 832;
    };
    createZigzagSlider = (
        xOffset: number,
        startOffset: number,
        prodShapes: any
    ) => {
        const yOffset = startOffset + 833 / 2;
        const baseSprite = this.matter.add.sprite(
            xOffset,
            yOffset,
            "prod_texture_loaded_07",
            undefined,
            {
                shape: prodShapes["07"],
                isStatic: true,
            }
        );
        this.createTextureMask(xOffset, yOffset, baseSprite);
        return startOffset + 880;
    };
    createMarbles = (marbleRadius: number) => {
        this.voices.map((v, i) => {
            // const radius = 23;
            // const body = this.matter.add.circle(400, 400, radius);
            // const image = this.add.image(
            //     body.position.x,
            //     body.position.y,
            //     v.id
            // );
            // image.setOrigin(0.5, 0.5);
            // image.displayWidth = radius * 2;
            // image.displayHeight = radius * 2;
            // // Create a circular mask
            // const maskShape = this.make.graphics();
            // maskShape.fillStyle(0xffffff);
            // maskShape.fillCircle(radius, radius, radius);
            // const mask = maskShape.createGeometryMask();

            // // Apply the mask to the image
            // image.setMask(mask);
            // // Update the image and mask positions to follow the body's position
            // this.matter.world.on("afterupdate", () => {
            //     image.x = circleBody.position.x;
            //     image.y = circleBody.position.y;
            //     image.rotation = circleBody.angle;

            //     // Update the mask position
            //     maskShape.x = circleBody.position.x - radius;
            //     maskShape.y = circleBody.position.y - radius;
            //     maskShape.rotation = circleBody.angle;
            // });
            const circleBody = this.matter.add.circle(206, 50, marbleRadius, {
                restitution: 0.8,
                // density: 0.02,
                friction: 0,
                frictionAir: 0,
                frictionStatic: 0,
            });
            this.marbles.push(circleBody);
            this.trailsGroup.push(this.add.group());
            this.trailGraphics.push(this.add.graphics());
            this.trailPoints.push([]);
            // // Create an image and attach it to the circle body
            const circleImage = this.add.image(
                circleBody.position.x,
                circleBody.position.y,
                v.id
            );

            circleImage.setDisplaySize(marbleRadius * 2, marbleRadius * 2); // Adjust size to match the physics body
            circleImage.setOrigin(0.5, 0.5);
            const maskShape = this.make.graphics();
            maskShape.fillStyle(0xffffff);
            maskShape.fillCircle(marbleRadius, marbleRadius, marbleRadius);
            const mask = maskShape.createGeometryMask();

            // Apply the mask to the image
            circleImage.setMask(mask);
            this.marblesMasks.push(maskShape);

            this.marblesImages.push(circleImage);
            // Create label for each circle
            let label = this.add.text(
                circleImage.x,
                circleImage.y - 80,
                this.voices[i].name,
                {
                    fontSize: "32px",
                    color: "#ffffff",
                    stroke: "#000",
                    strokeThickness: 10,
                }
            );
            this.labels.push(label);
        });
    };
    createHorizontalCrosses = (
        canvasWidth: number,
        _startOffset: number,
        miniShapes: any
    ) => {
        let startOffset = _startOffset + 200;
        let leftOffset = 20;
        let rightOffset = canvasWidth - 20;
        new Array(5).fill("").map(() => {
            this.horizontalCrossRightRotation.push(
                this.matter.add
                    .sprite(leftOffset, startOffset, "02_cross", undefined, {
                        shape: miniShapes["02"],
                        isStatic: true,
                    })
                    .setScale(0.8, 0.8)
            );
            leftOffset += 80;
        });
        startOffset += 250;
        new Array(5).fill("").map(() => {
            this.horizontalCrossLeftRotation.push(
                this.matter.add
                    .sprite(rightOffset, startOffset, "02_cross", undefined, {
                        shape: miniShapes["02"],
                        isStatic: true,
                    })
                    .setScale(0.8, 0.8)
            );
            rightOffset -= 80;
        });
        leftOffset = 20;
        startOffset += 250;
        new Array(5).fill("").map(() => {
            this.horizontalCrossRightRotation.push(
                this.matter.add
                    .sprite(leftOffset, startOffset, "02_cross", undefined, {
                        shape: miniShapes["02"],
                        isStatic: true,
                    })
                    .setScale(0.8, 0.8)
            );
            leftOffset += 80;
        });
        rightOffset = canvasWidth - 20;
        startOffset += 250;
        new Array(5).fill("").map(() => {
            this.horizontalCrossLeftRotation.push(
                this.matter.add
                    .sprite(rightOffset, startOffset, "02_cross", undefined, {
                        shape: miniShapes["02"],
                        isStatic: true,
                    })
                    .setScale(0.8, 0.8)
            );
            rightOffset -= 80;
        });
        [
            ...this.horizontalCrossLeftRotation,
            ...this.horizontalCrossRightRotation,
        ].map((baseSprite) =>
            this.createTextureMask(baseSprite.x, baseSprite.y, baseSprite)
        );
        return startOffset + 230;
    };

    create() {
        // Set the background image
        this.add.image(400, 300, "background").setScrollFactor(0);
        // Enable camera scrolling
        const canvasWidth = 512 - 94;
        this.cameras.main.setBounds(0, 0, canvasWidth, 11 * 850 + 300);
        this.matter.world.setBounds(0, 0, canvasWidth, 11 * 850 + 800);

        var prodShapes = this.cache.json.get("prod_shapes");
        var miniShapes = this.cache.json.get("mini_shapes");

        let startOffset = 500;
        const xOffset = (512 - 94) / 2;
        startOffset = this.createHorizontalCrosses(
            canvasWidth,
            startOffset,
            miniShapes
        );
        startOffset = this.createStaticCircles(
            xOffset,
            startOffset,
            prodShapes
        );
        startOffset = this.createStopperSlider(
            xOffset,
            startOffset,
            prodShapes
        );
        startOffset = this.createCrossScreen(
            startOffset,
            canvasWidth,
            miniShapes
        );
        startOffset = this.createCircleBlockers(
            xOffset,
            startOffset,
            prodShapes
        );
        startOffset = this.createReduceSizeSlider(
            xOffset,
            startOffset,
            prodShapes
        );
        startOffset = this.createSeesawScreen(xOffset, startOffset, prodShapes);
        startOffset = this.createStaticTriangles(
            xOffset,
            startOffset,
            prodShapes
        );
        startOffset = this.createStarRotations(startOffset, miniShapes);
        startOffset = this.createZigzagSlider(xOffset, startOffset, prodShapes);

        const marbleRadius = 23;
        this.createMarbles(marbleRadius);
        // const shape1 = new Phaser.Geom.Circle(0, 0, 30);
        // this.shape = shape1;
        // const emitter = this.add.particles(400, 300, "flares", {
        //     frame: {
        //         frames: ["red", "green", "blue", "white", "yellow"],
        //         cycle: true,
        //     },
        //     blendMode: "ADD",
        //     lifespan: 500,
        //     quantity: 4,
        //     scale: { start: 0.5, end: 0.1 },
        // });

        // emitter.addEmitZone({
        //     type: "edge",
        //     source: shape1,
        //     quantity: 64,
        //     total: 1,
        // });
        // shape1.setPosition(400, 400);

        marbleRaceOnlyInstrument(
            this.coverDocId,
            120,
            this.musicStartOffset
        ).then(() => (this.isInstrumentPlaying = true));
    }
    update(time: number, delta: number): void {
        if (this.marbles.length) {
            // ------------------------------------------------------------------------------------------------------------------------------
            this.marbles.map((voiceSprite, i) => {
                const velocity = Math.sqrt(
                    voiceSprite.velocity.x ** 2 + voiceSprite.velocity.y ** 2
                );
                // If velocity is zero, do not draw the trail
                if (velocity > 0.1) {
                    // Calculate the position directly behind the circle relative to its velocity vector
                    const offsetX = (-voiceSprite.velocity.x / velocity) * 23;
                    const offsetY = (-voiceSprite.velocity.y / velocity) * 23;
                    const trailX = voiceSprite.position.x + offsetX;
                    const trailY = voiceSprite.position.y + offsetY;
                    //     // Calculate the angle of the trail image
                    const angle =
                        Math.atan2(
                            voiceSprite.velocity.y,
                            voiceSprite.velocity.x
                        ) *
                        (180 / Math.PI);
                    // Add the current trail position to the trail points array
                    this.trailPoints[i].push({
                        x: trailX,
                        y: trailY,
                        angle,
                    });
                    // Adjust trail length based on velocity
                    this.trailLength = Phaser.Math.Clamp(velocity * 4, 10, 100);
                    // Limit the number of points in the trail to the trail length
                    if (this.trailPoints[i].length > this.trailLength) {
                        this.trailPoints[i].shift();
                    }
                    // Clear the previous trail
                    this.trailGraphics[i].clear();
                    //     this.trailsGroup[i].clear(true, true);
                    //     // Draw the trail
                    for (let j = 0; j < this.trailPoints[i].length; j++) {
                        const point = this.trailPoints[i][j];
                        const alpha = (j + 0.01) / this.trailPoints[i].length; // Gradually decrease alpha
                        this.trailGraphics[i].fillStyle(
                            0x0cffffff,
                            alpha * 0.01
                        );
                        // this.trailGraphics.fillCircle(point.x, point.y, 20);
                        this.trailGraphics[i].fillRoundedRect(
                            point.x - 20,
                            point.y - 20,
                            40,
                            40
                        );
                        // .setAngle(point.angle);
                        // Draw rectangles centered at the trail points
                        // this.trailGraphics.beginPath();
                        // this.trailGraphics.moveTo(point.x, point.y);
                        // this.trailGraphics.lineTo(point.x - 5, point.y - 20);
                        // this.trailGraphics.lineTo(point.x + 5, point.y - 20);
                        // this.trailGraphics.closePath();
                        // this.trailGraphics.fillPath();
                        // console.log(point.angle);
                        // const flame = this.add
                        //     .image(point.x, point.y, "flame")
                        //     .setAlpha(alpha * 0.5)
                        //     .setRotation(((point.angle || 0) * Math.PI) / 180)
                        //     .setScale(2, 2);
                        // this.trailsGroup[i].add(flame);
                    }
                } else {
                    // Clear the trail if velocity is zero
                    this.trailGraphics[i].clear();
                    // this.trailsGroup[i].clear(true, true);
                }
            });
            // ------------------------------------------------------------------------------------------------------------------------------
            this.marblesImages.map((v, i) => {
                const voiceBody = this.marbles[i];

                v.setPosition(voiceBody.position.x, voiceBody.position.y);
                v.setRotation(voiceBody.angle);
                this.marblesMasks[i].setPosition(
                    voiceBody.position.x - 23,
                    voiceBody.position.y - 23
                );
                // this.marblesMasks[i].setRotation(voiceBody.angle);

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

            //   const ctx = render.context;
            //   ctx.beginPath();
            //   ctx.lineWidth = 50;
            //   ctx.lineCap = "round";
            //   this.trails.map((trail) => {
            //     for (let i = 1; i < trail.length; i++) {
            //       ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
            //       ctx.lineTo(trail[i].x, trail[i].y);
            //     }
            //   });
            //   ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
            //   ctx.stroke();

            //   // for (let i = 1; i < trails.length; i++) {
            //   //   ctx.beginPath();
            //   //   ctx.moveTo(trails[i - 1].x, trails[i - 1].y);
            //   //   ctx.lineTo(trails[i].x, trails[i].y);

            //   //   const gradient = ctx.createLinearGradient(
            //   //     trails[i - 1].x,
            //   //     trails[i - 1].y,
            //   //     trails[i].x,
            //   //     trails[i].y
            //   //   );
            //   //   // gradient.addColorStop(0, marbleColor);
            //   //   gradient.addColorStop(1, "rgba(255, 0, 0, 0)"); // Transparent end

            //   //   ctx.strokeStyle = gradient;
            //   //   ctx.lineWidth = marbleRadius * 2; // Set line width to match marble diameter
            //   //   ctx.stroke();
            //   // }
            // });
        }
        this.crossRightRotation.map((c) => c.setAngle(c.angle + 2));
        this.crossLeftRotation.map((c) => c.setAngle(c.angle - 2));
        if (this.isInstrumentPlaying) {
            const voicesPositions = this.marbles.map((m) => m.position.y);
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
        this.horizontalCrossRightRotation.map((rs) =>
            rs.setAngle(rs.angle + 2.5)
        );
        this.horizontalCrossLeftRotation.map((rs) =>
            rs.setAngle(rs.angle - 2.5)
        );

        // Bars up/down motion
        this.motionTimeForUpDownWard += delta;
        this.upDownMotionElems.map(
            ({ matter, startY, moveSpeed, maxBottom, maxTop }) => {
                // Calculate new y position using a sine wave for smooth up and down movement
                const range = maxBottom - maxTop;
                const midPoint = maxTop + range / 2;
                // Update the rectangle's y position using a sine wave
                matter.setPosition(
                    matter.x,
                    startY +
                        midPoint +
                        (range / 2) * Math.sin(time * 0.005 * moveSpeed)
                );
            }
        );
    }
}


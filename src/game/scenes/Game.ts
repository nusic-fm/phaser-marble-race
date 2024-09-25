import Phaser from "phaser";
import {
    marbleRaceOnlyInstrument,
    marbleRacePlayVocals,
} from "../../hooks/useTonejs";
import _ from "lodash";
import { GameVoiceInfo, ObstacleNames } from "./Preloader";
import { IGameDataParams } from "../PhaserGame";
import { duplicateArrayElemToN } from "../../helpers";
import { BodyType } from "matter";

export default class Game extends Phaser.Scene {
    constructor() {
        super("game");
        this.throttledUpdate = _.throttle(this.throttledUpdate.bind(this), 10); // Throttle interval in milliseconds
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
    public reduceSizeScreenOffset: number[] = [];
    public increaseSizeScreenOffset: number[] = [];
    public currentMarblesSizeIndices: { [key: string]: number } = {};
    public heightReducedIndices: number[] = [];
    public upDownMotionElems: {
        matter: Phaser.Physics.Matter.Image;
        startX: number;
        startY: number;
        maxTop: number;
        maxBottom: number;
        moveSpeed: number;
        direction: "left" | "right";
    }[] = [];
    public labels: Phaser.GameObjects.Text[] = [];
    public motionTimeForUpDownWard = 0;
    public crossRightRotation: Phaser.Physics.Matter.Sprite[] = [];
    public crossLeftRotation: Phaser.Physics.Matter.Sprite[] = [];
    public horizontalCrossRightRotation: Phaser.Physics.Matter.Sprite[] = [];
    public horizontalCrossLeftRotation: Phaser.Physics.Matter.Sprite[] = [];
    // public trails: { x: number; y: number }[][] = [];
    // public trailGraphics: Phaser.GameObjects.Graphics[] = [];
    // public trailsGroup: Phaser.GameObjects.Group[] = [];
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
    public selectedTracks: string[];
    public noOfRaceTracks: number;
    largeCircle: Phaser.Physics.Matter.Image | undefined;
    isRotating = true;
    baseAngle = 0;
    centerX = 256 - 94 / 2;
    centerY = 256;
    radius = 100;
    angleIncrement = (2 * Math.PI) / 5;
    countdownText: Phaser.GameObjects.Text | undefined;
    finishLineOffset: number = 0;
    marbleRadius = 23;
    background: Phaser.GameObjects.TileSprite;
    enableMotion: boolean = false;
    marbleTrailParticles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
    trailConfig = {
        speed: { min: -50, max: 50 },
        scale: {
            start: window.devicePixelRatio,
            end: window.devicePixelRatio * 0.5,
        },
        blendMode: "ADD",
        lifespan: 400,
        alpha: 0.5,
    };
    damageMultipliyer: number = 1;
    level1Hammer: Phaser.GameObjects.Sprite | undefined;
    level2Hammer: Phaser.GameObjects.Sprite | undefined;
    canvasWidth: number = 0;
    canvasHeight: number = 0;

    init(data: IGameDataParams) {
        // Sort the voices randomly
        this.voices = data.voices.sort(() => Math.random() - 0.5);
        this.coverDocId = data.coverDocId;
        this.musicStartOffset = data.musicStartOffset;
        this.noOfRaceTracks = data.noOfRaceTracks;
        this.selectedTracks = duplicateArrayElemToN(
            data.selectedTracks,
            this.noOfRaceTracks
        );
        this.enableMotion = data.enableMotion;
        this.canvasWidth = data.width;
        this.marbleRadius =
            (22 / 414) * this.canvasWidth * window.devicePixelRatio;
        if (data.height) this.canvasHeight = data.height;
        this.centerX = this.cameras.main.width / 2;
        this.centerY = this.cameras.main.height / 2;
        this.trailConfig.scale.end = data.trailEndSize;
        this.trailConfig.lifespan = data.trailsLifeSpace;
        this.trailConfig.alpha = data.trailsOpacity;
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
        // textureSprite.setScale(
        //     (this.canvasWidth / textureSprite.width) * window.devicePixelRatio,
        //     (this.canvasHeight / textureSprite.height) * window.devicePixelRatio
        // );
        textureSprite.setScale(window.devicePixelRatio);

        // Use the base sprite's texture as a mask for the texture sprite
        const mask = new Phaser.Display.Masks.BitmapMask(this, baseSprite);
        textureSprite.setMask(mask);

        // Optionally, hide the base sprite if you only want to show the texture
        baseSprite.setVisible(false);
    };

    handleDamage(target: Phaser.Physics.Matter.Sprite, e: any) {
        // Logic for handling damage
        console.log("Damage dealt to the target!");
        if (this.damageMultipliyer) {
            target.setScale(target.scale / (1.1 * this.damageMultipliyer));
            const particleConfig = {
                speed: { min: -50, max: 50 },
                scale: { start: 1, end: 10 },
                blendMode: "ADD",
                // lifespan: 400,
                alpha: 0.5,
                particleBringToTop: true,
            };
            const particle = this.add.particles(
                e.worldX,
                e.worldY,
                "trail",
                particleConfig
            );
            // Add an event listener to destroy the emitter after the particles' lifespan
            this.time.delayedCall(
                200,
                () => {
                    // emitter.stop();
                    particle.destroy(); // Destroys the particle manager and emitter
                },
                [],
                this
            );
        }
        if (target.scale <= 0.08) {
            target.destroy();
        }

        // // Example: reduce health, show effects, etc.
        // target.health = (target.health || 100) - 10; // Example: reduce health by 10
        // console.log("Target health:", target.health);

        // if (target.health <= 0) {
        //     console.log("Target destroyed!");
        //     target.destroy(); // Destroy the target if health is 0
        // }
    }
    createCrossScreen = (
        startOffset: number,
        canvasWidth: number,
        miniShapes: any
    ) => {
        // TODO: Scale the sprite
        startOffset += 151;
        const l1CrossLeft = this.matter.add.sprite(
            18 * window.devicePixelRatio,
            startOffset,
            "02_cross",
            undefined,
            {
                shape: miniShapes["02"],
                isStatic: true,
            }
        );
        l1CrossLeft.setScale(window.devicePixelRatio);
        this.crossRightRotation.push(l1CrossLeft);
        const l1CrossRight = this.matter.add.sprite(
            canvasWidth - 18 * window.devicePixelRatio,
            startOffset,
            "02_cross",
            undefined,
            {
                shape: miniShapes["02"],
                isStatic: true,
            }
        );
        l1CrossRight.setScale(window.devicePixelRatio);
        this.crossLeftRotation.push(l1CrossRight);
        startOffset += 200 * window.devicePixelRatio;
        const l2CrossLeft = this.matter.add.sprite(
            126 * window.devicePixelRatio,
            startOffset,
            "02_cross",
            undefined,
            {
                shape: miniShapes["02"],
                isStatic: true,
            }
        );
        l2CrossLeft.setScale(window.devicePixelRatio);
        this.crossLeftRotation.push(l2CrossLeft);
        const l2CrossRight = this.matter.add.sprite(
            canvasWidth - 126 * window.devicePixelRatio,
            startOffset,
            "02_cross",
            undefined,
            {
                shape: miniShapes["02"],
                isStatic: true,
            }
        );
        l2CrossRight.setScale(window.devicePixelRatio);
        this.crossRightRotation.push(l2CrossRight);
        startOffset += 200 * window.devicePixelRatio;
        const l3CrossLeft = this.matter.add.sprite(
            18 * window.devicePixelRatio,
            startOffset,
            "02_cross",
            undefined,
            {
                shape: miniShapes["02"],
                isStatic: true,
            }
        );
        l3CrossLeft.setScale(window.devicePixelRatio);
        this.crossRightRotation.push(l3CrossLeft);
        const l3CrossRight = this.matter.add.sprite(
            canvasWidth - 18 * window.devicePixelRatio,
            startOffset,
            "02_cross",
            undefined,
            {
                shape: miniShapes["02"],
                isStatic: true,
            }
        );
        l3CrossRight.setScale(window.devicePixelRatio);
        this.crossLeftRotation.push(l3CrossRight);
        startOffset += 200 * window.devicePixelRatio;
        const l4CrossLeft = this.matter.add.sprite(
            126 * window.devicePixelRatio,
            startOffset,
            "02_cross",
            undefined,
            {
                shape: miniShapes["02"],
                isStatic: true,
            }
        );
        l4CrossLeft.setScale(window.devicePixelRatio);
        this.crossLeftRotation.push(l4CrossLeft);
        const l4CrossRight = this.matter.add.sprite(
            canvasWidth - 126 * window.devicePixelRatio,
            startOffset,
            "02_cross",
            undefined,
            {
                shape: miniShapes["02"],
                isStatic: true,
            }
        );
        l4CrossRight.setScale(window.devicePixelRatio);
        this.crossRightRotation.push(l4CrossRight);

        return startOffset + 500 * window.devicePixelRatio;
    };
    createSeesawScreen = (
        xOffset: number,
        startOffset: number,
        prodShapes: any,
        miniShapes: any,
        obstaclesShapes: any
    ) => {
        // const scaleFactor = this.cameras.main.width / 414;

        const baseSprite = this.matter.add
            .sprite(xOffset, startOffset, "prod_texture_loaded_06", undefined, {
                shape: prodShapes["06"],
                isStatic: true,
            })
            .setScale(
                window.devicePixelRatio * (this.canvasWidth / (512 - 100))
            );
        const yOffset = startOffset + baseSprite.height / 2;
        baseSprite.setPosition(xOffset, yOffset);
        const seesawX = xOffset - 2;
        // 132 for 414 width
        // 110 for 344 width
        // FOrumula (132/414)*width + 30
        const seesawContraintY = -(132 / 414) * this.canvasWidth;
        const seesawY = yOffset + seesawContraintY;
        const seesaw = this.matter.add
            .sprite(seesawX, seesawY, "06b", undefined, {
                shape: miniShapes["06b"],
                // isStatic: true,
            })
            .setScale(window.devicePixelRatio);
        const contraint = this.matter.constraint.create({
            bodyA: seesaw.body as BodyType,
            bodyB: baseSprite.body as BodyType,
            pointA: { x: 0, y: 0 },
            pointB: {
                x: -2,
                y: seesawContraintY * window.devicePixelRatio,
            },
            stiffness: 1,
            length: 0,
        });
        const randomObstaclePosition = _.sample([
            [this.centerX, seesawY - 200],
            [this.centerX - 100, seesawY],
            [this.centerX + 100, seesawY],
            [this.centerX, seesawY + 200],
            [this.centerX - 100, seesawY + 400],
            [this.centerX + 100, seesawY + 400],
        ]);

        const randomObstacle = _.sample(ObstacleNames);
        const target = this.matter.add
            .sprite(
                randomObstaclePosition[0],
                randomObstaclePosition[1],
                `obstacle_${randomObstacle}`,
                undefined,
                {
                    shape: obstaclesShapes[
                        randomObstacle as keyof typeof obstaclesShapes
                    ],
                    friction: 0,
                    frictionAir: 0,
                    frictionStatic: 0,
                }
            )
            .setScale(0.17);
        target.setInteractive();
        target.on("pointerdown", (e: any) => {
            this.handleDamage(target, e);
        });
        this.matter.world.add(contraint);
        this.createTextureMask(seesawX, seesawY, seesaw);
        this.createTextureMask(xOffset, yOffset, baseSprite);
        return startOffset + baseSprite.height * window.devicePixelRatio;
    };
    createCircleBlockers = (
        xOffset: number,
        startOffset: number,
        prodShapes: any
    ) => {
        const yOffset = startOffset + 833 / 2;
        const baseSprite = this.matter.add
            .sprite(xOffset, yOffset, "prod_texture_loaded_21", undefined, {
                shape: prodShapes["21"],
                isStatic: true,
            })
            .setScale(
                window.devicePixelRatio * (this.canvasWidth / (512 - 100))
            );
        this.createTextureMask(xOffset, yOffset, baseSprite);
        return startOffset + baseSprite.height * window.devicePixelRatio;
    };
    createStarRotations = (_startOffset: number, miniShapes: any) => {
        // TODO: Scale the sprite
        // Stars
        const barWidth = 0;
        let startOffset = _startOffset + 250;
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
                .sprite(
                    ((115 / 414) * this.canvasWidth + barWidth) *
                        window.devicePixelRatio,
                    startOffset,
                    "mini_star",
                    undefined,
                    {
                        shape: miniShapes["14"],
                        isStatic: true,
                    }
                )
                .setScale(
                    (1 / 414) * this.canvasWidth * window.devicePixelRatio
                )
                .setAngle(35)
        );

        this.rightRotatableStars.push(
            this.matter.add
                .sprite(
                    ((305 / 414) * this.canvasWidth + barWidth) *
                        window.devicePixelRatio,
                    startOffset,
                    "mini_star",
                    undefined,
                    {
                        shape: miniShapes["14"],
                        isStatic: true,
                    }
                )
                .setScale(
                    (1 / 414) * this.canvasWidth * window.devicePixelRatio
                )
        );
        // Second Row
        startOffset += 165 * window.devicePixelRatio;
        this.rightRotatableStars.push(
            this.matter.add
                .sprite(
                    ((10 / 414) * this.canvasWidth + barWidth) *
                        window.devicePixelRatio,
                    startOffset,
                    "mini_star",
                    undefined,
                    {
                        shape: miniShapes["14"],
                        isStatic: true,
                    }
                )
                .setScale(
                    (1 / 414) * this.canvasWidth * window.devicePixelRatio
                )
                .setAngle(5)
        );
        this.rightRotatableStars.push(
            this.matter.add
                .sprite(
                    ((206 / 414) * this.canvasWidth + barWidth) *
                        window.devicePixelRatio,
                    startOffset,
                    "mini_star",
                    undefined,
                    {
                        shape: miniShapes["14"],
                        isStatic: true,
                    }
                )
                .setScale(
                    (1 / 414) * this.canvasWidth * window.devicePixelRatio
                )
            // .setAngle()
        );
        this.leftRotatableStars.push(
            this.matter.add
                .sprite(
                    ((400 / 414) * this.canvasWidth + barWidth) *
                        window.devicePixelRatio,
                    startOffset,
                    "mini_star",
                    undefined,
                    {
                        shape: miniShapes["14"],
                        isStatic: true,
                    }
                )
                .setScale(window.devicePixelRatio)
                .setAngle(35)
        );
        // Third Row
        startOffset += 180 * window.devicePixelRatio;
        this.leftRotatableStars.push(
            this.matter.add
                .sprite(
                    ((115 / 414) * this.canvasWidth + barWidth) *
                        window.devicePixelRatio,
                    startOffset,
                    "mini_star",
                    undefined,
                    {
                        shape: miniShapes["14"],
                        isStatic: true,
                    }
                )
                .setScale(window.devicePixelRatio)
                .setAngle(30)
        );
        this.rightRotatableStars.push(
            this.matter.add
                .sprite(
                    ((305 / 414) * this.canvasWidth + barWidth) *
                        window.devicePixelRatio,
                    startOffset,
                    "mini_star",
                    undefined,
                    {
                        shape: miniShapes["14"],
                        isStatic: true,
                    }
                )
                .setScale(window.devicePixelRatio)
                .setAngle(5)
        );
        // Fourth Row
        startOffset += 160 * window.devicePixelRatio;
        this.rightRotatableStars.push(
            this.matter.add
                .sprite(
                    ((10 / 414) * this.canvasWidth + barWidth) *
                        window.devicePixelRatio,
                    startOffset,
                    "mini_star",
                    undefined,
                    {
                        shape: miniShapes["14"],
                        isStatic: true,
                    }
                )
                .setScale(window.devicePixelRatio)
                .setAngle(8)
        );
        this.leftRotatableStars.push(
            this.matter.add
                .sprite(
                    ((210 / 414) * this.canvasWidth + barWidth) *
                        window.devicePixelRatio,
                    startOffset,
                    "mini_star",
                    undefined,
                    {
                        shape: miniShapes["14"],
                        isStatic: true,
                    }
                )
                .setScale(window.devicePixelRatio)
                .setAngle(30)
        );
        this.leftRotatableStars.push(
            this.matter.add
                .sprite(
                    ((400 / 414) * this.canvasWidth + barWidth) *
                        window.devicePixelRatio,
                    startOffset,
                    "mini_star",
                    undefined,
                    {
                        shape: miniShapes["14"],
                        isStatic: true,
                    }
                )
                .setScale(window.devicePixelRatio)
                .setAngle(35)
        );
        return startOffset + 500 * window.devicePixelRatio;
    };

    createStaticTriangles = (
        xOffset: number,
        startOffset: number,
        prodShapes: any,
        obstaclesShapes: any
    ) => {
        const yOffset = startOffset + 833 / 2;
        const baseSprite = this.matter.add
            .sprite(xOffset, yOffset, "prod_texture_loaded_03", undefined, {
                shape: prodShapes["03"],
                isStatic: true,
            })
            .setScale(
                window.devicePixelRatio * (this.canvasWidth / (512 - 100))
            );
        // baseSprite.setScale(
        //     (this.cameras.main.width / baseSprite.width) *
        //         window.devicePixelRatio
        // );
        this.createTextureMask(xOffset, yOffset, baseSprite);

        const randomObstaclePosition = _.sample([
            [100, startOffset],
            [350, startOffset],
            [this.centerX, startOffset + 200],
            [100, startOffset + 400],
            [400, startOffset + 400],
        ]);

        const randomObstacle = _.sample(ObstacleNames);
        const target = this.matter.add.sprite(
            randomObstaclePosition[0],
            randomObstaclePosition[1],
            `obstacle_${randomObstacle}`,
            undefined,
            {
                shape: obstaclesShapes[
                    randomObstacle as keyof typeof obstaclesShapes
                ],
                // angle: 124,
                friction: 0,
                frictionAir: 0,
                frictionStatic: 0,
            }
        );
        target.setScale(this.marbleRadius / target.width);
        target.setInteractive();
        target.on("pointerdown", (e: any) => {
            this.handleDamage(target, e);
        });
        return startOffset + baseSprite.height * window.devicePixelRatio;
    };

    createReduceSizeSlider = (
        xOffset: number,
        startOffset: number,
        prodShapes: any
    ) => {
        this.reduceSizeScreenOffset.push(startOffset - 400);
        const yOffset = startOffset + 833 / 2;
        const baseSprite = this.matter.add
            .sprite(
                xOffset + 3.5,
                yOffset,
                "prod_texture_loaded_16",
                undefined,
                {
                    shape: prodShapes["16"],
                    isStatic: true,
                }
            )
            .setScale(
                window.devicePixelRatio * (this.canvasWidth / (512 - 100))
            );
        // .setScale(this.cameras.main.width / 414);
        this.createTextureMask(xOffset, yOffset, baseSprite);
        startOffset += baseSprite.height * window.devicePixelRatio;
        this.increaseSizeScreenOffset.push(startOffset);
        startOffset += 300;
        return startOffset;
    };
    createStopperSlider = (
        xOffset: number,
        startOffset: number,
        prodShapes: any
    ) => {
        // TODO: Scale the sprite
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
        // .setScale(this.cameras.main.width / 414);
        // Motion parts
        this.upDownMotionElems.push(
            {
                matter: this.matter.add
                    .image(318, startOffset + 122, "left_block", undefined, {
                        isStatic: true,
                    })
                    .setScale(0.18, 0.18),
                startX: 315,
                startY: startOffset + 122,
                maxTop: 1,
                maxBottom: 38,
                moveSpeed: 0.1,
                direction: "right",
            }
            // .setAngle(7.1)
        );
        this.upDownMotionElems.push(
            {
                matter: this.matter.add
                    .image(102.8, startOffset + 275, "right_block", undefined, {
                        isStatic: true,
                    })
                    .setScale(0.18, 0.18),
                startX: 102.8,
                startY: startOffset + 275,
                maxTop: 1,
                maxBottom: 28,
                moveSpeed: 0.2,
                direction: "left",
            }
            // .setAngle(7.1)
        );
        this.upDownMotionElems.push(
            {
                matter: this.matter.add
                    .image(314, startOffset + 418, "left_block", undefined, {
                        isStatic: true,
                    })
                    .setScale(0.18, 0.18),
                startX: 314,
                startY: startOffset + 418,
                maxTop: 15,
                maxBottom: -18,
                moveSpeed: 0.15,
                direction: "right",
            }
            // .setAngle(7.1)
        );
        this.upDownMotionElems.push(
            {
                matter: this.matter.add
                    .image(102.8, startOffset + 568, "right_block", undefined, {
                        isStatic: true,
                    })
                    .setScale(0.18, 0.18),
                startX: 102.8,
                startY: startOffset + 568,
                maxTop: 1,
                maxBottom: 28,
                moveSpeed: 0.18,
                direction: "left",
            }
            // .setAngle(7.1)
        );
        this.upDownMotionElems.push(
            {
                matter: this.matter.add
                    .image(314, startOffset + 713, "left_block", undefined, {
                        isStatic: true,
                    })
                    .setScale(0.18, 0.18),
                startX: 314,
                startY: startOffset + 713,
                maxTop: 1,
                maxBottom: 28,
                moveSpeed: 0.1,
                direction: "right",
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
        prodShapes: any,
        obstaclesShapes: any
    ) => {
        const baseSprite = this.matter.add
            .sprite(xOffset, startOffset, "prod_texture_loaded_01", undefined, {
                shape: prodShapes["01"],
                isStatic: true,
            })
            .setScale(
                window.devicePixelRatio * (this.canvasWidth / (512 - 100))
            );
        const yOffset = startOffset + baseSprite.height / 2;
        baseSprite.setPosition(baseSprite.x, yOffset);
        this.createTextureMask(xOffset, yOffset, baseSprite);
        const randomObstaclePosition = _.sample([
            [150, startOffset],
            [350, startOffset],
            [150, startOffset + 300],
            [this.centerX, startOffset + 200],
            [390, startOffset + 200],
            [150, startOffset + 400],
            [350, startOffset + 400],
            [this.centerX, startOffset + 600],
        ]);
        const randomObstacle = _.sample(ObstacleNames);
        const target = this.matter.add.sprite(
            randomObstaclePosition[0],
            randomObstaclePosition[1],
            `obstacle_${randomObstacle}`,
            undefined,
            {
                shape: obstaclesShapes[
                    randomObstacle as keyof typeof obstaclesShapes
                ],
                // angle: 124,
                friction: 0,
                frictionAir: 0,
                frictionStatic: 0,
                // ignoreGravity: true,
            }
        );
        target.setScale(this.marbleRadius / target.width);
        target.setInteractive();
        target.on("pointerdown", (e: any) => {
            this.handleDamage(target, e);
        });

        return startOffset + baseSprite.height * window.devicePixelRatio;
    };
    createZigzagSlider = (
        xOffset: number,
        startOffset: number,
        prodShapes: any,
        obstaclesShapes: any
    ) => {
        const baseSprite = this.matter.add.sprite(
            xOffset,
            startOffset,
            "prod_texture_loaded_07",
            undefined,
            {
                shape: prodShapes["07"],
                isStatic: true,
            }
        );
        baseSprite.setPosition(
            baseSprite.x,
            startOffset + baseSprite.height / 2
        );
        baseSprite.setScale(
            window.devicePixelRatio * (this.canvasWidth / (512 - 100))
        );
        this.createTextureMask(
            xOffset,
            startOffset + baseSprite.height / 2,
            baseSprite
        );
        const randomObstaclePosition = _.sample([
            [150, startOffset],
            [350, startOffset],
            [150, startOffset + 200],
            [350, startOffset + 200],
            [150, startOffset + 400],
            [350, startOffset + 400],
        ]);
        const randomObstacle = _.sample(ObstacleNames);
        const target = this.matter.add
            .sprite(
                randomObstaclePosition[0],
                randomObstaclePosition[1],
                `obstacle_${randomObstacle}`,
                undefined,
                {
                    shape: obstaclesShapes[
                        randomObstacle as keyof typeof obstaclesShapes
                    ],
                    // angle: 124,
                    friction: 0,
                    frictionAir: 0,
                    frictionStatic: 0,
                }
            )
            .setScale(0.17);
        target.setInteractive();
        target.on("pointerdown", (e: any) => {
            this.handleDamage(target, e);
        });

        return startOffset + baseSprite.height * window.devicePixelRatio;
    };
    createMarbles = (marbleRadius: number, miniShapes: any) => {
        this.largeCircle = this.matter.add.sprite(
            this.centerX,
            this.centerY - 100,
            "wheel",
            undefined,
            {
                shape: miniShapes["wheel"],
                isStatic: true,
                frictionStatic: 1,
                friction: 1,
            }
        );
        // For Testing
        // this.largeCircle.setScale(0.1);
        // this.isRotating = false;
        this.largeCircle.setScale(
            (this.canvasWidth / this.largeCircle.width) *
                window.devicePixelRatio
        );
        // .setScale(0.8);
        const xOffsetValues = [
            this.centerX - 46,
            this.centerX + 23,
            this.centerX,
            this.centerX + 23,
            this.centerX + 46,
        ];
        this.voices.map((v, i) => {
            this.currentMarblesSizeIndices[i.toString()] = 0;
            // const angle = i * this.angleIncrement;
            // const x = this.centerX + this.radius * Math.cos(angle);
            // const y = this.centerY + this.radius * Math.sin(angle);
            const circleBody = this.matter.add.circle(
                xOffsetValues[i],
                this.centerY,
                marbleRadius,
                {
                    restitution: 0.4,
                    // density: 0.02,
                    friction: 0,
                    frictionAir: 0,
                    frictionStatic: 0,
                    // Add colors
                    render: {
                        fillColor: 0xff0000,
                    },
                }
            );
            this.marbles.push(circleBody);

            this.marbleTrailParticles.push(
                this.add.particles(0, 0, "trail", {
                    ...this.trailConfig,
                    follow: circleBody.position,
                })
            );

            // circleBody.emitter = emitter;
            // this.trailsGroup.push(this.add.group());
            // this.trailGraphics.push(this.add.graphics());
            // this.trailPoints.push([]);
            // // Create an image and attach it to the circle body
            const circleImage = this.add.image(
                circleBody.position.x,
                circleBody.position.y,
                `resized_${v.id}`
            );
            circleImage.setDisplaySize(marbleRadius * 2, marbleRadius * 2);
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
                circleImage.y - 560,
                this.voices[i].name,
                {
                    fontSize: "32px",
                    color: "#ffffff",
                    stroke: "#000",
                    strokeThickness: 4,
                }
            );
            label.setDepth(1);
            this.labels.push(label);
        });
        this.countdownText = this.add
            .text(this.centerX, this.centerY - 100, "3", {
                fontSize: `${64 * window.devicePixelRatio}px`,
                color: "#ffffff",
            })
            .setOrigin(0.5);
    };
    createHorizontalCrosses = (
        canvasWidth: number,
        _startOffset: number,
        miniShapes: any
    ) => {
        this.reduceSizeScreenOffset.push(_startOffset - 300);
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
                    .setScale(
                        (0.8 / 414) * this.canvasWidth * window.devicePixelRatio
                    )
            );
            leftOffset +=
                (80 / 414) * this.canvasWidth * window.devicePixelRatio;
        });
        startOffset += (250 / 414) * this.canvasWidth * window.devicePixelRatio;
        new Array(5).fill("").map(() => {
            this.horizontalCrossLeftRotation.push(
                this.matter.add
                    .sprite(rightOffset, startOffset, "02_cross", undefined, {
                        shape: miniShapes["02"],
                        isStatic: true,
                    })
                    .setScale(
                        (0.8 / 414) * this.canvasWidth * window.devicePixelRatio
                    )
            );
            rightOffset -=
                (80 / 414) * this.canvasWidth * window.devicePixelRatio;
        });
        leftOffset = 20;
        startOffset += (250 / 414) * this.canvasWidth * window.devicePixelRatio;
        new Array(5).fill("").map(() => {
            this.horizontalCrossRightRotation.push(
                this.matter.add
                    .sprite(leftOffset, startOffset, "02_cross", undefined, {
                        shape: miniShapes["02"],
                        isStatic: true,
                    })
                    .setScale(
                        (0.8 / 414) * this.canvasWidth * window.devicePixelRatio
                    )
            );
            leftOffset +=
                (80 / 414) * this.canvasWidth * window.devicePixelRatio;
        });
        rightOffset = canvasWidth - 20;
        startOffset += (250 / 414) * this.canvasWidth * window.devicePixelRatio;
        new Array(5).fill("").map(() => {
            this.horizontalCrossLeftRotation.push(
                this.matter.add
                    .sprite(rightOffset, startOffset, "02_cross", undefined, {
                        shape: miniShapes["02"],
                        isStatic: true,
                    })
                    .setScale(
                        (0.8 / 414) * this.canvasWidth * window.devicePixelRatio
                    )
            );
            rightOffset -=
                (80 / 414) * this.canvasWidth * window.devicePixelRatio;
        });
        this.increaseSizeScreenOffset.push(startOffset);
        return startOffset + 500 * window.devicePixelRatio;
    };
    // createTrails = (voiceSprite: MatterJS.BodyType, i: number) => {
    //     const velocity = Math.sqrt(
    //         voiceSprite.velocity.x ** 2 + voiceSprite.velocity.y ** 2
    //     );
    //     // If velocity is zero, do not draw the trail
    //     if (velocity > 0) {
    //         // Calculate the position directly behind the circle relative to its velocity vector
    //         // const offsetX = (-voiceSprite.velocity.x / velocity) * 23;
    //         // const offsetY = (-voiceSprite.velocity.y / velocity) * 23;
    //         const trailX = voiceSprite.position.x;
    //         const trailY = voiceSprite.position.y;
    //         //     // Calculate the angle of the trail image
    //         const angle =
    //             Math.atan2(voiceSprite.velocity.y, voiceSprite.velocity.x) *
    //             (180 / Math.PI);
    //         // Add the current trail position to the trail points array
    //         this.trailPoints[i].push({
    //             x: trailX,
    //             y: trailY,
    //             angle,
    //         });
    //         // Adjust trail length based on velocity
    //         this.trailLength = Phaser.Math.Clamp(
    //             velocity * 2,
    //             10,
    //             this.isRotating ? 20 : 100
    //         );
    //         // Limit the number of points in the trail to the trail length
    //         if (this.trailPoints[i].length > this.trailLength) {
    //             this.trailPoints[i].shift();
    //         }
    //         // Clear the previous trail
    //         this.trailGraphics[i].clear();
    //         //     this.trailsGroup[i].clear(true, true);
    //         //     // Draw the trail
    //         for (let j = 0; j < this.trailPoints[i].length; j++) {
    //             const point = this.trailPoints[i][j];
    //             const alpha = (j + 0.01) / this.trailPoints[i].length; // Gradually decrease alpha
    //             this.trailGraphics[i].fillStyle(0x0cffffff, alpha * 0.2);
    //             // this.trailGraphics.fillCircle(point.x, point.y, 20);
    //             const trailRadius = this.heightReducedIndices.includes(i)
    //                 ? 11
    //                 : 22;
    //             this.trailGraphics[i].fillRoundedRect(
    //                 point.x - trailRadius,
    //                 point.y - trailRadius,
    //                 trailRadius * 2,
    //                 trailRadius * 2,
    //                 trailRadius
    //             );
    //             // .setAngle(point.angle);
    //         }
    //     } else {
    //         // Clear the trail if velocity is zero
    //         this.trailGraphics[i].clear();
    //         // this.trailsGroup[i].clear(true, true);
    //     }
    // };

    renderWeapons() {
        this.level1Hammer = this.add
            .sprite(350, 550, "hammer_1")
            .setScale(0.1)
            .setScrollFactor(0)
            .setInteractive()
            .on("pointerdown", () => {
                this.damageMultipliyer = 1;
            });

        this.level2Hammer = this.add
            .sprite(350, 630, "hammer_2")
            .setScale(0.1)
            .setScrollFactor(0)
            .setInteractive()
            .on("pointerdown", () => {
                this.damageMultipliyer = 1.5;
            });

        // w.setPosition(w.x - w.width, w.y - w.height);

        // .setScrollFactor(0);
    }

    create() {
        console.log("Game Scene...");
        // Center the background image
        const centerX = this.cameras.main.width / 2;
        if (!this.enableMotion) {
            const centerY = this.cameras.main.height / 2;
            const bg = this.add
                .image(centerX, centerY, "background")
                .setScrollFactor(0);
            bg.setDisplaySize(
                this.cameras.main.width,
                this.cameras.main.height
            );
        } else {
            // this.background = this.add.image(0, 0, "background");

            // // Set the origin to the top-left corner
            // this.background.setOrigin(0, 0);

            // // Scale the background image to fit the game width
            // let scaleX = this.cameras.main.width / this.background.width;
            // let scaleY = this.cameras.main.height / this.background.height;
            // let scale = Math.max(scaleX, scaleY);
            // this.background.setScale(scale).setScrollFactor(0);
            this.background = this.add
                .tileSprite(0, 0, 0, 0, "background")
                .setScrollFactor(0)
                .setOrigin(0, 0);
            this.background.setScale(
                (414 / this.background.width) * window.devicePixelRatio,
                (736 / this.background.height) * window.devicePixelRatio
            );
            this.add
                .image(this.centerX, this.centerY, "center_logo")
                .setDisplaySize(254, 84)
                .setScrollFactor(0);
        }
        const siteUrl = this.add
            .text(this.centerX, this.centerY + 100, "marblerace.ai", {
                fontSize: "28px",
                color: "#ffffff",
                stroke: "rgba(0,0,0,1)",
                strokeThickness: 4,
            })
            .setScrollFactor(0);
        siteUrl.setPosition(siteUrl.x - siteUrl.width / 2, this.centerY + 50);
        // Enable camera scrolling
        const canvasWidth = this.cameras.main.width;

        var prodShapes = this.cache.json.get("prod_shapes");
        var miniShapes = this.cache.json.get("mini_shapes");
        var obstaclesShapes = this.cache.json.get("obstacles_shapes");

        let startOffset = 800 * window.devicePixelRatio;
        const xOffset = this.centerX;
        // this.selectedTracks = ["06", "07", "03", "01", "16"];
        this.selectedTracks.map((trackNo) => {
            switch (trackNo) {
                case "01":
                    startOffset = this.createStaticCircles(
                        xOffset,
                        startOffset,
                        prodShapes,
                        obstaclesShapes
                    );
                    break;
                case "02":
                    startOffset = this.createCrossScreen(
                        startOffset,
                        canvasWidth,
                        miniShapes
                    );
                    break;
                case "03":
                    startOffset = this.createStaticTriangles(
                        xOffset,
                        startOffset,
                        prodShapes,
                        obstaclesShapes
                    );
                    break;
                case "06":
                    startOffset = this.createSeesawScreen(
                        xOffset,
                        startOffset,
                        prodShapes,
                        miniShapes,
                        obstaclesShapes
                    );
                    break;
                case "07":
                    startOffset = this.createZigzagSlider(
                        xOffset,
                        startOffset,
                        prodShapes,
                        obstaclesShapes
                    );
                    break;
                case "11":
                    startOffset = this.createStopperSlider(
                        xOffset,
                        startOffset,
                        prodShapes
                    );
                    break;
                case "14":
                    startOffset = this.createStarRotations(
                        startOffset,
                        miniShapes
                    );
                    break;
                case "16":
                    startOffset = this.createReduceSizeSlider(
                        xOffset,
                        startOffset,
                        prodShapes
                    );
                    break;
                case "21":
                    startOffset = this.createCircleBlockers(
                        xOffset,
                        startOffset,
                        prodShapes
                    );
                    break;
                case "22":
                    startOffset = this.createHorizontalCrosses(
                        canvasWidth,
                        startOffset,
                        miniShapes
                    );
                    break;
            }
        });
        const finishOffset = startOffset + 250;
        this.add.image(centerX, finishOffset, "finish_line").setScale(0.5);
        // finishLineImage.setScale(
        //     (this.canvasWidth / finishLineImage.width) *
        //         window.devicePixelRatio,
        //     window.devicePixelRatio
        // );
        // .setScale(window.devicePixelRatio);
        this.finishLineOffset = finishOffset;
        // // .setDisplaySize(960, 40);
        this.cameras.main.setBounds(
            0,
            0,
            this.cameras.main.width,
            finishOffset + 250
        );
        this.matter.world.setBounds(
            0,
            0,
            this.cameras.main.width,
            finishOffset + 800
        );

        this.createMarbles(this.marbleRadius, miniShapes);
        this.crossLeftRotation.map((baseSprite) =>
            this.createTextureMask(baseSprite.x, baseSprite.y, baseSprite)
        );
        this.crossRightRotation.map((baseSprite) =>
            this.createTextureMask(baseSprite.x, baseSprite.y, baseSprite)
        );
        [...this.leftRotatableStars, ...this.rightRotatableStars].map(
            (baseSprite) =>
                this.createTextureMask(baseSprite.x, baseSprite.y, baseSprite)
        );
        [
            ...this.horizontalCrossLeftRotation,
            ...this.horizontalCrossRightRotation,
        ].map((baseSprite) =>
            this.createTextureMask(baseSprite.x, baseSprite.y, baseSprite)
        );

        let coundownValue = 3;
        // Start Countdown:
        this.time.addEvent({
            delay: 1000,
            repeat: 2,
            callback: () => {
                if (this.countdownText) {
                    coundownValue--;
                    if (coundownValue > 0) {
                        this.countdownText.setText(coundownValue.toString());
                    } else {
                        this.countdownText.setText("Go!");
                        console.log("Go!");
                        // remove the large circle
                        if (this.largeCircle?.body) {
                            this.matter.world.remove(
                                this.largeCircle.body,
                                true
                            );
                            this.largeCircle.destroy();
                            //     this.matter.world.remove(this.largeCircle);
                        }
                        this.isRotating = false;
                        this.countdownText.destroy();
                    }
                }
            },
        });
        marbleRaceOnlyInstrument(
            this.coverDocId,
            120,
            this.musicStartOffset
        ).then(() => (this.isInstrumentPlaying = true));

        // this.renderWeapons();
    }
    update(time: number, delta: number): void {
        // if (this.damageMultipliyer === 1) {
        //     // Highlight level 1 hammer
        //     this.level2Hammer?.setScale(0.1);
        //     this.level1Hammer?.setScale(0.2);
        // } else if (this.damageMultipliyer === 1.5) {
        //     // Highlight level 2 hammer
        //     this.level1Hammer?.setScale(0.1);
        //     this.level2Hammer?.setScale(0.2);
        // }
        // if (this.enableMotion && !this.isRotating)
        //     this.background.tilePositionX += 0.08;
        if (this.marbles.length) {
            if (this.isRotating) {
                // Update the base angle to create the circular motion
                this.baseAngle += 0.01; // Adjust this value to change the speed of rotation
                this.largeCircle?.setRotation(this.baseAngle);
                this.matter.body.setAngularVelocity(
                    this.largeCircle?.body as BodyType,
                    0.15
                );
            }
            this.marbles.map((voiceBody, i) => {
                const marbleImage = this.marblesImages[i];
                // if (this.isRotating) {
                //     // // Update the position of each circle
                //     // const currentAngle =
                //     //     this.baseAngle + i * this.angleIncrement;
                //     // const x =
                //     //     this.centerX + this.radius * Math.cos(currentAngle);
                //     // const y =
                //     //     this.centerY + this.radius * Math.sin(currentAngle);
                //     // // Set the new position of the circle
                //     // this.matter.body.setPosition(voiceBody, { x, y }, false);
                //     // // this.matter.body.setAngle(voiceBody, currentAngle, false);
                //     // marbleImage.setPosition(x, y);
                //     // // marbleImage.setRotation(voiceBody.angle);
                //     // this.marblesMasks[i].setPosition(
                //     //     voiceBody.position.x - voiceBody.circleRadius,
                //     //     voiceBody.position.y - voiceBody.circleRadius
                //     // );
                //     // this.labels[i].setPosition(-100, -100);
                // } else {
                if (marbleImage) {
                    marbleImage.setPosition(
                        voiceBody.position.x,
                        voiceBody.position.y
                    );
                    marbleImage.setRotation(voiceBody.angle);
                }
                if (this.marblesMasks[i])
                    this.marblesMasks[i].setPosition(
                        voiceBody.position.x - voiceBody.circleRadius,
                        voiceBody.position.y - voiceBody.circleRadius
                    );
                // this.marblesMasks[i].setRotation(voiceBody.angle);
                this.labels[i]?.setPosition(
                    voiceBody.position.x - this.labels[i].width / 2,
                    voiceBody.position.y - 60
                );
                const currentCrossIndex =
                    this.currentMarblesSizeIndices[i.toString()];

                if (
                    this.heightReducedIndices.includes(i) &&
                    voiceBody.position.y >
                        this.increaseSizeScreenOffset[currentCrossIndex]
                ) {
                    this.currentMarblesSizeIndices[i.toString()] += 1;
                    this.matter.body.scale(voiceBody, 2, 2);
                    marbleImage?.setDisplaySize(
                        this.marbleRadius * 2,
                        this.marbleRadius * 2
                    );
                    if (this.marblesMasks[i]) this.marblesMasks[i].scale = 1;
                    this.heightReducedIndices =
                        this.heightReducedIndices.filter((idx) => idx !== i);
                    this.marbleTrailParticles[i].setConfig(this.trailConfig);
                } else if (
                    this.heightReducedIndices.includes(i) === false &&
                    voiceBody.position.y >
                        this.reduceSizeScreenOffset[currentCrossIndex] &&
                    voiceBody.position.y <
                        this.increaseSizeScreenOffset[currentCrossIndex]
                ) {
                    this.heightReducedIndices.push(i);
                    this.matter.body.scale(voiceBody, 0.5, 0.5);
                    marbleImage?.setDisplaySize(
                        this.marbleRadius,
                        this.marbleRadius
                    );
                    if (this.marblesMasks[i]) this.marblesMasks[i].scale = 0.5;
                    this.marbleTrailParticles[i].setConfig({
                        ...this.trailConfig,
                        scale: { start: 0.5, end: 0.01 },
                    });
                }
                // }
                // this.createTrails(voiceBody, i);
            });
        }
        this.crossRightRotation.map((c) => {
            c.setAngle(c.angle + 2);
            this.matter.body.setAngularVelocity(c.body as BodyType, 0.05);
        });
        this.crossLeftRotation.map((c) => {
            c.setAngle(c.angle - 2);
            this.matter.body.setAngularVelocity(c.body as BodyType, 0.05);
        });
        if (this.isInstrumentPlaying && this.isRotating === false) {
            const voicesPositions = this.marbles.map((m) => m.position.y);
            const unFinishedPositions = voicesPositions.filter(
                (y) => y < this.finishLineOffset
            );
            const largest = Math.max(...unFinishedPositions);
            const secondLargest = Math.max(
                ...unFinishedPositions.filter((p) => p !== largest)
            );
            const index = voicesPositions.findIndex((v) => v === largest);
            // if (largest > this.finishLineOffset) {
            //     // Find 2nd largest
            //     index = voicesPositions.indexOf(
            //         voicesPositions
            //             .filter((v) => v !== largest)
            //             .reduce((a, b) => (a > b ? a : b))
            //     );
            // }
            if (index === -1) return;
            if (
                this.prevVoiceIdx !== index &&
                largest > secondLargest + this.marbleRadius
            )
                this.throttledUpdate(index);
            if (this.autoScroll) {
                this.cameras.main.scrollY = largest - 300;
            }
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
            ({
                matter,
                startX,
                startY,
                moveSpeed,
                maxBottom,
                maxTop,
                direction,
            }) => {
                const amplitude = (maxBottom - maxTop) / 2;
                const offset = amplitude * Math.sin(time * (moveSpeed * 0.01));
                // // Calculate new y position using a sine wave for smooth up and down movement
                // const range = maxBottom - maxTop;
                // const midPoint = maxTop + range / 2;
                // Calculate the new position considering the angle
                if (direction === "right") {
                    const newX =
                        startX + offset * Math.sin(Phaser.Math.DegToRad(7.1));
                    const newY =
                        startY - offset * Math.cos(Phaser.Math.DegToRad(7.1));
                    // Update the rectangle's y position using a sine wave
                    matter.setPosition(newX, newY);
                } else {
                    const newX =
                        startX + offset * Math.sin(Phaser.Math.DegToRad(-7.1));
                    const newY =
                        startY - offset * Math.cos(Phaser.Math.DegToRad(-7.1));
                    // Update the rectangle's y position using a sine wave
                    matter.setPosition(newX, newY);
                }
            }
        );
    }
}


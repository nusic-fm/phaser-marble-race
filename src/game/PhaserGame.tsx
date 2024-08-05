import { forwardRef, useLayoutEffect, useRef } from "react";
import StartGame from "./main";
import { GameVoiceInfo } from "./scenes/Preloader";

export interface IRefPhaserGame {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

export interface IGameDataParams {
    voices: GameVoiceInfo[];
    coverDocId: string;
    musicStartOffset: number;
    skinPath: string;
    backgroundPath: string;
    selectedTracks: string[];
    noOfRaceTracks: number;
    gravityY: number;
    width: number;
    enableMotion: boolean;
    trailPath: string;
}

interface IProps extends IGameDataParams {
    currentActiveScene?: (scene_instance: Phaser.Scene) => void;
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(
    function PhaserGame(
        {
            voices,
            coverDocId,
            musicStartOffset,
            skinPath,
            backgroundPath,
            selectedTracks,
            noOfRaceTracks,
            gravityY,
            width,
            enableMotion,
            trailPath,
        },
        ref
    ) {
        const game = useRef<Phaser.Game | null>(null!);

        useLayoutEffect(() => {
            if (game.current === null) {
                game.current = StartGame("game-container", {
                    voices,
                    coverDocId,
                    musicStartOffset,
                    skinPath,
                    backgroundPath,
                    selectedTracks,
                    noOfRaceTracks,
                    gravityY,
                    width,
                    enableMotion,
                    trailPath,
                });

                if (typeof ref === "function") {
                    ref({ game: game.current, scene: null });
                } else if (ref) {
                    ref.current = { game: game.current, scene: null };
                }
            }

            return () => {
                if (game.current) {
                    game.current.destroy(true);
                    if (game.current !== null) {
                        game.current = null;
                    }
                }
            };
        }, [ref]);

        return <div id="game-container" style={{ height: "100%" }}></div>;
    }
);


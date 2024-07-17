import { forwardRef, useLayoutEffect, useRef } from "react";
import StartGame from "./main";
import { GameVoiceInfo } from "./scenes/Preloader";

export interface IRefPhaserGame {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

interface IProps {
    voices: GameVoiceInfo[];
    coverDocId: string;
    currentActiveScene?: (scene_instance: Phaser.Scene) => void;
    musicStartOffset: number;
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(
    function PhaserGame({ voices, coverDocId, musicStartOffset }, ref) {
        const game = useRef<Phaser.Game | null>(null!);

        useLayoutEffect(() => {
            if (game.current === null) {
                game.current = StartGame("game-container", {
                    voices,
                    coverDocId,
                    musicStartOffset,
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


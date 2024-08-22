import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import StartGame from "./main";
import { GameVoiceInfo } from "./scenes/Preloader";
import * as Tone from "tone";

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
    trailsLifeSpace: number;
    trailsOpacity: number;
    trailEndSize: number;
    recordDuration: number;
}

interface IProps extends IGameDataParams {
    currentActiveScene?: (scene_instance: Phaser.Scene) => void;
}
const downloadVideo = (videoUrl: string, name: string) => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `${name}.webm`; // Set the file name for download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

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
            trailsLifeSpace,
            trailsOpacity,
            trailEndSize,
            recordDuration,
        },
        ref
    ) {
        const game = useRef<Phaser.Game | null>(null!);
        const gameStarted = useRef<boolean>(true);

        const [mediaRecorder, setMediaRecorder] =
            useState<null | MediaRecorder>(null);
        const [isRecording, setIsRecording] = useState(false);

        const startRecording = (canvas: HTMLCanvasElement) => {
            // const canvas = canvasRef.current;
            const canvasStream = canvas.captureStream(120); // 30 FPS
            const audioCtx = Tone.getContext().rawContext;
            const dest = (audioCtx as any).createMediaStreamDestination();
            Tone.getDestination().connect(dest);
            const audioStream = dest.stream;

            // navigator.mediaDevices
            //     .getUserMedia({ audio: true })
            //     .then((micStream) => {
            // Combine the canvas video stream and the audio stream
            const combinedStream = new MediaStream([
                ...canvasStream.getTracks(),
                ...audioStream.getTracks(),
            ]);

            const recorder = new MediaRecorder(combinedStream, {
                mimeType: "video/webm; codecs=vp9,opus",
            });

            const chunks: Blob[] = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "video/webm" });
                downloadVideo(URL.createObjectURL(blob), coverDocId);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);

            setTimeout(() => {
                stopRecording(recorder);
            }, recordDuration * 1000);
        };

        const stopRecording = (recorder: MediaRecorder) => {
            recorder.stop();
            setIsRecording(false);
        };

        useLayoutEffect(() => {
            if (gameStarted.current === false) {
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
                    trailsLifeSpace,
                    trailsOpacity,
                    trailEndSize,
                    recordDuration,
                });

                if (typeof ref === "function") {
                    ref({ game: game.current, scene: null });
                } else if (ref) {
                    ref.current = { game: game.current, scene: null };
                }
                if (game.current) {
                    startRecording(game.current.canvas);
                }
            } else {
                gameStarted.current = false;
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


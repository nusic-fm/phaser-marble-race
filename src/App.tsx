import { Box, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Rows from "./components/Rows";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { downloadAudioFiles } from "./hooks/useTonejs";
import { CoverV1, getCoverDocById } from "./services/db/coversV1.service";
import {
    listAllTrackBackgrounds,
    listAllTrackSkins,
} from "./services/storage/marbleRace.service";

function App() {
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [ready, setReady] = useState(false);
    const [coverDoc, setCoverDoc] = useState<CoverV1 | null>(null);
    const [selectedCoverDocId, setSelectedCoverDocId] = useState<string>("");
    const [skinPaths, setSkinPaths] = useState<string[]>([]);
    const [bgPaths, setBgPaths] = useState<string[]>([]);
    const [selectedSkinPath, setSelectedSkinPath] = useState<string>("");
    const [selectedBackground, setSelectedBackground] = useState<string>("");

    const fetchCoverDoc = async (coverDocId: string) => {
        setIsDownloading(true);
        const coverDoc = await getCoverDocById(coverDocId);
        setCoverDoc(coverDoc);
        setSelectedCoverDocId(coverDocId);
        await downloadAudioFiles([
            `https://voxaudio.nusic.fm/covers/${coverDocId}/instrumental.mp3`,
            ...coverDoc.voices
                .slice(0, 8)
                .map((v) => v.id)
                .map(
                    (v) =>
                        `https://voxaudio.nusic.fm/covers/${coverDocId}/${v}.mp3`
                ),
        ]);
        setIsDownloading(false);
        setReady(true);
    };

    useEffect(() => {
        (async () => {
            const paths = await listAllTrackSkins();
            setSelectedSkinPath(paths[0]);
            setSkinPaths(paths);
        })();
        (async () => {
            const paths = await listAllTrackBackgrounds();
            setSelectedBackground(paths[0]);
            setBgPaths(paths);
        })();
    }, []);
    return (
        <Stack
            id="app"
            gap={2}
            sx={{ overflow: "hidden", width: "100%", height: "100vh" }}
        >
            <Header />
            <Box width={"100%"} display="flex" gap={2}>
                <Box height={`calc(100vh - 160px)`} flexBasis="40%">
                    <Rows onCoverSelection={fetchCoverDoc} />
                </Box>
                <Box
                    width={512 - 94}
                    height={"100%"}
                    borderLeft="1px solid #c3c3c3"
                    borderRight="1px solid #c3c3c3"
                    sx={{
                        background: `url(${selectedBackground})`,
                        backgroundPosition: "center",
                        borderRadius: 8,
                    }}
                >
                    {ready && coverDoc ? (
                        <PhaserGame
                            ref={phaserRef}
                            voices={coverDoc.voices.slice(0, 5).map((v) => ({
                                id: v.id,
                                name: v.name,
                                avatar: `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/${encodeURIComponent(
                                    "voice_models/avatars/thumbs/"
                                )}${v.id}_200x200?alt=media`,
                            }))}
                            coverDocId={selectedCoverDocId}
                            musicStartOffset={
                                coverDoc?.sections?.at(3)?.start || 20
                            }
                            skinPath={selectedSkinPath}
                            backgroundPath={selectedBackground}
                        />
                    ) : isDownloading ? (
                        <Typography
                            height={"100%"}
                            width={"100%"}
                            display="flex"
                            justifyContent={"center"}
                            py={8}
                        >
                            Preparing...
                        </Typography>
                    ) : (
                        <Typography
                            height={"100%"}
                            width={"100%"}
                            display="flex"
                            justifyContent={"center"}
                            py={8}
                        >
                            Select a cover to start
                        </Typography>
                    )}
                </Box>
                <Stack
                    flexBasis={`calc(60% - 406px)`}
                    justifyContent={"start"}
                    height="100%"
                    gap={2}
                >
                    <Typography align="center">Controls</Typography>
                    <Stack gap={1}>
                        <Typography>Choose a Skin</Typography>
                        <Stack direction="row" gap={2}>
                            {skinPaths.map((path) => (
                                <img
                                    key={path}
                                    src={path}
                                    alt={path}
                                    style={{
                                        width: 80,
                                        height: 140,
                                        borderRadius: 10,
                                        border:
                                            path === selectedSkinPath
                                                ? "2px solid #fff"
                                                : "none",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setSelectedSkinPath(path)}
                                />
                            ))}
                        </Stack>
                        <Typography>Choose a Background</Typography>
                        <Stack direction="row" gap={2}>
                            {bgPaths.map((path) => (
                                <img
                                    key={path}
                                    src={path}
                                    alt={path}
                                    style={{
                                        width: 80,
                                        height: 140,
                                        borderRadius: 10,
                                        border:
                                            path === selectedBackground
                                                ? "2px solid #fff"
                                                : "none",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setSelectedBackground(path)}
                                />
                            ))}
                        </Stack>
                    </Stack>
                </Stack>
            </Box>
        </Stack>
    );
}

export default App;


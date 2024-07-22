import { Box, Button, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Rows from "./components/Rows";
import SelectTracks from "./components/SelectTracks";
import SelectVoices from "./components/SelectVoices";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { GameVoiceInfo } from "./game/scenes/Preloader";
import { downloadAudioFiles } from "./hooks/useTonejs";
import { CoverV1 } from "./services/db/coversV1.service";
import {
    listAllTrackBackgrounds,
    listAllTrackSkins,
} from "./services/storage/marbleRace.service";

export const tracks = ["01", "02", "03", "06", "07", "11", "14", "16", "21"];

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
    const [selectedTracksList, setSelectedTracksList] = useState<string[]>(
        () => {
            // Check in the localstorage if there are selected tracks
            const localTracks = localStorage.getItem("selectedTracks");
            if (localTracks) {
                return JSON.parse(localTracks);
            }
            return tracks?.slice(0, 10);
        }
    );
    const [selectedVoices, setSelectedVoices] = useState<{
        [key: string]: GameVoiceInfo;
    }>({});

    const fetchCoverDoc = async (coverDocId: string, _coverDoc: CoverV1) => {
        setCoverDoc(_coverDoc);
        setSelectedCoverDocId(coverDocId);
        const _selectedVoices: { [key: string]: GameVoiceInfo } = {};
        _coverDoc.voices.slice(0, 5).map(
            (v, i) =>
                (_selectedVoices[i] = {
                    id: v.id,
                    name: v.name,
                    avatar: `https://voxaudio.nusic.fm/${encodeURIComponent(
                        "voice_models/avatars/thumbs/"
                    )}${v.id}_200x200?alt=media`,
                })
        );
        setSelectedVoices(_selectedVoices);
    };

    const downloadAndPlay = async () => {
        if (isDownloading) return;
        if (selectedTracksList.length === 0) return alert("Select tracks");
        if (coverDoc && selectedCoverDocId) {
            setIsDownloading(true);
            await downloadAudioFiles([
                `https://voxaudio.nusic.fm/covers/${selectedCoverDocId}/instrumental.mp3`,
                ...Object.values(selectedVoices)
                    .map((v) => v.id)
                    .map(
                        (v) =>
                            `https://voxaudio.nusic.fm/covers/${selectedCoverDocId}/${v}.mp3`
                    ),
            ]);
            setIsDownloading(false);
            setReady(true);
        }
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
                            voices={Object.values(selectedVoices)}
                            coverDocId={selectedCoverDocId}
                            musicStartOffset={
                                coverDoc?.sections?.at(3)?.start || 20
                            }
                            skinPath={selectedSkinPath}
                            backgroundPath={selectedBackground}
                            selectedTracks={selectedTracksList}
                        />
                    ) : (
                        <Stack alignItems={"center"} py={8} gap={4}>
                            <Typography
                                height={"100%"}
                                width={"100%"}
                                display="flex"
                                justifyContent={"center"}
                                variant="h6"
                                align="center"
                            >
                                {coverDoc
                                    ? coverDoc.title
                                    : "Select a cover to start"}
                            </Typography>
                            {coverDoc && (
                                <Button
                                    onClick={downloadAndPlay}
                                    variant="contained"
                                    color="primary"
                                >
                                    {isDownloading ? "Preparing" : "Play"}
                                </Button>
                            )}
                        </Stack>
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
                        {coverDoc && (
                            <SelectVoices
                                selectedVoices={selectedVoices}
                                setSelectedVoices={setSelectedVoices}
                                voices={coverDoc.voices}
                            />
                        )}
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
                                        outline:
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
                                        outline:
                                            path === selectedBackground
                                                ? "2px solid #fff"
                                                : "none",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setSelectedBackground(path)}
                                />
                            ))}
                        </Stack>
                        <SelectTracks
                            setSelectedTracksList={setSelectedTracksList}
                            selectedTracksList={selectedTracksList}
                        />
                    </Stack>
                </Stack>
            </Box>
        </Stack>
    );
}

export default App;


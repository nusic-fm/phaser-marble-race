import { Box, Button, Slider, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import LinearProgressWithLabel from "./components/LinearProgressWithLabel";
import Rows from "./components/Rows";
import SelectTracks from "./components/SelectTracks";
import SelectVoices from "./components/SelectVoices";
import { canvasElemWidth } from "./game/main";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { GameVoiceInfo } from "./game/scenes/Preloader";
import { downloadAudioFiles, stopAndDestroyPlayers } from "./hooks/useTonejs";
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
                const arr = JSON.parse(localTracks);
                // unique array
                return [...new Set(arr)] as string[];
            }
            return tracks?.slice(0, 10);
        }
    );
    const [selectedVoices, setSelectedVoices] = useState<{
        [key: string]: GameVoiceInfo;
    }>({});
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [startSectionIdx, setStartSectionIdx] = useState(3);
    const [noOfRaceTracks, setNoOfRaceTracks] = useState(6);

    const fetchCoverDoc = async (coverDocId: string, _coverDoc: CoverV1) => {
        if (ready) {
            // ask yes or no question
            const quite = window.confirm(
                "Are you sure you want to change the cover? The current game will be quit."
            );

            if (quite) {
                stopAndDestroyPlayers();
                setDownloadProgress(0);
                phaserRef.current?.game?.destroy(true);
                setReady(false);
            } else {
                return;
            }
        }
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
            await downloadAudioFiles(
                [
                    `https://voxaudio.nusic.fm/covers/${selectedCoverDocId}/instrumental.mp3`,
                    ...Object.values(selectedVoices)
                        .map((v) => v.id)
                        .map(
                            (v) =>
                                `https://voxaudio.nusic.fm/covers/${selectedCoverDocId}/${v}.mp3`
                        ),
                ],
                (progress: number) => {
                    console.log("progress", progress);
                    setDownloadProgress(progress);
                }
            );
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
                    display={"flex"}
                    justifyContent="center"
                    alignItems={"center"}
                    width={canvasElemWidth}
                >
                    <Box
                        width={canvasElemWidth}
                        height={(canvasElemWidth * 16) / 9}
                        sx={{
                            background: `url(${selectedBackground})`,
                            backgroundPosition: "center",
                            backgroundSize: "contain",
                            // borderRadius: 8,
                        }}
                        display="flex"
                        alignItems={"start"}
                        justifyContent={"center"}
                    >
                        {ready && coverDoc ? (
                            <PhaserGame
                                ref={phaserRef}
                                voices={Object.values(selectedVoices)}
                                coverDocId={selectedCoverDocId}
                                musicStartOffset={
                                    coverDoc?.sections?.at(startSectionIdx - 1)
                                        ?.start || 0
                                }
                                skinPath={selectedSkinPath}
                                backgroundPath={selectedBackground}
                                selectedTracks={[...selectedTracksList].slice(
                                    0,
                                    noOfRaceTracks
                                )}
                                noOfRaceTracks={noOfRaceTracks}
                            />
                        ) : (
                            <Stack
                                alignItems={"center"}
                                py={8}
                                px={2}
                                gap={4}
                                sx={{
                                    background: "rgba(0,0,0,0.6)",
                                }}
                            >
                                <Typography
                                    height={"100%"}
                                    width={"100%"}
                                    display="flex"
                                    justifyContent={"center"}
                                    variant="h6"
                                    align="center"
                                >
                                    {coverDoc?.title}
                                </Typography>
                                {coverDoc && isDownloading ? (
                                    <LinearProgressWithLabel
                                        value={downloadProgress}
                                        sx={{ height: 10, borderRadius: 5 }}
                                    />
                                ) : (
                                    <Button
                                        onClick={downloadAndPlay}
                                        variant="contained"
                                        color="primary"
                                    >
                                        Play
                                    </Button>
                                )}
                            </Stack>
                        )}
                    </Box>
                </Box>
                <Stack
                    flexBasis={`calc(60% - 406px)`}
                    justifyContent={"start"}
                    height="100%"
                    gap={2}
                >
                    <Typography align="center">Controls</Typography>
                    <Stack gap={1}>
                        <Stack gap={2} direction="row" alignItems={"center"}>
                            <Typography>Start Section</Typography>
                            <Slider
                                sx={{ width: 200 }}
                                min={1}
                                step={1}
                                max={coverDoc?.sections?.length}
                                value={startSectionIdx}
                                onChange={(_, val) =>
                                    setStartSectionIdx(val as number)
                                }
                                marks
                                valueLabelDisplay="auto"
                            />
                        </Stack>
                        <Stack gap={2} direction="row" alignItems={"center"}>
                            <Typography>No of Race Tracks</Typography>
                            <Slider
                                sx={{ width: 200 }}
                                min={1}
                                step={1}
                                max={10}
                                value={noOfRaceTracks}
                                onChange={(_, val) =>
                                    setNoOfRaceTracks(val as number)
                                }
                                marks
                                valueLabelDisplay="auto"
                            />
                        </Stack>
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


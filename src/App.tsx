import {
    Box,
    Button,
    IconButton,
    Slider,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import LinearProgressWithLabel from "./components/LinearProgressWithLabel";
import Rows from "./components/Rows";
import SelectTracks from "./components/SelectTracks";
import SelectVoices from "./components/SelectVoices";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { GameVoiceInfo } from "./game/scenes/Preloader";
import { downloadAudioFiles, stopAndDestroyPlayers } from "./hooks/useTonejs";
import { CoverV1 } from "./services/db/coversV1.service";
import {
    listAllTrackBackgrounds,
    listAllTrackSkins,
} from "./services/storage/marbleRace.service";
import LibraryMusicRoundedIcon from "@mui/icons-material/LibraryMusicRounded";
import TuneIcon from "@mui/icons-material/Tune";
import { createRandomNumber } from "./helpers";

export const tracks = [
    "01",
    "02",
    "03",
    "06",
    "07",
    "11",
    "14",
    "16",
    "21",
    "22",
];

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
    const [selectedVoices, setSelectedVoices] = useState<GameVoiceInfo[]>([]);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [startSectionIdx, setStartSectionIdx] = useState(3);
    const [noOfRaceTracks, setNoOfRaceTracks] = useState(6);
    const [marbleSpeed, setMarbleSpeed] = useState(0.2);
    const theme = useTheme();
    const isMobileView = useMediaQuery(theme.breakpoints.down("md"));
    const canvasElemWidth = window.innerWidth > 414 ? 414 : window.innerWidth;
    // isMobileView
    //     ? window.innerWidth > 414
    //         ? 414
    //         : window.innerWidth
    //     : 414;
    const coversPageRef = useRef<HTMLDivElement>(null);
    const gamePageRef = useRef<HTMLDivElement>(null);
    const controlsPageRef = useRef<HTMLDivElement>(null);

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

        setSelectedVoices(
            _coverDoc.voices.slice(0, 5).map((v) => ({
                id: v.id,
                name: v.name,
                avatar: `https://voxaudio.nusic.fm/${encodeURIComponent(
                    "voice_models/avatars/thumbs/"
                )}${v.id}_200x200?alt=media`,
            }))
        );
    };

    const downloadAndPlay = async () => {
        if (isDownloading) return;
        if (selectedVoices.length < 2) {
            alert("Select at least 2 voices");
            controlsPageRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
            return;
        }
        if (selectedTracksList.length === 0) {
            alert("Select tracks");
            controlsPageRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
            return;
        }
        gamePageRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
        });
        if (coverDoc && selectedCoverDocId) {
            setIsDownloading(true);
            await downloadAudioFiles(
                [
                    `https://voxaudio.nusic.fm/covers/${selectedCoverDocId}/instrumental.mp3`,
                    ...selectedVoices
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
        if (gamePageRef.current) {
            gamePageRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
        (async () => {
            const paths = await listAllTrackSkins();
            setSelectedSkinPath(paths[0]);
            setSkinPaths(paths);
        })();
        (async () => {
            const paths = await listAllTrackBackgrounds();
            setSelectedBackground(
                paths[createRandomNumber(0, paths.length - 1)]
            );
            setBgPaths(paths);
        })();
    }, []);

    if (isMobileView) {
        return (
            <Stack mb={5} sx={{ overflowY: "hidden" }}>
                <Header />
                <Box
                    height={`calc(100vh - 88px)`}
                    display="flex"
                    justifyContent={"start"}
                    sx={{
                        overflowX: "auto",
                        scrollSnapType: "x mandatory",
                        overflowY: "hidden",
                    }}
                >
                    <Box
                        sx={{ scrollSnapAlign: "start", overflowY: "hidden" }}
                        ref={coversPageRef}
                        minWidth={"100vw"}
                        height="100%"
                        pt={1}
                    >
                        <Rows
                            onCoverSelection={(
                                coverDocId: string,
                                coverDoc: CoverV1
                            ) => {
                                fetchCoverDoc(coverDocId, coverDoc);
                            }}
                            onPlay={downloadAndPlay}
                            onGotoControls={(coverDocId, coverDoc) => {
                                fetchCoverDoc(coverDocId, coverDoc);
                                controlsPageRef.current?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "nearest",
                                });
                            }}
                        />
                    </Box>
                    <Box
                        width={"100vw"}
                        height="100%"
                        sx={{ scrollSnapAlign: "start" }}
                        ref={gamePageRef}
                        position="relative"
                    >
                        <Box
                            width={"100vw"}
                            height={"100%"}
                            display="flex"
                            gap={2}
                            justifyContent="center"
                        >
                            <Box
                                display={"flex"}
                                justifyContent="center"
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
                                            voices={selectedVoices}
                                            coverDocId={selectedCoverDocId}
                                            musicStartOffset={
                                                coverDoc?.sections?.at(
                                                    startSectionIdx - 1
                                                )?.start || 0
                                            }
                                            skinPath={selectedSkinPath}
                                            backgroundPath={selectedBackground}
                                            selectedTracks={[
                                                ...selectedTracksList,
                                            ].slice(0, noOfRaceTracks)}
                                            noOfRaceTracks={noOfRaceTracks}
                                            gravityY={marbleSpeed}
                                            width={canvasElemWidth}
                                        />
                                    ) : (
                                        <Stack
                                            alignItems={"center"}
                                            py={8}
                                            px={2}
                                            gap={4}
                                            width={"100%"}
                                            sx={{
                                                background: "rgba(0,0,0,0.6)",
                                            }}
                                        >
                                            <Typography
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
                                                    sx={{
                                                        height: 10,
                                                        borderRadius: 5,
                                                    }}
                                                />
                                            ) : (
                                                <Stack
                                                    direction={"row"}
                                                    gap={1}
                                                >
                                                    <IconButton
                                                        onClick={() =>
                                                            coversPageRef.current?.scrollIntoView(
                                                                {
                                                                    behavior:
                                                                        "smooth",
                                                                    block: "nearest",
                                                                }
                                                            )
                                                        }
                                                    >
                                                        <LibraryMusicRoundedIcon />
                                                    </IconButton>
                                                    <Button
                                                        onClick={
                                                            downloadAndPlay
                                                        }
                                                        variant="contained"
                                                        color="primary"
                                                        size="large"
                                                    >
                                                        Play
                                                    </Button>
                                                    <IconButton
                                                        onClick={() =>
                                                            controlsPageRef.current?.scrollIntoView(
                                                                {
                                                                    behavior:
                                                                        "smooth",
                                                                    block: "nearest",
                                                                }
                                                            )
                                                        }
                                                    >
                                                        <TuneIcon />
                                                    </IconButton>
                                                </Stack>
                                            )}
                                        </Stack>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                        {ready && (
                            <Box
                                position={"absolute"}
                                left={"50%"}
                                bottom={0}
                                sx={{ transform: "translate(-50%, -50%)" }}
                            >
                                <Button
                                    color="error"
                                    variant="contained"
                                    size="small"
                                    onClick={() => {
                                        phaserRef.current?.game?.destroy(true);
                                        stopAndDestroyPlayers();
                                        setDownloadProgress(0);
                                        setReady(false);
                                    }}
                                >
                                    Reset Race
                                </Button>
                            </Box>
                        )}
                    </Box>
                    <Box
                        width={"100vw"}
                        height="100%"
                        sx={{ scrollSnapAlign: "start" }}
                        ref={controlsPageRef}
                    >
                        <Stack
                            justifyContent={"start"}
                            gap={2}
                            height="100%"
                            width={"calc(100% - 18px)"}
                            px={1}
                        >
                            <Stack
                                direction={"row"}
                                alignItems="center"
                                justifyContent={"space-between"}
                            >
                                <Typography>Controls</Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => {
                                        gamePageRef.current?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "nearest",
                                        });
                                        downloadAndPlay();
                                    }}
                                >
                                    Play
                                </Button>
                            </Stack>
                            <Box sx={{ overflowY: "auto" }} height="100%">
                                <Stack
                                    gap={2}
                                    direction="row"
                                    alignItems={"center"}
                                >
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
                                <Stack
                                    gap={2}
                                    direction="row"
                                    alignItems={"center"}
                                >
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
                                <Stack
                                    gap={2}
                                    direction="row"
                                    alignItems={"center"}
                                >
                                    <Typography>Speed</Typography>
                                    <Slider
                                        sx={{ width: 200 }}
                                        min={0.1}
                                        step={0.1}
                                        max={0.8}
                                        value={marbleSpeed}
                                        onChange={(_, val) =>
                                            setMarbleSpeed(val as number)
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
                                <Stack
                                    direction="row"
                                    gap={2}
                                    width={"calc(100% - 16px)"}
                                    sx={{ overflowX: "auto" }}
                                    justifyContent="start"
                                    p={1}
                                >
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
                                            onClick={() =>
                                                setSelectedSkinPath(path)
                                            }
                                        />
                                    ))}
                                </Stack>
                                <Typography>Choose a Background</Typography>
                                <Stack
                                    direction="row"
                                    gap={2}
                                    width={"calc(100% - 16px)"}
                                    sx={{ overflowX: "auto" }}
                                    justifyContent="start"
                                    p={1}
                                >
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
                                            onClick={() =>
                                                setSelectedBackground(path)
                                            }
                                        />
                                    ))}
                                </Stack>
                                <SelectTracks
                                    setSelectedTracksList={
                                        setSelectedTracksList
                                    }
                                    selectedTracksList={selectedTracksList}
                                />
                            </Box>
                        </Stack>
                    </Box>
                </Box>
            </Stack>
        );
    }
    return (
        <Stack id="app" gap={2} sx={{ width: "100%", height: "100vh" }}>
            <Header />
            <Box width={"100%"} display="flex" gap={2}>
                <Box height={`calc(100vh - 160px)`} width="40%">
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
                                voices={selectedVoices}
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
                                gravityY={marbleSpeed}
                                width={canvasElemWidth}
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
                    width={`calc(60% - ${canvasElemWidth}px)`}
                    position={"relative"}
                    height={`calc(100vh - 160px)`}
                    justifyContent={"start"}
                >
                    <Typography align="center">Controls</Typography>
                    {ready && (
                        <Box position={"absolute"} left={0}>
                            <Button
                                color="error"
                                variant="contained"
                                size="small"
                                onClick={() => {
                                    phaserRef.current?.game?.destroy(true);
                                    stopAndDestroyPlayers();
                                    setDownloadProgress(0);
                                    setReady(false);
                                }}
                            >
                                Reset Race
                            </Button>
                        </Box>
                    )}
                    <Box
                        sx={{ overflowY: "auto" }}
                        width="100%"
                        height={"100%"}
                        gap={1}
                        py={2}
                        justifyContent={"start"}
                        alignItems={"start"}
                    >
                        <Stack
                            gap={2}
                            direction="row"
                            alignItems={"center"}
                            my={1}
                        >
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
                        <Stack
                            gap={2}
                            direction="row"
                            alignItems={"center"}
                            mb={1}
                        >
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
                        <Stack
                            gap={2}
                            direction="row"
                            alignItems={"center"}
                            mb={1}
                        >
                            <Typography>Speed</Typography>
                            <Slider
                                sx={{ width: 200 }}
                                min={0.1}
                                step={0.1}
                                max={0.8}
                                value={marbleSpeed}
                                onChange={(_, val) =>
                                    setMarbleSpeed(val as number)
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
                        <Typography mt={1}>Choose a Skin</Typography>
                        <Stack
                            direction="row"
                            gap={2}
                            width={"90%"}
                            sx={{ overflowX: "auto" }}
                            justifyContent="start"
                            p={1}
                        >
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
                        <Stack
                            direction="row"
                            gap={2}
                            width={"90%"}
                            sx={{ overflowX: "auto" }}
                            justifyContent="start"
                            p={1}
                        >
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
                    </Box>
                </Stack>
            </Box>
        </Stack>
    );
}

export default App;


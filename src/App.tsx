import { Box, Typography } from "@mui/material";
import { useRef, useState } from "react";
import Rows from "./components/Rows";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { downloadAudioFiles } from "./hooks/useTonejs";
import { CoverV1, getCoverDocById } from "./services/db/coversV1.service";

function App() {
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [ready, setReady] = useState(false);
    const [coverDoc, setCoverDoc] = useState<CoverV1 | null>(null);
    const [selectedCoverDocId, setSelectedCoverDocId] = useState<string>("");

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
    return (
        <Box
            id="app"
            display={"flex"}
            // justifyContent={"center"}
            alignItems={"center"}
            gap={2}
            sx={{ overflow: "hidden", width: "100%", height: "100vh" }}
            // style={{ overflowY: "auto", height: "100vh" }}
        >
            <Box
                height={"100vh"}
                sx={{
                    overflowY: "auto",
                    // hide scrollbar
                    "&::-webkit-scrollbar": {
                        display: "none",
                    },
                    "-ms-overflow-style": "none",
                    scrollbarWidth: "none",
                }}
                flexBasis="40%"
                py={10}
            >
                <Rows onCoverSelection={fetchCoverDoc} />
            </Box>
            <Box
                width={512 - 94}
                height={window.innerHeight}
                borderLeft="1px solid #c3c3c3"
                borderRight="1px solid #c3c3c3"
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
                    />
                ) : isDownloading ? (
                    <Typography
                        height={"100%"}
                        width={"100%"}
                        display="flex"
                        alignItems={"center"}
                        justifyContent={"center"}
                    >
                        Preparing...
                    </Typography>
                ) : (
                    <Typography
                        height={"100%"}
                        width={"100%"}
                        display="flex"
                        alignItems={"center"}
                        justifyContent={"center"}
                    >
                        Select a cover to start
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

export default App;


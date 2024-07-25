import {
    Stack,
    Box,
    Popover,
    Typography,
    IconButton,
    Button,
} from "@mui/material";
import { tracks } from "../App";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import RemoveIcon from "@mui/icons-material/Remove";

type Props = {
    selectedTracksList: string[];
    setSelectedTracksList: React.Dispatch<React.SetStateAction<string[]>>;
};

const SelectTracks = ({ selectedTracksList, setSelectedTracksList }: Props) => {
    const [dialogRef, setDialogRef] = useState<HTMLButtonElement | null>(null);
    const [showRemove, setShowRemove] = useState(false);

    const availableTracksToSelect = tracks.filter(
        (t) => !Object.values(selectedTracksList).includes(t)
    );

    useEffect(() => {
        if (selectedTracksList.length === 0) {
            setShowRemove(false);
        } else if (selectedTracksList) {
            // Save in local storage
            localStorage.setItem(
                "selectedTracks",
                JSON.stringify(selectedTracksList)
            );
            if (selectedTracksList.length === tracks.length) setDialogRef(null);
        }
    }, [selectedTracksList]);

    return (
        <Stack gap={1}>
            <Box display={"flex"} gap={2} alignItems={"center"}>
                <Typography>Choose Tracks</Typography>
                <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => setShowRemove(!showRemove)}
                    disabled={selectedTracksList.length === 0}
                >
                    {showRemove ? "Done" : "Remove"}
                </Button>
            </Box>
            <Stack direction="row" gap={1} flexWrap="wrap">
                {selectedTracksList.map((trackPath) => (
                    <Box
                        key={trackPath}
                        position="relative"
                        width={80}
                        height={142}
                    >
                        <img
                            src={`https://voxaudio.nusic.fm/marble_race%2Foriginal_tracks%2F${trackPath}.png?alt=media`}
                            style={{
                                cursor: "pointer",
                                background: "#c3c3c3",
                                objectFit: "cover",
                                width: "100%",
                                height: "100%",
                            }}
                        />
                        {showRemove && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    background: "rgba(0,0,0,0.5)",
                                }}
                                width="100%"
                                height={"100%"}
                                display="flex"
                                alignItems={"center"}
                                justifyContent="center"
                            >
                                <IconButton
                                    onClick={() =>
                                        setSelectedTracksList((prevTracks) =>
                                            prevTracks.filter(
                                                (t) => t !== trackPath
                                            )
                                        )
                                    }
                                >
                                    <RemoveIcon />
                                </IconButton>
                            </Box>
                        )}
                    </Box>
                ))}
                <Box width={64} height={130} px={1}>
                    <Box
                        width={"100%"}
                        height={"100%"}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        borderRadius={1}
                        sx={{ outline: "2px solid #c3c3c3", cursor: "pointer" }}
                    >
                        <IconButton
                            onClick={(e) => setDialogRef(e.currentTarget)}
                            disabled={!availableTracksToSelect.length}
                        >
                            <AddIcon fontSize="large" />
                        </IconButton>
                    </Box>
                </Box>
                <Popover
                    open={Boolean(dialogRef)}
                    anchorEl={dialogRef}
                    onClose={() => setDialogRef(null)}
                >
                    <Stack p={2} gap={1}>
                        <Typography>Add Tracks</Typography>
                        <Stack direction={"row"} gap={1}>
                            {availableTracksToSelect.map((t) => (
                                <img
                                    key={t}
                                    src={`https://voxaudio.nusic.fm/marble_race%2Foriginal_tracks%2F${t}.png?alt=media`}
                                    style={{
                                        width: 80,
                                        height: 130,
                                        cursor: "pointer",
                                        background: "#c3c3c3",
                                        objectFit: "cover",
                                    }}
                                    onClick={() => {
                                        setSelectedTracksList((prevTracks) => [
                                            ...prevTracks,
                                            t,
                                        ]);
                                    }}
                                />
                            ))}
                        </Stack>
                    </Stack>
                </Popover>
            </Stack>
        </Stack>
    );
};

export default SelectTracks;


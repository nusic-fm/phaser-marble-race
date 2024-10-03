import {
    Avatar,
    AvatarGroup,
    Box,
    Button,
    IconButton,
    ListItemButton,
    MenuItem,
    Select,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { Stack } from "@mui/system";
import {
    query,
    collection,
    where,
    limit,
    orderBy,
    DocumentData,
    QuerySnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { CoverV1 } from "../services/db/coversV1.service";
import { db } from "../services/firebase.service";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import Settings from "@mui/icons-material/Settings";
import { createRandomNumber } from "../helpers";

const getRowsQuery = (recordsLimit: number, isLatest: boolean) => {
    if (isLatest) {
        return query(
            collection(db, "covers"),
            orderBy("createdAt", "desc"),
            where("audioUrl", "!=", ""),
            limit(recordsLimit)
        );
    } else {
        return query(
            collection(db, "covers"),
            orderBy("rank", "asc"),
            where("audioUrl", "!=", ""),
            orderBy("playCount", "desc"),
            limit(recordsLimit)
        );
    }
};

type Props = {
    onCoverSelection: (coverDocId: string, coverDoc: CoverV1) => void;
    onPlay?: (coverDocId: string, coverDoc: CoverV1) => void;
    onGotoControls?: (coverDocId: string, coverDoc: CoverV1) => void;
};
const Rows = ({ onCoverSelection, onPlay, onGotoControls }: Props) => {
    const [recordsLimit, setRecordsLimit] = useState(2);
    const [isLatest, setIsLatest] = useState(false);
    const [coversCollectionSnapshot, coversLoading, error] = useCollection(
        getRowsQuery(recordsLimit, isLatest)
    );
    const [coversSnapshot, setCoversSnapshot] = useState<
        QuerySnapshot<DocumentData, DocumentData> | undefined
    >();
    const theme = useTheme();
    const isMobileView = useMediaQuery(theme.breakpoints.down("md"));

    useEffect(() => {
        if (coversCollectionSnapshot?.size) {
            setCoversSnapshot(coversCollectionSnapshot);
            const selectionIdx = createRandomNumber(0, recordsLimit - 1);
            onCoverSelection(
                coversCollectionSnapshot.docs[selectionIdx].id,
                coversCollectionSnapshot.docs[selectionIdx].data() as CoverV1
            );
        }
    }, [coversCollectionSnapshot]);

    return (
        <Stack height={"100%"} gap={2} px={isMobileView ? 1 : "none"}>
            <Stack
                direction={"row"}
                justifyContent={isMobileView ? "space-between" : "center"}
                alignItems="center"
                position={"relative"}
            >
                <Typography align="center">Choose Race</Typography>
                <Box position={"absolute"} right={0}>
                    <Select
                        size="small"
                        sx={{ width: "135px" }}
                        startAdornment={
                            <FilterListOutlinedIcon
                                fontSize="small"
                                sx={{ mr: 1 }}
                            />
                        }
                        value={isLatest ? "latest" : "top"}
                        onChange={(e) => {
                            if (e.target.value === "latest") {
                                setIsLatest(true);
                            } else {
                                setIsLatest(false);
                            }
                        }}
                    >
                        <MenuItem value="top">Top</MenuItem>
                        <MenuItem value="latest">Latest</MenuItem>
                    </Select>
                </Box>
            </Stack>
            <Stack
                gap={2}
                sx={{
                    overflowY: "auto",
                    width: "100%",
                    // hide scrollbar
                    // "&::-webkit-scrollbar": {
                    //     display: "none",
                    // },
                    // "-ms-overflow-style": "none",
                    // scrollbarWidth: "none",
                }}
                // px={isMobileView ? "none" : "20%"}
                // height="650px"
            >
                {coversSnapshot?.docs.map((doc) => {
                    const id = doc.id;
                    const coverDoc = doc.data() as CoverV1;
                    if (isMobileView)
                        return (
                            <Stack
                                gap={1}
                                width="100%"
                                key={id}
                                sx={{
                                    width: "100%",
                                    borderBottom:
                                        "1px solid rgba(255,255,255,0.2)",
                                }}
                            >
                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    gap={1}
                                    position="relative"
                                >
                                    <AvatarGroup
                                        max={6}
                                        sx={{
                                            ".MuiAvatar-colorDefault": {
                                                backgroundColor: "transparent",
                                                width: isMobileView ? 50 : 60,
                                                height: isMobileView ? 50 : 60,
                                                border: "1px solid white",
                                                color: "white",
                                            },
                                        }}
                                    >
                                        {coverDoc.voices.map((voice) => (
                                            <Avatar
                                                src={`https://voxaudio.nusic.fm/${encodeURIComponent(
                                                    "voice_models/avatars/thumbs/"
                                                )}${
                                                    voice.id
                                                }_200x200?alt=media`}
                                                sx={{
                                                    width: isMobileView
                                                        ? 50
                                                        : 60,
                                                    height: isMobileView
                                                        ? 50
                                                        : 60,
                                                    borderRadius: "50%",
                                                }}
                                            />
                                        ))}
                                    </AvatarGroup>
                                    {isMobileView && (
                                        <>
                                            <Box
                                                position={"absolute"}
                                                top={0}
                                                right={0}
                                                width="100%"
                                                height="100%"
                                                display={"flex"}
                                                alignItems={"center"}
                                                justifyContent={"center"}
                                                sx={{
                                                    backgroundColor:
                                                        "rgba(0,0,0,0.5)",
                                                    zIndex: 9,
                                                }}
                                            >
                                                <Button
                                                    variant="contained"
                                                    onClick={() =>
                                                        onPlay &&
                                                        onPlay(id, coverDoc)
                                                    }
                                                >
                                                    Play
                                                </Button>
                                                <IconButton
                                                    sx={{
                                                        position: "absolute",
                                                        right: 5,
                                                        zIndex: 10,
                                                    }}
                                                    onClick={() =>
                                                        onGotoControls &&
                                                        onGotoControls(
                                                            id,
                                                            coverDoc
                                                        )
                                                    }
                                                >
                                                    <Settings />
                                                </IconButton>
                                            </Box>
                                            <IconButton></IconButton>
                                        </>
                                    )}
                                </Box>
                                <Typography align="center">
                                    {coverDoc.title}
                                </Typography>
                            </Stack>
                        );
                    else
                        return (
                            <ListItemButton
                                key={id}
                                sx={{
                                    width: "100%",
                                    borderBottom:
                                        "1px solid rgba(255,255,255,0.2)",
                                }}
                                onClick={() => onCoverSelection(id, coverDoc)}
                            >
                                <Stack gap={1} width="100%">
                                    <Box
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                        gap={1}
                                    >
                                        <AvatarGroup
                                            max={6}
                                            sx={{
                                                ".MuiAvatar-colorDefault": {
                                                    backgroundColor:
                                                        "transparent",
                                                    width: 60,
                                                    height: 60,
                                                    border: "1px solid white",
                                                    color: "white",
                                                },
                                            }}
                                        >
                                            {coverDoc.voices.map((voice) => (
                                                <Avatar
                                                    src={`https://voxaudio.nusic.fm/${encodeURIComponent(
                                                        "voice_models/avatars/thumbs/"
                                                    )}${
                                                        voice.id
                                                    }_200x200?alt=media`}
                                                    sx={{
                                                        width: 60,
                                                        height: 60,
                                                        borderRadius: "50%",
                                                    }}
                                                />
                                            ))}
                                        </AvatarGroup>
                                    </Box>
                                    <Typography align="center">
                                        {coverDoc.title}
                                    </Typography>
                                </Stack>
                            </ListItemButton>
                        );
                })}
                {!!coversSnapshot && coversSnapshot.size >= 15 && (
                    <Box display={"flex"} justifyContent="center" pt={2}>
                        <Button
                            onClick={() => {
                                setRecordsLimit(recordsLimit + 15);
                            }}
                            variant="text"
                            color="secondary"
                        >
                            Load More
                        </Button>
                    </Box>
                )}
            </Stack>
        </Stack>
    );
};

export default Rows;


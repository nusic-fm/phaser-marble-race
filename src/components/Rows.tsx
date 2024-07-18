import {
    Avatar,
    AvatarGroup,
    Box,
    ListItemButton,
    Typography,
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
    onCoverSelection: (coverDocId: string) => void;
};
const Rows = ({ onCoverSelection }: Props) => {
    const [recordsLimit, setRecordsLimit] = useState(15);
    const [isLatest, setIsLatest] = useState(false);
    const [coversCollectionSnapshot, coversLoading, error] = useCollection(
        getRowsQuery(recordsLimit, isLatest)
    );
    const [coversSnapshot, setCoversSnapshot] = useState<
        QuerySnapshot<DocumentData, DocumentData> | undefined
    >();

    useEffect(() => {
        if (coversCollectionSnapshot?.size) {
            setCoversSnapshot(coversCollectionSnapshot);
        }
    }, [coversCollectionSnapshot]);

    return (
        <Stack my={2} height={"100%"} gap={2}>
            <Typography align="center">Choose Race</Typography>
            <Stack
                gap={2}
                sx={{
                    overflowY: "auto",
                    // hide scrollbar
                    // "&::-webkit-scrollbar": {
                    //     display: "none",
                    // },
                    // "-ms-overflow-style": "none",
                    // scrollbarWidth: "none",
                }}
                px={2}
                // height="650px"
            >
                {coversSnapshot?.docs.map((doc) => {
                    const id = doc.id;
                    const coverDoc = doc.data() as CoverV1;
                    return (
                        <ListItemButton
                            key={id}
                            sx={{
                                width: "100%",
                                borderBottom: "1px solid #e0e0e0",
                            }}
                            onClick={() => onCoverSelection(id)}
                        >
                            <Stack gap={1} width="100%">
                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    gap={1}
                                >
                                    <AvatarGroup
                                        total={coverDoc.voices.length}
                                        max={5}
                                        sx={{
                                            ".MuiAvatar-colorDefault": {
                                                backgroundColor: "transparent",
                                                width: 70,
                                                height: 70,
                                            },
                                        }}
                                    >
                                        {coverDoc.voices
                                            .slice(0, 5)
                                            .map((voice) => (
                                                <Avatar
                                                    src={`https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/${encodeURIComponent(
                                                        "voice_models/avatars/thumbs/"
                                                    )}${
                                                        voice.id
                                                    }_200x200?alt=media`}
                                                    sx={{
                                                        width: 70,
                                                        height: 70,
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
            </Stack>
        </Stack>
    );
};

export default Rows;


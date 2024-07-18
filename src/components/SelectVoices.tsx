import {
    Stack,
    Typography,
    Box,
    Avatar,
    IconButton,
    Tooltip,
    Popover,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { GameVoiceInfo } from "../game/scenes/Preloader";
import { useState } from "react";
import { VoiceV1Cover } from "../services/db/coversV1.service";

type Props = {
    selectedVoices: { [key: string]: GameVoiceInfo };
    voices: VoiceV1Cover[];
    setSelectedVoices: any;
};

const SelectVoices = ({ selectedVoices, setSelectedVoices, voices }: Props) => {
    const [dialogRef, setDialogRef] = useState<{
        ref: HTMLButtonElement;
        vid: string;
    } | null>(null);

    return (
        <Stack direction="row" gap={3}>
            {Object.values(selectedVoices).map((voice, i) => (
                <Stack key={voice.id} gap={1} alignItems="center">
                    <Typography>Voice {i + 1}</Typography>
                    <Tooltip title={voice.name}>
                        <Box position={"relative"} width={80} height={80}>
                            <Avatar
                                src={voice.avatar}
                                sx={{
                                    width: 76,
                                    height: 76,
                                    border: "2px solid #fff",
                                }}
                            />
                            <Box
                                position={"absolute"}
                                top={0}
                                right={0}
                                display="flex"
                                justifyContent={"center"}
                                alignItems={"center"}
                                width="100%"
                                height={"100%"}
                                sx={
                                    {
                                        // background: "rgba(0,0,0,0.2)",
                                    }
                                }
                            >
                                <IconButton
                                    onClick={(e) =>
                                        setDialogRef({
                                            ref: e.currentTarget,
                                            vid: i.toString(),
                                        })
                                    }
                                >
                                    <AddIcon fontSize="large" />
                                </IconButton>
                            </Box>
                        </Box>
                    </Tooltip>
                    {/* <Typography align="center">
                                        {selectedVoices[parseInt(key)].name}
                                    </Typography> */}
                </Stack>
            ))}
            <Popover
                open={Boolean(dialogRef)}
                anchorEl={dialogRef?.ref}
                onClose={() => setDialogRef(null)}
            >
                <Stack p={2} gap={1}>
                    <Typography>Choose Voice</Typography>
                    <Stack direction={"row"} gap={1}>
                        {voices
                            .filter(
                                (v) =>
                                    !Object.values(selectedVoices)
                                        .map((v) => v.id)
                                        .includes(v.id)
                            )
                            .map((v) => (
                                <Tooltip title={v.name} key={v.id}>
                                    <Avatar
                                        src={`https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/${encodeURIComponent(
                                            "voice_models/avatars/thumbs/"
                                        )}${v.id}_200x200?alt=media`}
                                        onClick={() => {
                                            if (dialogRef?.vid) {
                                                setSelectedVoices({
                                                    ...selectedVoices,
                                                    [dialogRef.vid]: {
                                                        id: v.id,
                                                        name: v.name,
                                                        avatar: `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/${encodeURIComponent(
                                                            "voice_models/avatars/thumbs/"
                                                        )}${
                                                            v.id
                                                        }_200x200?alt=media`,
                                                    },
                                                });
                                                setDialogRef(null);
                                            }
                                        }}
                                    />
                                </Tooltip>
                            ))}
                    </Stack>
                </Stack>
            </Popover>
        </Stack>
    );
};

export default SelectVoices;


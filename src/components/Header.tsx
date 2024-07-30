import { Typography, useMediaQuery, useTheme } from "@mui/material";
import { Stack } from "@mui/system";

type Props = {};

const Header = ({}: Props) => {
    const theme = useTheme();
    const isMobileView = useMediaQuery(theme.breakpoints.down("md"));

    if (isMobileView)
        return (
            <Stack
                direction="row"
                p={2}
                justifyContent="center"
                alignItems={"center"}
            >
                <Stack gap={0.5}>
                    <Stack direction="row" justifyContent="center">
                        <img src="nusic_white.png" width={100}></img>
                    </Stack>
                    <Typography align="center" variant="caption">
                        AI Cover Races
                    </Typography>
                </Stack>
                {/* <Typography>Controls</Typography> */}
            </Stack>
        );
    return (
        <Stack direction="row" p={2}>
            <Stack gap={1}>
                <img src="nusic_white.png" height={40}></img>
                <Typography align="center">AI Cover Races</Typography>
            </Stack>
        </Stack>
    );
};

export default Header;


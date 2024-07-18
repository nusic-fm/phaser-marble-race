import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";

type Props = {};

const Header = (props: Props) => {
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


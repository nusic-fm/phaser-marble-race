import { Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Stack } from "@mui/system";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { Dispatch, SetStateAction } from "react";

type Props = { setShowDashboard?: Dispatch<SetStateAction<boolean>> };

const Header = ({ setShowDashboard }: Props) => {
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
        <Stack
            direction="row"
            p={2}
            justifyContent="space-between"
            alignItems={"center"}
        >
            <Stack gap={1}>
                <img src="nusic_white.png" height={40}></img>
                <Typography align="center">AI Cover Races</Typography>
            </Stack>
            <Button
                variant="outlined"
                color="secondary"
                endIcon={<AccountBalanceWalletOutlinedIcon />}
                onClick={() => setShowDashboard && setShowDashboard(true)}
            >
                Dashboard
            </Button>
        </Stack>
    );
};

export default Header;


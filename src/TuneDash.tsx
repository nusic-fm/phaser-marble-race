import { Button, useMediaQuery, useTheme } from "@mui/material";
import { Box } from "@mui/system";

type Props = {};

const TuneDash = ({}: Props) => {
    const theme = useTheme();
    const isMobileView = useMediaQuery(theme.breakpoints.down("md"));

    return (
        <Box
            position={"absolute"}
            top={0}
            left={isMobileView ? 0 : "50%"}
            height="100vh"
            width={isMobileView ? "100vw" : "450px"}
            sx={{
                background: `url('/assets/splash.webp')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: isMobileView ? "unset" : "translateX(-50%)",
            }}
            display="flex"
            alignItems={"end"}
            justifyContent="center"
        >
            <Button
                href="//t.me/tunedash_bot"
                sx={{ mb: 12 }}
                variant="contained"
                color="warning"
                size="large"
                className="focus-scale"
            >
                Play Mini App
            </Button>
        </Box>
    );
};

export default TuneDash;


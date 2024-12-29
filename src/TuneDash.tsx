import { Button } from "@mui/material";
import { Box } from "@mui/system";

type Props = {};

const TuneDash = ({}: Props) => {
    return (
        <Box
            position={"absolute"}
            top={0}
            left={0}
            height="100vh"
            width={"100vw"}
            sx={{
                background: `url('/assets/splash.webp')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
            display="flex"
            alignItems={"end"}
            justifyContent="center"
        >
            <Button
                href="//t.me/tunedash_bot"
                sx={{ mb: 2.5 }}
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


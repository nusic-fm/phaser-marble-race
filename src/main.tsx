import React from "react";
import ReactDOM from "react-dom/client";
import TuneDash from "./TuneDash";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <TuneDash />
        </ThemeProvider>
    </React.StrictMode>
);


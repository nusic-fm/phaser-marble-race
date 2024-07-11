import { useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { downloadAudioFiles } from "./hooks/useTonejs";

export const voices = [
    "snoop-dogg",
    "cardi-b",
    "morgan-freeman",
    "franklin-clinton_gta-v",
    "trevor_gta-v",
    "eric-cartman",
];
const coverDocId = "f0pmE4twBXnJmVrJzh18";

function App() {
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [ready, setReady] = useState(false);

    const fetchCoverDoc = async () => {
        setIsDownloading(true);
        // const coverDoc = await getCoverDocById(coverId);
        // setCoverDoc(coverDoc);
        await downloadAudioFiles([
            `https://voxaudio.nusic.fm/covers/${coverDocId}/instrumental.mp3`,
            ...voices
                .slice(0, 8)
                // .map((v) => v.id)
                .map(
                    (v) =>
                        `https://voxaudio.nusic.fm/covers/${coverDocId}/${v}.mp3`
                ),
        ]);
        setIsDownloading(false);
        setReady(true);
    };
    return (
        <div id="app" style={{ overflowY: "auto", height: "100vh" }}>
            {ready && <PhaserGame ref={phaserRef} />}
            {!ready && (
                <button onClick={fetchCoverDoc}>
                    {isDownloading ? "Downloading" : "Download & Play"}
                </button>
            )}
        </div>
    );
}

export default App;


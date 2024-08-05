import { listAll, ref } from "firebase/storage";
import { storage } from "../firebase.service";

export const listAllTrackSkins = async (): Promise<string[]> => {
    const folderRef = ref(storage, "marble_race/track_skins");
    const listResult = await listAll(folderRef);
    return listResult.items.map(
        (item) =>
            `https://voxaudio.nusic.fm/${encodeURIComponent(
                item.fullPath
            )}?alt=media`
    );
};
export const listAllTrackBackgrounds = async (): Promise<string[][]> => {
    const folderRef = ref(storage, "marble_race/backgrounds");
    const listResult = await listAll(folderRef);
    const motionBgs = listResult.items.filter((item) =>
        item.name.startsWith("motion")
    );
    const nonMotionBgs = listResult.items.filter(
        (item) => !item.name.startsWith("motion")
    );

    return [
        motionBgs.map(
            (item) =>
                `https://voxaudio.nusic.fm/${encodeURIComponent(
                    item.fullPath
                )}?alt=media`
        ),
        nonMotionBgs.map(
            (item) =>
                `https://voxaudio.nusic.fm/${encodeURIComponent(
                    item.fullPath
                )}?alt=media`
        ),
    ];
};


import { list, ref } from "firebase/storage";
import { storage } from "../firebase.service";

export const listAllTrackSkins = async (): Promise<string[]> => {
    const folderRef = ref(storage, "marble_race/track_skins");
    const listResult = await list(folderRef, { maxResults: 5 });
    return listResult.items.map(
        (item) =>
            `https://voxaudio.nusic.fm/${encodeURIComponent(
                item.fullPath
            )}?alt=media`
    );
};
export const listAllTrackBackgrounds = async (): Promise<string[][]> => {
    const folderRef = ref(storage, "marble_race/backgrounds");
    const listResult = await list(folderRef, { maxResults: 5 });
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

export const listAllTrails = async (): Promise<string[]> => {
    const folderRef = ref(storage, "marble_race/trails");
    const listResult = await list(folderRef, { maxResults: 5 });
    return listResult.items.map(
        (item) =>
            `https://voxaudio.nusic.fm/${encodeURIComponent(
                item.fullPath
            )}?alt=media`
    );
};


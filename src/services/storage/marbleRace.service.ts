import { listAll, ref } from "firebase/storage";
import { storage } from "../firebase.service";

export const listAllTrackSkins = async (): Promise<string[]> => {
    const folderRef = ref(storage, "marble_race/track_skins");
    const listResult = await listAll(folderRef);
    return listResult.items.map(
        (item) =>
            `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/${encodeURIComponent(
                item.fullPath
            )}?alt=media`
    );
};
export const listAllTrackBackgrounds = async (): Promise<string[]> => {
    const folderRef = ref(storage, "marble_race/backgrounds");
    const listResult = await listAll(folderRef);
    return listResult.items.map(
        (item) =>
            `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/${encodeURIComponent(
                item.fullPath
            )}?alt=media`
    );
};


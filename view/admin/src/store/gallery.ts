import { defineStore } from "pinia";
interface State {
    topGalleryId: any;
    galleryId: number;
    page: number;
    sortOrder: string;
}
export const useGalleryStore = defineStore("gallery", {
    state: (): State => {
        return {
            topGalleryId: 0,
            galleryId: 0,
            page: 1,
            sortOrder: "desc"
        };
    },
    getters: {}
});

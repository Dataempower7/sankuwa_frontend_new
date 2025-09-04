import { getPromotion } from "@/api/product/product";
interface PromotionFilterParams {
    products: Products[];
    shop_id?: number;
    from?: string;
}
interface Products {
    product_id: number;
    sku_id?: number;
}
// const promotionList = ref<{ [key: string]: PromotionList[] }>({} as { [key: string]: PromotionList[] });
const getPromotionList = async (data: PromotionFilterParams) => {
    try {
        const result = await getPromotion({
            products: data.products,
            shop_id: data.shop_id,
            from: data.from
        });
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export default getPromotionList;

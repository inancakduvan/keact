import { typeSafeKeact } from "@inancakduvan/keact";
import { BasketProduct, ProductsResponse } from "@/types/types";

interface KeactStore {
    basket: Array<BasketProduct>,
    favs: ProductsResponse
}

export const useKeact = typeSafeKeact<KeactStore>();

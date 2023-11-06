import { json2csv } from "json-2-csv";
export class CSVFormatter {
    async format(products, categories, option) {
        const mappedCategories = {};
        categories?.forEach(({ id, name }) => mappedCategories[id] = name);
        const getParams = (product) => {
            const params = {};
            if (!option?.splitParams)
                return params;
            product.params?.forEach(({ key, value }) => params[`Param [${key}]`] = value);
            return params;
        };
        const data = products.map(product => ({
            ...product,
            category: mappedCategories[product.categoryId],
            images: product.images?.join(","),
            videos: product.videos?.join(","),
            tags: product.tags?.join(","),
            codesTN: product.codesTN?.join(", "),
            params: product.params?.map(({ key, value }) => `${key}=${value}`).join(","),
            ...getParams(product)
        }));
        return json2csv(data, { emptyFieldValue: "" });
    }
}
//# sourceMappingURL=CSV.formatter.js.map
import {Product, Vat, Currency, Category} from "../src/types";
import { expect, describe, it} from 'vitest'
import {Formatters} from "../src";


describe('CSVConverter', () => {
    const formatter = Formatters.CSV;


    it('should export CSV data', async () => {
        const products: Product[] = [
            {
                productId: 1,
                parentId: 0,
                variantId: 1111,
                currency: Currency.RUR,
                title: "Title",
                description: "Description",
                vendor: "Nike",
                vendorCode: "NIKE-1111",
                categoryId: 1,
                countryOfOrigin: "Китай",
                images: ["image1", "image2"],
                price: 19000,
                oldPrice: 20000,
                additionalExpenses: 1000,
                purchasePrice: 15000,
                available: true,
                barcode: "567890567893",
                weight: 0.15,
                dimensions: "12/32/43",
                vat: Vat.VAT_20,
                count: 24,
                params: [{
                    key: "p1",
                    value: "v1"
                }, {
                    key: "p2",
                    value: "v2"
                }],
                age: {
                    unit: "year",
                    value: 6
                },
                tags: ["Nike", "Кроссовки"],
                adult: false
            }
        ];
        const categories: Category[] = [
            {id: 1, parentId: 2, name: "Обувь"},
            {id: 2, parentId: 3, name: "Одежда, обувь и аксессуары"},
            {id: 3, name: "Все товары"},
        ];
        const resultSplit = await formatter.format(products, categories, {splitParams: true});
        const expectedResultSplit = "productId,parentId,variantId,currency,title,description,vendor,vendorCode,categoryId,countryOfOrigin,images,price,oldPrice,additionalExpenses,purchasePrice,available,barcode,weight,dimensions,vat,count,params,age.unit,age.value,tags,adult,category,videos,codesTN,Param [p1],Param [p2]\n1,0,1111,RUR,Title,Description,Nike,NIKE-1111,1,Китай,\"image1,image2\",19000,20000,1000,15000,true,567890567893,0.15,12/32/43,VAT_20,24,\"p1=v1,p2=v2\",year,6,\"Nike,Кроссовки\",false,Обувь,,,v1,v2";
        expect(resultSplit).toBe(expectedResultSplit);

        const result = await formatter.format(products, categories);
        const expectedResult = "productId,parentId,variantId,currency,title,description,vendor,vendorCode,categoryId,countryOfOrigin,images,price,oldPrice,additionalExpenses,purchasePrice,available,barcode,weight,dimensions,vat,count,params,age.unit,age.value,tags,adult,category,videos,codesTN\n1,0,1111,RUR,Title,Description,Nike,NIKE-1111,1,Китай,\"image1,image2\",19000,20000,1000,15000,true,567890567893,0.15,12/32/43,VAT_20,24,\"p1=v1,p2=v2\",year,6,\"Nike,Кроссовки\",false,Обувь,,";
        expect(result).toBe(expectedResult);
    });
});

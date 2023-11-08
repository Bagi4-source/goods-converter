import {describe, it} from "node:test";
import {GoodsExporter, Formatters, YMLFormatter, Transformer} from "../src";
import {Category, Currency, Product, Vat} from "../src/types";
import {expect} from "chai";


describe('GoodsExporter', () => {
    const exporter = new GoodsExporter();
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

    it('check export with transformers', async () => {
        const Transformers: Record<string, Transformer> = {
            PRICE: (product) => ({
                ...product,
                price: product.price + 10000
            }),
            IMAGE: (product) => ({
                ...product,
                images: product.images?.map(image => image.replace("image", "pic"))
            })
        }

        const keys = ["PRICE", "IMAGE"]

        exporter.setFormatter(Formatters.YML);
        exporter.setTransformers(keys.map(key => Transformers[key]));

        const result = await exporter.export(products, categories);
        const date = new Date().toISOString().replace(/.\d+Z/, '');
        const expectedResult = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><yml_catalog date="${date}"><shop><name>ShopName</name><company>CompanyName</company><categories><category id="1" parentId="2">Обувь</category><category id="2" parentId="3">Одежда, обувь и аксессуары</category><category id="3">Все товары</category></categories><offers><offer id="1111"><name>Title</name><price>29000</price><oldprice>20000</oldprice><purchase_price>15000</purchase_price><additional_expenses>1000</additional_expenses><currencyId>RUR</currencyId><categoryId>1</categoryId><vendor>Nike</vendor><vendorCode>NIKE-1111</vendorCode><picture>pic1</picture><picture>pic2</picture><available>true</available><param name="p1">v1</param><param name="p2">v2</param><description><![CDATA[Description]]></description><country_of_origin>Китай</country_of_origin><barcode>567890567893</barcode><vat>VAT_20</vat><count>24</count><set-ids>Nike, Кроссовки</set-ids><adult>false</adult><weight>0.15</weight><dimensions>12/32/43</dimensions><age unit="year">6</age></offer></offers></shop></yml_catalog>`;
        expect(result).to.deep.equal(expectedResult);
    });
});

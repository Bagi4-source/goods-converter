import {CSVFormatter} from "./CSV.formatter";
import {YMLFormatter} from "./YML.formatter";
import {TildaFormatter} from "./Tilda.formatter";

export const Formatters = {
    CSV: new CSVFormatter(),
    YML: new YMLFormatter(),
    Tilda: new TildaFormatter(),
}

import { Extension } from "./formater.types";
import { YMLFormatter } from "./YML.formatter";

export class XMLFormatter extends YMLFormatter {
  public formatterName = "XML";
  public fileExtension = Extension.XML;
}

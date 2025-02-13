export interface Brand {
  /**
   * **ID бренда**
   *
   * Целое число
   */
  id: number;
  /**
   * **Название бренда**
   */
  name: string;
  /**
   * **Ссылка на изображение логотипа**
   */
  logoUrl?: string;
  /**
   * **Ссылка на изображение баннера**
   */
  coverURL?: string;
}

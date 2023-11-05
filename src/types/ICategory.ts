export interface ICategory {
    /**
     * **ID категории**
     *
     * Целое число
     */
    id:number
    /**
     * **ID родительской категории**
     *
     * Целое число
     */
    parentId?: number
    /**
     * **Название категории**
     */
    name: string
}
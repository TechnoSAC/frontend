/**
 * Product entity in the Catalog bounded context.
 * Represents a fuel product item in the catalog.
 *
 * @class Product
 */
export class Product {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number|string|null} [params.id=null] - Product identifier.
     * @param {string} [params.name=''] - Human-readable product name.
     * @param {string} [params.type=''] - Fuel type (e.g. GASOLINE_90, DIESEL_B5).
     * @param {string} [params.description=''] - Product description.
     * @param {number} [params.pricePerLiter=0] - Price per unit.
     * @param {string} [params.unit='GALLONS'] - Measurement unit.
     */
    constructor({
                    id = null,
                    name = '',
                    type = '',
                    description = '',
                    pricePerLiter = 0,
                    unit = 'GALLONS'
                }) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.description = description;
        this.pricePerLiter = pricePerLiter;
        this.unit = unit;
    }
}
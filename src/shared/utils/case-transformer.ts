export class CaseTransformer {
  /**
   * Convert a snake_case string to camelCase
   * @param {string} str - The snake_case string to convert
   * @returns {string} - The camelCase string
   */
  static toSnakeToCamelCase(str) {
    if (typeof str !== "string") return str;

    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  /**
   * Convert a camelCase string to snake_case
   * @param {string} str - The camelCase string to convert
   * @returns {string} - The snake_case string
   */
  static toCamelToSnakeCase(str) {
    if (typeof str !== "string") return str;

    return str.replace(
      /([A-Z])/g,
      (match, letter) => `_${letter.toLowerCase()}`
    );
  }

  /**
   * Transform object keys from snake_case to camelCase recursively
   * @param {any} obj - The object to transform
   * @returns {any} - The transformed object with camelCase keys
   */
  static transformSnakeToCamel(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformSnakeToCamel(item));
    }

    const transformed = {};

    for (const [key, value] of Object.entries(obj)) {
      const camelKey = this.toSnakeToCamelCase(key);
      transformed[camelKey] = this.transformSnakeToCamel(value);
    }

    return transformed;
  }

  /**
   * Transform object keys from camelCase to snake_case recursively
   * @param {any} obj - The object to transform
   * @returns {any} - The transformed object with snake_case keys
   */
  static transformCamelToSnake(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformCamelToSnake(item));
    }

    const transformed = {};

    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = this.toCamelToSnakeCase(key);
      transformed[snakeKey] = this.transformCamelToSnake(value);
    }

    return transformed;
  }

  /**
   * Main transformer method - converts snake_case to camelCase
   * @param {Object} obj - The object with snake_case keys
   * @returns {Object} - The transformed object with camelCase keys
   */
  static snakeToCamel(obj) {
    return this.transformSnakeToCamel(obj);
  }

  /**
   * Main transformer method - converts camelCase to snake_case
   * @param {Object} obj - The object with camelCase keys
   * @returns {Object} - The transformed object with snake_case keys
   */
  static camelToSnake(obj) {
    return this.transformCamelToSnake(obj);
  }
}

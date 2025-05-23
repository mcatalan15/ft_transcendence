import { Point } from '../point/Point';
import type { PointData } from '../point/PointData';
interface TransformableObject {
    position: PointData;
    scale: PointData;
    pivot: PointData;
    skew: PointData;
    rotation: number;
}
/**
 * A fast matrix for 2D transformations.
 * ```js
 * | a | c | tx|
 * | b | d | ty|
 * | 0 | 0 | 1 |
 * ```
 * @memberof maths
 */
export declare class Matrix {
    /** @default 1 */
    a: number;
    /** @default 0 */
    b: number;
    /** @default 0 */
    c: number;
    /** @default 1 */
    d: number;
    /** @default 0 */
    tx: number;
    /** @default 0 */
    ty: number;
    /** An array of the current matrix. Only populated when `toArray` is called */
    array: Float32Array | null;
    /**
     * @param a - x scale
     * @param b - y skew
     * @param c - x skew
     * @param d - y scale
     * @param tx - x translation
     * @param ty - y translation
     */
    constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number);
    /**
     * Creates a Matrix object based on the given array. The Element to Matrix mapping order is as follows:
     *
     * a = array[0]
     * b = array[1]
     * c = array[3]
     * d = array[4]
     * tx = array[2]
     * ty = array[5]
     * @param array - The array that the matrix will be populated from.
     */
    fromArray(array: number[]): void;
    /**
     * Sets the matrix properties.
     * @param a - Matrix component
     * @param b - Matrix component
     * @param c - Matrix component
     * @param d - Matrix component
     * @param tx - Matrix component
     * @param ty - Matrix component
     * @returns This matrix. Good for chaining method calls.
     */
    set(a: number, b: number, c: number, d: number, tx: number, ty: number): this;
    /**
     * Creates an array from the current Matrix object.
     * @param transpose - Whether we need to transpose the matrix or not
     * @param [out=new Float32Array(9)] - If provided the array will be assigned to out
     * @returns The newly created array which contains the matrix
     */
    toArray(transpose?: boolean, out?: Float32Array): Float32Array;
    /**
     * Get a new position with the current transformation applied.
     * Can be used to go from a child's coordinate space to the world coordinate space. (e.g. rendering)
     * @param pos - The origin
     * @param {Point} [newPos] - The point that the new position is assigned to (allowed to be same as input)
     * @returns {Point} The new point, transformed through this matrix
     */
    apply<P extends PointData = Point>(pos: PointData, newPos?: P): P;
    /**
     * Get a new position with the inverse of the current transformation applied.
     * Can be used to go from the world coordinate space to a child's coordinate space. (e.g. input)
     * @param pos - The origin
     * @param {Point} [newPos] - The point that the new position is assigned to (allowed to be same as input)
     * @returns {Point} The new point, inverse-transformed through this matrix
     */
    applyInverse<P extends PointData = Point>(pos: PointData, newPos?: P): P;
    /**
     * Translates the matrix on the x and y.
     * @param x - How much to translate x by
     * @param y - How much to translate y by
     * @returns This matrix. Good for chaining method calls.
     */
    translate(x: number, y: number): this;
    /**
     * Applies a scale transformation to the matrix.
     * @param x - The amount to scale horizontally
     * @param y - The amount to scale vertically
     * @returns This matrix. Good for chaining method calls.
     */
    scale(x: number, y: number): this;
    /**
     * Applies a rotation transformation to the matrix.
     * @param angle - The angle in radians.
     * @returns This matrix. Good for chaining method calls.
     */
    rotate(angle: number): this;
    /**
     * Appends the given Matrix to this Matrix.
     * @param matrix - The matrix to append.
     * @returns This matrix. Good for chaining method calls.
     */
    append(matrix: Matrix): this;
    /**
     * Appends two matrix's and sets the result to this matrix. AB = A * B
     * @param a - The matrix to append.
     * @param b - The matrix to append.
     * @returns This matrix. Good for chaining method calls.
     */
    appendFrom(a: Matrix, b: Matrix): this;
    /**
     * Sets the matrix based on all the available properties
     * @param x - Position on the x axis
     * @param y - Position on the y axis
     * @param pivotX - Pivot on the x axis
     * @param pivotY - Pivot on the y axis
     * @param scaleX - Scale on the x axis
     * @param scaleY - Scale on the y axis
     * @param rotation - Rotation in radians
     * @param skewX - Skew on the x axis
     * @param skewY - Skew on the y axis
     * @returns This matrix. Good for chaining method calls.
     */
    setTransform(x: number, y: number, pivotX: number, pivotY: number, scaleX: number, scaleY: number, rotation: number, skewX: number, skewY: number): this;
    /**
     * Prepends the given Matrix to this Matrix.
     * @param matrix - The matrix to prepend
     * @returns This matrix. Good for chaining method calls.
     */
    prepend(matrix: Matrix): this;
    /**
     * Decomposes the matrix (x, y, scaleX, scaleY, and rotation) and sets the properties on to a transform.
     * @param transform - The transform to apply the properties to.
     * @returns The transform with the newly applied properties
     */
    decompose(transform: TransformableObject): TransformableObject;
    /**
     * Inverts this matrix
     * @returns This matrix. Good for chaining method calls.
     */
    invert(): this;
    /** Checks if this matrix is an identity matrix */
    isIdentity(): boolean;
    /**
     * Resets this Matrix to an identity (default) matrix.
     * @returns This matrix. Good for chaining method calls.
     */
    identity(): this;
    /**
     * Creates a new Matrix object with the same values as this one.
     * @returns A copy of this matrix. Good for chaining method calls.
     */
    clone(): Matrix;
    /**
     * Changes the values of the given matrix to be the same as the ones in this matrix
     * @param matrix - The matrix to copy to.
     * @returns The matrix given in parameter with its values updated.
     */
    copyTo(matrix: Matrix): Matrix;
    /**
     * Changes the values of the matrix to be the same as the ones in given matrix
     * @param matrix - The matrix to copy from.
     * @returns this
     */
    copyFrom(matrix: Matrix): this;
    /**
     * check to see if two matrices are the same
     * @param matrix - The matrix to compare to.
     */
    equals(matrix: Matrix): boolean;
    toString(): string;
    /**
     * A default (identity) matrix.
     *
     * This is a shared object, if you want to modify it consider creating a new `Matrix`
     * @readonly
     */
    static get IDENTITY(): Readonly<Matrix>;
    /**
     * A static Matrix that can be used to avoid creating new objects.
     * Will always ensure the matrix is reset to identity when requested.
     * Use this object for fast but temporary calculations, as it may be mutated later on.
     * This is a different object to the `IDENTITY` object and so can be modified without changing `IDENTITY`.
     * @readonly
     */
    static get shared(): Matrix;
}
export {};

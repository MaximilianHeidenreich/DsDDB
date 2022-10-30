import { Md5 } from "../deps.ts";

/**
 * A super simple key-value database.
 * Keys always are strings.
 * Value type can be specified through generics.
 */
export class DsDDB<T> {
  // =====================    PROPS

  /**
   * Reference to the decoder which is used to load store files.
   */
  private _decoder: TextDecoder;

  /**
   * Reference to the encoder which is used to write store files.
   */
  private _encoder: TextEncoder;

  /**
   * The file path in which to store the data in.
   */
  private _storePath: string;

  /**
   * The actual data cache.
   */
  private _cache: { [name: string]: T };

  /**
   * The hashed value of currently cached data.
   */
  private _cacheHash: string;

  /**
   * Stores the last known hash from store file.
   */
  private _lastKnownStoreHash: string;

  // =====================    CONSTRUCTOR

  /**
   * Create a new {DsDDB} instance.
   * If no custom path is given, it defaults to mainModulePath/.store.json
   *
   * @param storePath A custom path where to write data
   */
  constructor(storePath?: string) {
    this._decoder = new TextDecoder("utf-8");
    this._encoder = new TextEncoder();

    this._storePath = storePath
      ? storePath
      : `${new URL(".", Deno.mainModule).pathname}.store.json`;
    this._cache = {};
    this._cacheHash = "";
    this._lastKnownStoreHash = "";
  }

  // =====================    DATA ACCESS

  /**
   * Retrieves a value from database by specified key.
   *
   * @param key The key
   * @returns The value
   */
  public get(key: string): T {
    return this._cache[key];
  }

  /**
   * 
   * @returns key/value pairs of the database
   */
  public getAll() {
    return Object.entries(this._cache)
  }

  /**
   * Set's a value in the database by the specified key.
   *
   * @param key The key
   * @param value The new value
   * @param override Whether to overide the value if it's already stored
   */
  public set(key: string, value: T, override = true) {
    // Prevent override.
    if (key in this._cache && !override) return;

    this._cache[key] = value;

    // Calculate new hash.
    let hash = new Md5();
    hash.update(JSON.stringify(this._cache.valueOf()));

    // Store new hash.
    this._cacheHash = hash.toString();
  }

  /**
   * Check whether a key is stored inside the database.
   *
   * @param key Lookup key
   * @returns Whether the key is stored in the database
   */
  public contains(key: string): boolean {
    return key in this._cache;
  }

  // =====================    MANAGEMENT

  /**
   * Writes cached data to disk.
   * Won't perform write if the last known hash from the store file
   * matches the current cache hash.
   *
   * @param storePath Custom file path used by write operation
   * @param force Ignore hashe comparison and force write
   */
  public async write(
    storePath?: string,
    force: boolean = false,
  ): Promise<void> {
    // Write probably not necessary.
    if (!force && this._lastKnownStoreHash === this._cacheHash) return;
    if (!storePath) storePath = this._storePath;

    // Write data.
    const data = JSON.stringify({ _hash: this._cacheHash, data: this._cache });
    return Deno.writeFile(storePath, this._encoder.encode(data));
  }

  /**
   * Load stored data from disk into cache.
   * Won't update cache values if hash in store file matches current cache file.
   * // TODO: Store & Check file hash.
   *
   * @param storePath Custom file path used by read operation
   * @param force Ignore hashe comparison and force read
   */
  public async load(
    storePath?: string,
    force: boolean = false,
  ): Promise<boolean> {
    if (!storePath) storePath = this._storePath;

    // Load data from file.
    let data: Uint8Array;
    try {
      data = await Deno.readFile(storePath);
    } catch (error) {
      // TODO: if verbose show error
      return false;
    }
    const decoded = JSON.parse(this._decoder.decode(data));

    // Reload probably not necessary.
    if (!force && decoded._hash === this._cacheHash) return true;

    // Store new data.
    this._cache = decoded.data;
    this._lastKnownStoreHash = decoded._hash;

    return true;
  }

  /**
   * Deletes a store file / directiory.
   *
   * @param storePath Custom path used by delete operation. Defaults to the default storage file path
   */
  public async deleteStore(storePath?: string): Promise<void> {
    if (!storePath) storePath = this._storePath;

    try {
      await Deno.remove(storePath);
    } catch (error) {
      // TODO: if verbose show error
    }
    return;
  }

  // =====================    GETTER & SETTER

  /**
   * Return internal storePath.
   */
  public get storePath(): string {
    return this._storePath;
  }

  /**
   * Set internal storePath.
   *
   * @param {string} storePath The new path
   */
  public set storePath(storePath: string) {
    this._storePath = storePath;
  }
}

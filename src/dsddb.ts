import { SEP } from "$std/path/mod.ts";
import hashStr from "./hash.ts";

interface KvDDBSchema<T> {
    _hash: number;
    data: Record<string, T>;
}
abstract class DDB {
	/**
	 * Path to folder in which to store data in.
	 */
	protected _storePath: string;

	constructor(storePath?: string) {
		if (storePath) this._storePath = storePath;
		else {
			const dir = `${new URL(".", Deno.mainModule).pathname}.dsddb`;
			const file = `.kvddb.json`;
			Deno.mkdirSync(dir, { recursive: true });
			this._storePath = `${dir}${SEP}${file}`;
		}
	}

	abstract write(force: boolean): Promise<boolean>;
	abstract load(force: boolean): Promise<boolean>;
	public async deleteStore() {}
}

/**
 * A super simple key-value database.
 * Key type has to be a string.
 * Value type can be specified through generic T.
 */
export class KvDDB<T> extends DDB implements Iterable<[string, T]> {
	/**
	 * The data cache.
	 */
	private _cache: Map<string, T>;

	/**
	 * The hashed value of currently cached data.
	 * Used to determine whether the cache has changed since the
	 * last write and needs to be written to store file.
	 */
	private _cacheHash: number;

	/**
	 * Stores the last known hash from store file.
	 * Compared agains _cahceHash to determine whether the cache
	 * has changed and needs to be written to store file.
	 */
	private _lastStoredHash: number;

	/**
	 * Creates a new Key-Value database bound to a specific file.
	 * @param storeFilePath Path to .json file in which to store data in.
	 */
	constructor(storeFilePath?: string) {
		super(storeFilePath);
		this._cache = new Map<string, T>();
		this._cacheHash = 0;
		this._lastStoredHash = 0;
	}

	// Pass through iterator from cache map.
	// Enables convenient for (const [key, value] of db) { ... } loops.
	public [Symbol.iterator]() {
		return this._cache.entries();
	}

	/**
	 * Updates the cache hash based on the current cache state.
	 */
	private _updateCacheHash() {
		// Stringify cache map & calculate new hash.
		this._cacheHash = hashStr(
			JSON.stringify(Object.fromEntries(this._cache)),
		);
	}

    /**
     * Loads the store file into the cache.
     * If the store file hash is the same as the current cache hash, operation will be skipped.
     * @param force Whether to force load, even if store file hash is the same as current cache hash.
     * @returns true when cache was updated, false otherwise.
     */
	public override async load(force = false): Promise<boolean> {
        const data = await Deno.readTextFile(this._storePath);
        const parsed = JSON.parse(data) as KvDDBSchema<T>;
        if (!force && parsed._hash === this._cacheHash) return false;

        // Store new data.
        this._cache = new Map(Object.entries(parsed.data));
        this._cacheHash = parsed._hash;
        this._lastStoredHash = parsed._hash;
        return true;
    }

	/**
	 * Writes the current cache to the store file.
	 * If the cache hash is the same as the last stored hash, operation will be skipped.
	 * @param force Force write, even if cache hash is the same as last stored hash.
	 * @returns true when store file was written, false otherwise.
	 */
	public override async write(force = false): Promise<boolean> {
		if (!force && this._cacheHash === this._lastStoredHash) {
			return false;
		}
        const data: KvDDBSchema<T> = {
            _hash: this._cacheHash,
			data: Object.fromEntries(this._cache)
        }
		const str = JSON.stringify(data);
		await Deno.writeTextFile(this._storePath, str, { create: true });
        return true;
	}

	/**
	 * Returns the value of a key if it exists.
	 * @param key The key to get the value of.
	 * @returns The value or null if it doesn't exist.
	 */
	public get(key: string): T | null {
		return this._cache.get(key) ?? null;
	}

	/*public getAll(): Record<string, T> {}*/

	/**
	 * Set's the value of the specified key.
	 * By default it will not override the value if key already exists.
	 * By default it will not save the new database state to store file.
	 * @param key The key to set the value of.
	 * @param value The value to set.
	 * @param override Whether to override the value if it already exists.
	 * @param write Whether to write the new database state to store file.
	 * @returns Whether the value has ben set.
	 */
	public set(key: string, value: T, override = true, write = false): boolean {
		if (this._cache.has(key) && !override) return false;
		this._cache.set(key, value);
		this._updateCacheHash();
		if (write) this.write(); // TODO: async in sync method?
		return true;
	}

	/**
	 * @param key The key to check for.
	 * @returns boolean indicating whether the key exists.
	 */
	public has(key: string): boolean {
		return this._cache.has(key);
	}

	/**
	 * @returns The number of entries in the database.
	 */
	public get size(): number {
		return this._cache.size;
	}

	/**
	 * @param key The key to delete.
	 * @returns true when the key has been deleted, false if it didn't exist.
	 */
	public delete(key: string): boolean {
		const res = this._cache.delete(key);
		if (res) this._updateCacheHash();
		return res;
	}

	/**
	 * Clears the database.
	 */
	public clear(): void {
		this._cache.clear();
	}

	public get cache() {
		return this._cache;
	}
}

/*export class DsDDB extends DDB {

}*/

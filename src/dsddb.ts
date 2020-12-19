import { createHash } from "https://deno.land/std@0.81.0/hash/mod.ts";
import { exists } from "https://deno.land/std@0.81.0/fs/mod.ts";

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
    private decoder: TextDecoder;

    /**
     * The file path in which to store the data in.
     */
    private storePath: string;

    /**
     * The actual data cache.
     */
    private cache: { [name: string]: T };

    /**
     * The hashed value of currently cached data.
     */
    private cacheHash: string;

    /**
     * Stores the last known hash from store file.
     */
    private lastKnownStoreHash: string;


    // =====================    CONSTRUCTOR

    /**
     * Create a new {DsDDB} instance.
     * If no custom path is given, it defaults to mainModulePath/.dsddb/store.json
     * 
     * @param {string} storePath A custom path where to write data
     */
    constructor(storePath?: string) {

        this.decoder = new TextDecoder('utf-8');

        this.storePath = storePath ? storePath : `${new URL('.', Deno.mainModule).pathname}.dsddb/store.json`;
        this.cache = {};
        this.cacheHash = "";
        this.lastKnownStoreHash = "";

    }


    // =====================    DATA ACCESS

    /**
     * Retrieves a value from database by specified key.
     * 
     * @param {string} key 
     * @returns {string} Value
     */
    public get(key: string): T {
        return this.cache[key];
    }

    /**
     * Set's a value in the database by the specified key.
     * 
     * @param {string} key 
     * @param {string} value 
     */
    public set(key: string, value: string) {

        this.cache[key] = value;

        // Calculate new hash.
        let hash = createHash("md5");
        hash.update(JSON.stringify(this.cache.valueOf()));

        // Store new hash.
        this.cacheHash = hash.toString();

    }

    /**
     * Check whether a key is stored inside the database.
     * 
     * @param {string} key Lookup key
     * @returns {boolean} Whether the key is stored in the database
     */
    public exists(key: string): boolean {
        return key in this.cache;
    }


    // =====================    MANAGEMENT

    /**
     * Writes cached data to disk.
     * Won't perform write if the last known hash from the store file 
     * matches the current cache hash.
     * 
     * @param {string} storePath Custom file path used by write operation
     * @param {boolean} force Ignore hashe comparison and force write
     */
    public async write(storePath?: string, force: boolean = false) {

        // Write probably not necessary.
        if (!force && this.lastKnownStoreHash === this.cacheHash) return;

        if (!storePath) storePath = this.storePath;

        // Write data.
        await Deno.writeTextFile(storePath, JSON.stringify({ _hash: this.cacheHash, data: this.cache }));
    
    }

    /**
     * Load stored data from disk into cache.
     * Won't update cache values if hash in store file matches current cache file.
     * // TODO: Store & Check file hash.
     * 
     * @param {string} storePath Custom file path used by read operation
     * @param {boolean} force Ignore hashe comparison and force read
     */
    public async load(storePath?: string, force: boolean = false) {

        if (!storePath) storePath = this.storePath;
        if (!await exists(storePath)) return;

        // Load data from file.
        const data = await Deno.readFile(storePath);
        const decoded = JSON.parse(this.decoder.decode(data))

        // Reload probably not necessary.
        if (!force && decoded._hash === this.cacheHash) return;
        
        // Store new data.
        this.cache = decoded.data;
        this.lastKnownStoreHash = decoded._hash;
        
    }

}
import { createHash } from "https://deno.land/std@0.81.0/hash/mod.ts";
import { exists } from "https://deno.land/std@0.81.0/fs/mod.ts";

/**
 * A super simple key-value database.
 */
export class DsDDB {

    // =====================    VARS

    /**
     * The file path in which to store the data in.
     */
    private storePath: string;

    /**
     * Reference to the decoder which is used to load store files.
     */
    private decoder: TextDecoder;

    /**
     * The actual data cache.
     */
    cache: { [name: string]: string };

    /**
     * Stores the last loaded hash from store data.
     */
    lastLoadStoreHash: string;


    // =====================    CONSTRUCTOR

    /**
     * TODO
     * @param {string} storePath TODO
     */
    constructor(storePath: string) {
        this.storePath = storePath;
        this.decoder = new TextDecoder('utf-8');
        this.cache = { _hash: "" };
        this.lastLoadStoreHash = "";
    }


    // =====================    ACCESS

    public get(key: string): string {
        return this.cache[key];
    }

    public set(key: string, value: string) {
        this.cache[key] = value;
        let values: { [name: string]: string } = {};
        Object.assign(values, this.cache);
        delete values["_hash"];
        let hash = createHash("md5");
        hash.update(JSON.stringify(values));
        this.cache["_hash"] = hash.toString();
    }


    // =====================    MANAGEMENT

    public write(storePath?: string, force: boolean = false) {
        if (!force && this.lastLoadStoreHash === this.cache["_hash"]) return;
        if (!storePath) storePath = this.storePath;
        Deno.writeTextFile(storePath, JSON.stringify(this.cache));
    }

    public async load(storePath?: string) {
        if (!storePath) storePath = this.storePath;
        if (!await exists(storePath)) return;
        const data = await Deno.readFile(storePath);
        const decoded = JSON.parse(this.decoder.decode(data))
        if (decoded._hash !== this.cache._hash) {
            this.cache = decoded;
            this.lastLoadStoreHash = decoded["_hash"];
        }
        
    }

    

}
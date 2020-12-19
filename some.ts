import { DsDDB } from "./src/dsddb.ts";

let db = new DsDDB("./store.dsddb");
await db.load();
db.set("hello", "worsad");
console.log(db.cache)
await db.write();


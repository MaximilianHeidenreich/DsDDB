import { KvDDB } from "../mod.ts";

// Create a new untyped database.
// The store file will be created in the same directory as the script.
//  -> ./examples/.dsddb/.kvddb.json
const db = new KvDDB();

// Set some values.
db.set("hello", "world");
db.set("foo", { bar: "baz" });
db.set("fizz", 123);

// Write the database to the store file.
db.write();
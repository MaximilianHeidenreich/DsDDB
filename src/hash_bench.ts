import hashStr from "./hash.ts";

// deno-lint-ignore no-explicit-any
function pickRng(arr: any[]) {
  return arr[Math.floor((Math.random()*arr.length))];
}
function makeid(length: number) {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function genObject(memberSize: number) {
    // deno-lint-ignore no-explicit-any
    const obj: {[key: string] : any} = {};
    const ops = [
        "string",
        "number",
        //"object",
        //"nestedObject"
    ]
    for (let i = 0; i < memberSize; i++) {
        const op = pickRng(ops);
        if (op === "string") {
            obj[i] = makeid(Math.random() * (200 - 5) + 5);
        }
        else if (op === "number") {
            obj[i] = Math.random() * (200000 - 5) + 5;
        }
        else if (op === "object") {
            obj[i] = genObject(Math.random() * (5 - 2) + 2);
        }
        else if (op === "nestedObject") {
            /*const depth = Math.random() * (10 - 2) + 2;
            // deno-lint-ignore ban-types
            let g = (o: {[key: string] : any}, d: number) => {
                if (d > 0) {
                    o[d] = g(genObject(Math.random() * (10 - 2) + 2), d - 1);
                    return o;
                }
                else return;
            }
            obj[i] = g({}, depth);*/
        }
    }
    return obj;
}

const obj1 = genObject(1);
Deno.bench("Hashing object size -> 1", () => {
    const _hash = hashStr(JSON.stringify(obj1));
});

const obj5 = genObject(5);
Deno.bench("Hashing object size -> 5", () => {
    const _hash = hashStr(JSON.stringify(obj5));
});

const obj20 = genObject(20);
Deno.bench("Hashing object size -> 20", () => {
    const _hash = hashStr(JSON.stringify(obj20));
});

const obj50 = genObject(50);
Deno.bench("Hashing object size -> 50", () => {
    const _hash = hashStr(JSON.stringify(obj50));
});

const obj100 = genObject(100);
Deno.bench("Hashing object size -> 100", () => {
    const _hash = hashStr(JSON.stringify(obj100));
});

const obj500 = genObject(500);
Deno.bench("Hashing object size -> 500", () => {
    const _hash = hashStr(JSON.stringify(obj500));
});

const obj1000 = genObject(1000);
Deno.bench("Hashing object size -> 1000", () => {
    const _hash = hashStr(JSON.stringify(obj1000));
});

const obj5000 = genObject(5000);
Deno.bench("Hashing object size -> 5000", () => {
    const _hash = hashStr(JSON.stringify(obj5000));
});

const obj10000 = genObject(10000);
Deno.bench("Hashing object size -> 10000", () => {
    const _hash = hashStr(JSON.stringify(obj10000));
});
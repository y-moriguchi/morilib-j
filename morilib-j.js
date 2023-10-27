/**
 * Morilib J
 *
 * Copyright (c) 2023 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
function MorilibJ() {
    const undef = void 0;
    const inf = Number.POSITIVE_INFINITY;
    const $0 = false;
    const $1 = true;
    const A = Argument({ defaultAction: () => { throw new NotMatchedException("Not Matched") } });
    const M = MonadicParser(/[ \t]+/y);
    const $ = x => (console.log(x), x);

    const epsilon = 1e-8;

    const variables = new Map();
    const NOTDEFINED = Symbol("not defined yet");

    class Exception extends Error { }

    function error(msg) {
        throw new Exception(msg);
    }

    class NotMatchedException extends Exception { }

    function uncatchable(msg) {
        throw new Error(msg);
    }

    function expandObject(a, b, f) {
        for(let i in b) {
            if(b.hasOwnProperty(i)) {
                a[i] = f(b[i]);
            }
        }
        return a;
    }

    function mergeObject(a, b) {
        const result = {};

        for(let i in a) {
            if(a.hasOwnProperty(i)) {
                result[i] = a[i];
            }
        }
        return expandObject(result, b, x => x);
    }

    const gcd = (value1, value2) => {
        if(value1 === 0) {
            return Math.abs(value2);
        } else if(value2 === 0) {
            return Math.abs(value1);
        }

        let v1 = Math.max(Math.abs(value1), Math.abs(value2));
        let v2 = Math.min(Math.abs(value1), Math.abs(value2));

        while(v2 > 0) {
            const r = v1 % v2;

            v1 = v2;
            v2 = r;
        }
        return v1;
    };

    const lcm = (value1, value2) => {
        if(value1 === 0 && value2 === 0) {
            return 0;
        }

        const gcd0 = gcd(value1, value2);

        return (value1 / gcd0) * value2;
    };

    class Empty {
        constructor(shape) {
            this._shape = shape;
        }

        shape() {
            return this._shape.slice();
        }
    }

    const makeEmpty = (...shape) => new Empty(shape);
    const getEmptyShape = empty => empty.shape();
    const isEmpty = a => a instanceof Empty;

    // array library
    function mapDeep(f, x, y) {
        const len = Math.max(x.length, y.length);
        const result = [];

        for(let i = 0; i < len; i++) {
            result.push(f(x[i], y[i]));
        }
        return result;
    }

    function* walkArray(anArray, predArray, depth) {
        if(depth === 0 || !predArray(anArray)) {
            yield anArray;
        } else {
            for(let i = 0; i < anArray.length; i++) {
                yield* walkArray(anArray[i], predArray, depth - 1);
            }
        }
    }

    function makeGenerator(anArray, predArray, depth) {
        const depth2 = depth ?? Number.POSITIVE_INFINITY;
        let walk = null;

        function* inner() {
            while(true) {
                if(walk === null) {
                    walk = walkArray(anArray, predArray, depth);
                } else {
                    const result = walk.next();

                    if(result.done) {
                        walk = null;
                    } else {
                        yield result.value;
                    }
                }
            }
        };
        return inner();
    }

    function reduceDeep(anArray, f, init, depth) {
        if(!Array.isArray(anArray)) {
            return anArray;
        } else if(anArray.length === 0) {
            return [];
        } else if(depth === 0 || anArray.every(x => !Array.isArray(x))) {
            return anArray.reduce(f, init);
        } else if(anArray.every(x => x.length === 0)) {
            return [];
        } else if(anArray.every(x => Array.isArray(x))) {
            const maxLength = anArray.reduce((accum, x) => Math.max(accum, x.length), -1);
            const result = [];

            for(let i = 0; i < maxLength; i++) {
                const ptr = anArray.map(x => x[i]);

                if(depth === 0 || !Array.isArray(ptr) || !Array.isArray(ptr[0])) {
                    result.push(ptr.reduce(f, init));
                } else {
                    result.push(reduceDeep(ptr, f, init, depth - 1));
                }
            }
            return result;
        } else {
            error("Invalid array", anArray);
        }
    }

    const getCols = y => reduceDeep(y, (accum, x) => accum.concat([x]), [], getRank(y) - 1);

    function outer(array1, array2, f, depth) {
        function outerArray(vs, d, objects) {
            return objects.length === 0
                   ? f(...vs)
                   : d !== 0 && Array.isArray(objects[0])
                   ? objects[0].map(x => outerArray(vs, d - 1, [x].concat(objects.slice(1))))
                   : outerArray(vs.concat([objects[0]]), depth, objects.slice(1));
        }
        return outerArray([], depth, [array1, array2]);
    }

    const sortPred = y => {
        if(isNumber(y)) {
            return 0;
        } else if(isString(y)) {
            return 1;
        } else if(isArray(y)) {
            return 2;
        } else {     // box
            return 3;
        }
    };

    const compareArray = (x, y) => {
        const shapeDiff = getShape(x).length - getShape(y).length;

        if(shapeDiff !== 0) {
            return shapeDiff;
        } else {
            for(let i = 0; i < Math.min(x.length, y.length); i++) {
                const cResult = compareFunction(x[i], y[i]);

                if(cResult !== 0) {
                    return cResult;
                }
            }
            return x.length - y.length;
        }
    };

    const compareFunction = (x, y) => {
        const predx = sortPred(x);
        const predy = sortPred(y);

        if(predx !== predy) {
            return predx - predy;
        } else if(isNumber(x)) {
            return toReal(x) - toReal(y);
        } else if(isString(x)) {
            return x.codePointAt(0) - y.codePointAt(0);
        } else if(isArray(x)) {
            return compareArray(x, y);
        } else if(isBox(x)) {
            return compareFunction(unbox(x), unbox(y));
        }
    };

    function sortIndex(anArray, cmp) {
        const cf = cmp;
        let indices;

        function merge(indices1, indices2) {
            const result = [];

            while(indices1.length > 0 || indices2.length > 0) {
                if(indices1.length === 0) {
                    result.push(indices2.shift());
                } else if(indices2.length === 0) {
                    result.push(indices1.shift());
                } else if(cf(anArray[indices1[0]], anArray[indices2[0]]) <= 0) {
                    result.push(indices1.shift());
                } else {
                    result.push(indices2.shift());
                }
            }
            return result;
        }

        function mergeSort(indices) {
            if(indices.length <= 1) {
                return indices;
            } else {
                const last = indices.splice(Math.floor(indices.length / 2));

                return merge(mergeSort(indices), mergeSort(last));
            }
        }
        return !Array.isArray(anArray)
               ? error("Array required", anArray)
               : mergeSort(iota(anArray.length));
    }

    function reshapeBase(gene, depth, anArray, ...shape) {
        const generateObject = gene(anArray, isArray, depth);
        const genf = () => generateObject.next().value;
        const shp = shape.map(v => toReal(v));

        function inner(shape) {
            function repeat(times, f) {
                return times > 0
                       ? [f()].concat(repeat(times - 1, f))
                       : [];
            }

            return shape.length > 1
                   ? repeat(shape[0], () => inner(shape.slice(1)))
                   : repeat(shape[0], genf);
        }

        return !isArray(anArray) || isEmpty(anArray)
               ? error("Array must not be empty")
               : shp.some(v => v < 0)
               ? error("Shape must not be negative: " + shape)
               : shp.some(v => !Number.isSafeInteger(v))
               ? error("Shape must be integer: " + shape)
               : shp.some(v => v === 0)
               ? error("empty arrays are not supported")
               //? makeEmpty(...shp)
               : inner(shp);
    }

    const reshape = (anArray, ...shape) => reshapeBase(makeGenerator, Math.min(getShape(anArray).length, shape.length), anArray, ...shape);

    function T(anArray) {
        const fn = (accum, x) => accum.concat([x]);

        function inner(anArray, axis) {
            const isEnd = (anArray, axis) => axis === 0 ? anArray.length === 0 : isEnd(anArray[0], axis - 1);
            const getHeads = (anArray, axis) => axis <= 1 ? anArray.map(x => x[0]).reduce(fn, []) : anArray.map(x => getHeads(x, axis - 1));
            const getTails = (anArray, axis) => axis <= 1 ? anArray.map(x => x.slice(1)).reduce(fn, []) : anArray.map(x => getTails(x, axis - 1));

            if(axis === 1) {
                return reduceDeep(anArray, fn, []);
            } else {
                const result = [];

                for(let a = anArray; !isEnd(a, axis); a = getTails(a, axis)) {
                    result.push(inner(getHeads(a, axis), axis - 1));
                }
                return result;
            }
        }

        const arrayRank = getShape(anArray);

        return arrayRank === null
               ? error("proper array required", anArray)
               : arrayRank.length <= 1
               ? anArray
               : inner(anArray, arrayRank.length - 1);
    }

    function getIndex(array1, indexVector) {
        return !Array.isArray(array1)
               ? array1
               : indexVector.length === 0
               ? array1
               : !Number.isSafeInteger(indexVector[0]) || indexVector[0] < 0 || indexVector[0] >= array1.length
               ? error("Invalid index", indexVector[0])
               : getIndex(array1[indexVector[0]], indexVector.slice(1));
    }

    function setIndex(array1, indexVector, value) {
        if(array1[indexVector[0]] === undef) {
            array1[indexVector[0]] = [];
        }

        if(!Number.isSafeInteger(indexVector[0]) || indexVector[0] < 0 || indexVector[0] >= array1.length) {
            error("Invalid index", indexVector[0])
        } else if(indexVector.length > 1) {
            setIndex(array1[indexVector[0]], indexVector.slice(1), value);
        } else {
            array1[indexVector[0]] = value;
        }
    }

    function transpose(anArray, ...axes) {
        const result = [];

        function setArray(a, result, indices, i) {
            if(i === indices.length - 1) {
                result[indices[axes[i]]] = a;
            } else {
                if(result[indices[axes[i]]] === undef) {
                    result[indices[axes[i]]] = [];
                }
                setArray(a, result[indices[axes[i]]], indices, i + 1);
            }
        }

        function inner(a, indices) {
            return Array.isArray(a)
                   ? a.map((x, i) => inner(x, indices.concat([i])))
                   : setArray(a, result, indices, 0)
        }

        function diagonal(max, rankVector, inIndices, outIndices) {
            if(outIndices.length < max + 1) {
                const dest = axes.indexOf(outIndices.length);

                for(let i = 0; i < rankVector[dest]; i++) {
                    for(let j = 0; j < axes.length; j++) {
                        if(axes[j] === outIndices.length) {
                            inIndices[j] = i;
                        }
                    }
                    diagonal(max, rankVector, inIndices, outIndices.concat([i]));
                }
            } else {
                setIndex(result, outIndices, getIndex(anArray, inIndices));
            }
        }

        if(axes.some(x => typeof x !== "number")) {
            error("illegal argument", axes);
        } else {
            const sorted = axes.slice().sort();
            const max = Math.max(...sorted);
            const check = max >= axes.length ? error("Invalid axes", axes) : new Array(max);
            const isDiagonal = max < axes.length - 1;
            const arrayRank = getShape(anArray);

            for(let i = 0; i < axes.length; i++) {
                check[sorted] = sorted[i];
            }

            if(check.some(x => !x)) {
                error("illegal argument", axes);
            } else if(arrayRank === null || arrayRank.length !== axes.length) {
                error("illegal array");
            } else {
                isDiagonal ? diagonal(max, arrayRank, [], []) : inner(anArray, []);
                return result;
            }
        }
    }

    const makeFillGenerator = fillerBase => (anArray, predArray) => {
        let filler = null;
        let walk = null;
        let result = null;

        function* inner() {
            while(true) {
                if(walk === null) {
                    walk = walkArray(anArray, predArray, Number.POSITIVE_INFINITY);
                } else if(result === null) {
                    result = walk.next();
                    if(filler === null) {
                        filler = fillerBase ?? getFiller(result.value);
                    }
                } else if(result.done) {
                    yield filler;
                } else if(!result.done) {
                    yield result.value;
                    result = walk.next();
                }
            }
        };
        return inner();
    }

    const fillCommaColon = (anArray, ...shape) => reshapeBase(makeFillGenerator(), null, anArray, ...shape);
    const fillBangDot = filler => (anArray, ...shape) => reshapeBase(makeFillGenerator(filler), null, anArray, ...shape);

    function shape1(anObject, predArray) {
        function concatIsNotNull(a1, obj1) {
            return obj1 === null ? null : a1.concat(obj1);
        }

        function isProper(anObject) {
            return !predArray(anObject) ||
                   anObject.every(x => !predArray(x)) ||
                   anObject.every(x => predArray(x) && isProper(x));
        }

        return !isProper(anObject)
               ? null
               : !predArray(anObject)
               ? []
               : anObject.length === 0
               ? [0]
               : anObject.every(x => !predArray(x))
               ? [anObject.length]
               : anObject.every(x => predArray(x) && x.length === anObject[0].length)
               ? concatIsNotNull([anObject.length], getShape(anObject[0]))
               : null;
    }

    const getShape = anObject => shape1(anObject, isArray);
    //const isEmpty = a => a.length === 0;

    function getFiller(a) {
        return isArray(a) && a.length > 0
               ? getFiller(a[0])
               : isArray(a)
               ? 0
               : isNumber(a)
               ? 0
               : isString(a)
               ? ' '
               : isEmpty(a)
               ? 0
               : isBox(a)
               ? 0
               : uncatchable("Internal error: bad value: " + a);
    }

    function makeFiller(filler, rank, i) {
        if(i >= rank.length) {
            return filler;
        } else {
            const result = [];

            for(let j = 0; j < rank[i]; j++) {
                result.push(makeFiller(filler, rank, i + 1));
            }
            return result;
        }
    }

    const fillDimension = anArray => {
        const dim = anArray.reduce((accum, v) => Math.max(accum, v === null ? 0 : v.length), 0);
        const fil = new Array(dim).fill(1);
        const result = anArray.map(v => v === null ? fil.slice() : v.length < dim ? fil.slice(0, dim - v.length).concat(v) : v);

        return result;
    };

    function getEnvelope(a) {
        const aux = applied => {
            if(applied.every(v => v === null)) {
                return [a.length];
            } else {
                const ap0 = applied[0];
                let max = ap0;

                for(let i = 1; i < a.length; i++) {
                    if(applied[i] === null || applied[i].length !== ap0.length) {
                        return aux(fillDimension(applied));
                    } else {
                        max = mapDeep((v, w) => Math.max(v, w), max, applied[i]);
                    }
                }
                return [a.length].concat(max);
            }
        };

        if(isAtom(a)) {
            return null;
        } else if(a.length === 0) {
            return [];
        } else if(isArray(a) && isAtom(a[0])) {
            return [a.length];
        } else {
            return aux(a.map(v => getEnvelope(v)));
        }
    }

    function fillArray(a, filler) {
        const envelop = getEnvelope(a);

        function inner(a, depth) {
            if(a.length === 0 || envelop === null) {
                return a;
            } else if(isAtom(a)) {
                return envelop.length - depth > 0 ? fillBangDot(filler)([a], ...envelop.slice(depth)) : a;
            } else if(getEnvelope(a).length < envelop.length - depth) {
                return fillBangDot(filler)(a, ...envelop.slice(depth));
            } else {
                const result = [];

                for(let i = 0; i < a.length; i++) {
                    result[i] = inner(a[i], depth + 1);
                }
                for(let i = a.length; i < envelop[depth]; i++) {
                    result[i] = makeFiller(filler, envelop, depth + 1);
                }
                return result;
            }
        }

        return inner(a, 0);
    }

    function fill(a, filler) {
        return isEmpty(a) && getEmptyShape(a).some(v => v === 0)
               ? a
               : isEmpty(a)
               ? reshape([0], ...getEmptyShape(a))
               : fillArray(a, filler ?? getFiller(a));
    }

    const POS = Symbol("part of sppech");
    const TOSTRING = Symbol("to string");
    const RANK = Symbol("rank");
    const ADVERB = 1;
    const CONJUNCTION = 2;
    const VERB = 3;
    const MONAD = 3;
    const DYAD = 4;

    const getToString = v => v[TOSTRING];

    const isArray = a => Array.isArray(a);

    const wrapNotMatched = (f, s) => (...args) => {
        try {
            return f(...args);
        } catch(e) {
            if(e instanceof NotMatchedException) {
                error("Invalid Argument of " + s);
            } else {
                throw e;
            }
        }
    };

    const markVerb = (f, s, r) => {
        const g = wrapNotMatched((...args) => fill(f(...args)), s);

        g[POS] = VERB;
        g[TOSTRING] = s;
        g[RANK] = r;
        return g;
    };
    const markSimpleDyad = (f, s, r) => {
        return markVerb(A.pattern([{
            pattern: [A.pred(0, isEmpty), A.pred(1, isEmpty)],
            f: (x, y) => {
                const shpx = getEmptyShape(x);
                const shpy = getEmptyShape(y);

                for(let i = 0; i < Math.min(shpx.length, shpy.length); i++) {
                    if(shpx[i] !== shpy[i]) {
                        error("length error");
                    }
                }
                return shpx.length > shpy.length ? x : y;
            }
        },
        {
            pattern: A.pred(0, A.any),
            f: args => f(...args)
        }]), s, r);
    };
    const markEmptyDyadNotSupport = (f, s, r) => markVerb(A.pattern([{
        pattern: A.choice([A.pred(0, isEmpty), A.pred(1, A.any)], [A.pred(0, A.any), A.pred(1, isEmpty)]),
        f: (l, r) => error("Empty array is not support in verb " + s)
    },
    {
        pattern: A.pred(0, A.any),
        f: args => f(...args)
    }]), s, r);

    const markAdverb = (f, s) => {
        const g = wrapNotMatched(f, s);

        g[POS] = ADVERB;
        g[TOSTRING] = s;
        return g;
    };

    const markConjunction = (f, s) => {
        const g = wrapNotMatched(f, s);

        g[POS] = CONJUNCTION;
        g[TOSTRING] = s;
        return g;
    };

    const isNoun = x => x[POS] === undef;
    const isAtom = a => isNoun(a) && !isArray(a);
    const isSimpleString = a => isNoun(a) && (isArray(a) && typeof a[0] === "string" || typeof a === "string");
    const isVerb = x => x[POS] === VERB;
    const isAdverb = x => x[POS] === ADVERB;
    const isConjunction = x => x[POS] === CONJUNCTION;

    class Box {
        constructor(x) {
            this.box = x;
        }
    }

    const box = x => new Box(x);
    const unbox = A.pattern([{
        pattern: [A.pred(0, A.is(Box))],
        f: x => x.box
    }]);
    const isBox = b => b instanceof Box;

    class Gerand {
        constructor(v) {
            this.gerand = v;
        }
    }

    const gerand = v => new Gerand(v);
    const ungerand = A.pattern([{
        pattern: [A.pred(0, A.is(Gerand))],
        f: x => x.gerand
    }]);
    const isGerand = g => g instanceof Gerand;

    const isNumber = x => typeof x === "boolean" || typeof x === "number" /*|| typeof x === "bigint"*/;
    const isString = x => typeof x === "string";

    const isBoolean = x => typeof x === "boolean";
    const isReal = x => typeof x === "number";
    const toReal = x => isBoolean(x) ? (x ? 1 : 0) : x;
    const isNonNegative = n => n === true || n >= 0;
    const isNegative = n => typeof n !== "boolean" && n < 0;
    const isInteger = n => typeof n === "boolean" || Number.isSafeInteger(n);
    const isNonNegativeInteger = n => isInteger(n) && toReal(n) >= 0;

    const coercion = A.pattern([{
        pattern: [A.pred(0, isBoolean), A.pred(1, isReal)],
        f: (x, y) => [x ? 1 : 0, y]
    },
    {
        pattern: [A.pred(0, isNumber), A.pred(1, isNumber)],
        f: (x, y) => null
    }]);

    const fNumber = f => A.pattern([{
        pattern: [A.pred(0, isBoolean), A.pred(1, isBoolean)],
        f: (x, y) => f(x ? 1 : 0, y ? 1 : 0)
    },
    {
        pattern: [A.pred(0, isReal), A.pred(1, isReal)],
        f: (x, y) => f(x, y)
    },
    {
        pattern: [A.pred(0, isNumber), A.pred(1, isNumber)],
        f: (x, y) => {
            const c1 = coercion(x, y);
            const c2 = coercion(y, x);

            return c1 !== null ? fNumber(f)(...c1) : c2 !== null ? fNumber(f)(c2[1], c2[0]) : error("Invalid type");
        }
    }]);

    const fPlus = fNumber((x, y) => x + y);
    const fMinus = fNumber((x, y) => x - y);
    const fMul = fNumber((x, y) => x * y);
    const fDiv = fNumber((x, y) => x === 0 && y === 0 ? 0 : x / y);
    const fMod = fNumber((x, y) => x * y >= 0 ? x % y : y + x % y);
    const fMax = fNumber((x, y) => x > y ? x : y);
    const fMin = fNumber((x, y) => x < y ? x : y);
    const fGt = fNumber((x, y) => x > y);
    const fLt = fNumber((x, y) => x < y);
    const fGe = fNumber((x, y) => x >= y);
    const fLe = fNumber((x, y) => x <= y);

    const getNounType = A.pattern([{
        pattern: [A.pred(0, isNumber)],
        f: x => "number"
    },
    {
        pattern: [A.pred(0, A.type("string"))],
        f: x => "string"
    },
    {
        pattern: [A.pred(0, isBox)],
        f: x => "box"
    },
    {
        pattern: [A.pred(0, isGerand)],
        f: x => "gerand"
    },
    {
        pattern: [A.pred(0, A.empty)],
        f: x => "empty"
    },
    {
        pattern: [A.pred(0, isArray)],
        f: x => getNounType(x[0])
    }]);

    // arithmetic verbs
    function commutable(f, m, s) {
        const h = markSimpleDyad(A.pattern([{
            pattern: [A.pred(0, isNumber), A.pred(1, isNumber)],
            f: (x, y) => f(x, y)
        },
        {
            pattern: [A.pred(0, isArray), A.pred(1, isArray)],
            f: (x, y) => mapDeep((a, b) => h(a, b), x, y)
        },
        {
            pattern: A.choice([A.pred(0, isArray), A.pred(1, isNumber)], [A.pred(1, isNumber), A.pred(0, isArray)]),
            f: (a, y) => a.map(x => h(x, y))
        },
        {
            pattern: [A.pred(0, isNumber)],
            f: a => m(toReal(a))
        },
        {
            pattern: [A.pred(0, isArray)],
            f: a => a.map(v => m(h(v)))
        },
        {
            pattern: [A.pred(0, isEmpty)],
            f: a => a
        }]), s, [0, 0, 0]);

        return h;
    }

    const plus = commutable(fPlus, x => x, "+");
    const asterisk = commutable(fMul, x => x < 0 ? -1 : x > 0 ? 1 : 0, "*");

    const logicalOperation = (m, lg, f, s) => {
        const h = markSimpleDyad(A.pattern([{
            pattern: [A.pred(0, isBoolean), A.pred(1, isBoolean)],
            f: (x, y) => lg(x, y)
        },
        {
            pattern: [A.pred(0, isNumber), A.pred(1, isNumber)],
            f: (x, y) => f(toReal(x), toReal(y))
        },
        {
            pattern: [A.pred(0, isArray), A.pred(1, isArray)],
            f: (x, y) => mapDeep((a, b) => h(a, b), x, y)
        },
        {
            pattern: A.choice([A.pred(0, isArray), A.pred(1, isNumber)], [A.pred(1, isNumber), A.pred(0, isArray)]),
            f: (a, y) => a.map(x => h(x, y))
        },
        {
            pattern: [A.pred(0, isNoun)],
            f: y => error("monad +. is not supported")
        }]), s, [0, 0, 0]);

        return h;
    };

    const logicalOr = logicalOperation(x => x, (x, y) => x || y, (x, y) => gcd(x, y), "+.");
    const logicalAnd = logicalOperation(x => x, (x, y) => x && y, (x, y) => lcm(x, y), "*.");

    function computable(d, s) {
        const h = markSimpleDyad(A.pattern([{
            pattern: [A.pred(0, isNumber), A.pred(1, isNumber)],
            f: (x, y) => d(x, y)
        },
        {
            pattern: [A.pred(0, isArray), A.pred(1, isArray)],
            f: (x, y) => mapDeep((a, b) => h(a, b), x, y)
        },
        {
            pattern: [A.pred(0, isArray), A.pred(1, isNumber)],
            f: (a, y) => a.map(x => h(x, y))
        },
        {
            pattern: [A.pred(0, isNumber), A.pred(1, isArray)],
            f: (x, a) => a.map(y => h(x, y))
        }]), s, [0, 0, 0]);

        return h;
    }

    function invertable(m, d, s) {
        const c = computable(d, s);
        const h = markVerb(A.pattern([{
            pattern: [A.pred(0, isNumber)],
            f: x => m(x)
        },
        {
            pattern: [A.pred(0, isArray)],
            f: a => a.map(x => h(x))
        },
        {
            pattern: [A.pred(0, isEmpty)],
            f: a => a
        },
        {
            pattern: A.choice([A.pred(0, A.any)], [A.pred(0, A.any), A.pred(1, A.any)]),
            f: (x, y) => c(x, y)
        }]), s, [0, 0, 0]);

        return h;
    }

    const percent = invertable(x => 1 / toReal(x), (x, y) => fDiv(x, y), "%");
    const minus = invertable(x => fMinus(0, x), (x, y) => fMinus(x, y), "-");
    const bar = invertable(y => Math.abs(y), (x, y) => fMod(y, x), "|");
    const gtDot = invertable(x => isReal(x) ? Math.ceil(x) : x, (x, y) => fMax(x, y), ">.");
    const ltDot = invertable(x => isReal(x) ? Math.floor(x) : x, (x, y) => fMin(x, y), "<.");

    function computableMonad(m, s) {
        const h = markVerb(A.pattern([{
            pattern: [A.pred(0, isNumber)],
            f: x => m(x)
        },
        {
            pattern: [A.pred(0, isArray)],
            f: a => a.map(x => h(x))
        },
        {
            pattern: [A.pred(0, isEmpty)],
            f: a => a
        }]), s, [0, 0, 0]);

        return h;
    }

    const asteriskColon = computableMonad(x => fMul(x, x), "*:");
    const plusColon = computableMonad(x => fPlus(x, x), "+:");

    // TODO stub
    const minusDot = markVerb(A.pattern([{
        pattern: [A.pred(0, isBoolean)],
        f: y => !y
    },
    {
        pattern: [A.pred(0, v => isNumber(v) && v >= 0 && v <= 1)],
        f: y => 1 - toReal(y)
    },
    {
        pattern: [A.pred(0, isArray)],
        f: y => y.map(v => minusDot(v))
    }]), "-.", [0, inf, inf]);

    // mathematical verbs
    const percentColon = invertable(y => Math.sqrt(y), (x, y) => Math.pow(toReal(y), 1 / toReal(x)), "%:");
    const caret = invertable(y => Math.exp(y), (x, y) => Math.pow(toReal(x), toReal(y)), "^");
    const caretDotDyad = computable((x, y) => Math.log(y) / Math.log(x), "^.");
    const caretDotMonad = computableMonad(y => Math.log(y), "^.");
    const caretDot = markVerb(A.pattern([{
        pattern: [A.pred(0, isNoun)],
        f: y => caretDotMonad(y)
    },
    {
        pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
        f: (x, y) => caretDotDyad(x, y)
    }]), "^.", [0, 0, 0]);

    const trigonometric = (x, y) => {
        switch(toReal(x)) {
        case 0: return 1 - y * y;
        case 1: return Math.sin(y);
        case 2: return Math.cos(y);
        case 3: return Math.tan(y);
        case 4: return 1 + y * y;
        case 5: return Math.sinh(y);
        case 6: return Math.cosh(y);
        case 7: return Math.tanh(y);
        case 8: return -(1 + y * y);
        case 9: return y;
        case 10: return y;
        case 11: return 0;
        case 12: return y < 0 ? Math.PI : 0;
        case -1: return Math.asin(y);
        case -2: return Math.acos(y);
        case -3: return Math.atan(y);
        case -4: return -1 + y * y;
        case -5: return Math.asinh(y);
        case -6: return Math.acosh(y);
        case -7: return Math.atanh(y);
        case -8: return -(1 + y * y);
        case -9: return y;
        case -10: return y;
        case -11: error("Not supported _11 o. y");
        case -12: error("Not supported _12 o. y");
        default: error("Illegal nunber of o.: " + x);
        }
    };
    const oDot = invertable(y => y * Math.PI, (x, y) => trigonometric(x, y), "o.");

    // relation verbs
    function compare(cf, s) {
        const me = markSimpleDyad(A.pattern([{
            pattern: [A.pred(0, isNumber), A.pred(1, isNumber)],
            f: (x, y) => cf(x, y)
        },
        {
            pattern: [A.pred(0, isString), A.pred(1, isString)],
            f: (x, y) => cf(x, y)
        },
        {
            pattern: [A.pred(0, isArray), A.pred(1, isAtom)],
            f: (x, y) => x.map(a => cf(a, y))
        },
        {
            pattern: [A.pred(0, isAtom), A.pred(1, isArray)],
            f: (x, y) => y.map(a => cf(x, a))
        },
        {
            pattern: [A.pred(0, isArray), A.pred(1, isArray)],
            cond: (x, y) => x.length === y.length,
            f: (x, y) => mapDeep((a, b) => me(a, b), x, y)
        }]), s, [inf, 0, 0]);

        return me;
    }

    const gtDyad = compare((x, y) => fGt(x, y), ">");
    const ge = compare((x, y) => fGe(x, y), ">=");
    const eqDyad = compare((x, y) => x === y, "=");
    const ltDyad = compare((x, y) => fLt(x, y), "<");
    const le = compare((x, y) => fLe(x, y), ">=");

    const eq = markVerb(A.pattern([{
        pattern: [A.pred(0, isNoun)],
        f: y => error("monad = is not supported")
    },
    {
        pattern: [A.pred(0, A.any), A.pred(1, A.any)],
        f: (x, y) => eqDyad(x, y)
    }]), "=", [inf, 0, 0])

    const gt = markVerb(A.pattern([{
        pattern: [A.pred(0, isBox)],
        f: x => unbox(x)
    },
    {
        pattern: [A.pred(0, isArray)],
        cond: y => y.every(v => isBox(v)),
        f: y => y.map(v => gt(v))
    },
    {
        pattern: [A.pred(0, isNoun)],
        f: y => y
    },
    {
        pattern: [A.pred(0, A.any), A.pred(1, A.any)],
        f: (x, y) => gtDyad(x, y)
    }]), ">", [0, 0, 0]);

    const lt = markVerb(A.pattern([{
        pattern: [A.pred(0, A.any)],
        f: x => box(x)
    },
    {
        pattern: [A.pred(0, A.any), A.pred(1, A.any)],
        f: (x, y) => ltDyad(x, y)
    }]), "<", [0, 0, 0]);

    const tally = markEmptyDyadNotSupport(A.pattern([{
        pattern: [A.pred(0, isArray)],
        f: x => x.length
    },
    {
        pattern: [A.pred(0, isEmpty)],
        f: a => getEmptyShape(a)[0]
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        f: (x, y) => y.flatMap((w, i) => x[i] ? [w] : [])
    },
    {
        pattern: [A.pred(0, A.any)],
        f: x => 1
    }]), "#", [inf, $1, inf]);

    const gtColon = markVerb(A.pattern([{
        pattern: [A.pred(0, isArray)],
        f: x => x.map(a => gtColon(a))
    },
    {
        pattern: [A.pred(0, isNumber)],
        f: y => y + 1
    },
    {
        pattern: [A.pred(0, isEmpty)],
        f: a => a
    },
    {
        pattern: [A.pred(0, A.any), A.pred(1, A.any)],
        f: ge
    }]), ">:", [inf, inf, inf]);

    const ltColon = markVerb(A.pattern([{
        pattern: [A.pred(0, isArray)],
        f: x => x.map(a => ltColon(a))
    },
    {
        pattern: [A.pred(0, isNumber)],
        f: y => y - 1
    },
    {
        pattern: [A.pred(0, isEmpty)],
        f: a => a
    },
    {
        pattern: [A.pred(0, A.any), A.pred(1, A.any)],
        f: le
    }]), "<:", [inf, inf, inf]);

    const dollar = markEmptyDyadNotSupport(A.pattern([{
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        f: (shape, list) => reshape(list.map(v => toReal(v)), ...shape.map(v => toReal(v)))
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isNoun)],
        f: (shape, list) => dollar(shape, [list])
    },
    {
        pattern: [A.pred(0, isInteger), A.pred(1, isNoun)],
        f: (shape, list) => dollar([shape], list)
    },
    {
        pattern: [[0]],
        f: () => []
    },
    {
        pattern: [A.pred(0, isArray)],
        f: list => getShape(list)
    },
    {
        pattern: [A.pred(0, isEmpty)],
        f: a => getEmptyShape(a)
    },
    {
        pattern: [A.pred(0, isNoun)],
        f: list => []
    }]), "$", [inf, $1, inf]);

    function getEnvelopeFromShape(shpl, shpr) {
        const shpnew = [];

        if(shpl.length === shpr.length) {
            shpnew.push(shpl[0] + shpr[0]);
            for(let i = 1; i < shpl.length; i++) {
                shpnew.push(Math.max(shpl[i], shpr[i]));
            }
        } else if(shpl.length > shpr.length) {
            let i = 1;

            shpnew.push(shpl[0] + 1);
            for(; i < shpl.length - shpr.length; i++) {
                shpnew.push(shpl[i] > 0 ? shpl[i] : 1);
            }
            for(; i < shpl.length; i++) {
                shpnew.push(Math.max(shpl[i], shpr[i - shpl.length + shpr.length]));
            }
        } else {
            let i = 1;

            shpnew.push(shpr[0] + 1);
            for(; i < shpr.length - shpl.length; i++) {
                shpnew.push(shpr[i] > 0 ? shpr[i] : 1);
            }
            for(; i < shpr.length; i++) {
                shpnew.push(Math.max(shpr[i], shpl[i - shpr.length + shpl.length]));
            }
        }
        return shpnew;
    }

    const comma = markVerb(A.pattern([{
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        cond: (x, y) => getRank(x) === getRank(y) && getNounType(x) === getNounType(y),
        f: (x, y) => x.concat(y)
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        cond: (x, y) => getRank(x) === getRank(y) + 1 && getNounType(x) === getNounType(y),
        f: (x, y) => x.concat([y])
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        cond: (x, y) => getRank(x) + 1 === getRank(y) && getNounType(x) === getNounType(y),
        f: (x, y) => [x].concat(y)
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        cond: (x, y) => getRank(x) < getRank(y) && getNounType(x) === getNounType(y),
        f: (x, y) => comma([x], y)
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        cond: (x, y) => getRank(x) > getRank(y) && getNounType(x) === getNounType(y),
        f: (x, y) => comma(x, [y])
    },
    {
        pattern: [A.pred(0, isEmpty), A.pred(1, isEmpty)],
        f: (l, r) => makeEmpty(...getEnvelopeFromShape(getEmptyShape(l), getEmptyShape(r)))
    },
    {
        pattern: [A.pred(0, isEmpty), A.pred(1, isArray)],
        f: (l, r) => {
            const shpl = getEmptyShape(l);
            const shpr = getShape(r);
            const envelop = getEnvelopeFromShape(shpl, shpr);

            if(shpl.length > shpr.length) {
                if(envelop.every(v => v > 0)) {
                    envelop[0]--;
                    return comma(reshape([0], ...envelop), r);
                } else {
                    return makeEmpty(...envelop);
                }
            } else {
                if(envelop.every(v => v > 0)) {
                    return comma(reshape([0], ...shpl.map(v => Math.max(v, 1))), r);
                } else {
                    return makeEmpty(...envelop);
                }
            }
        }
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isEmpty)],
        f: (l, r) => {
            const shpl = getShape(l);
            const shpr = getEmptyShape(r);
            const envelop = getEnvelopeFromShape(shpl, shpr);

            if(shpr.length > shpl.length) {
                if(envelop.every(v => v > 0)) {
                    envelop[0]--;
                    return comma(l, reshape([0], ...envelop));
                } else {
                    return makeEmpty(...envelop);
                }
            } else {
                if(envelop.every(v => v > 0)) {
                    return comma(l, reshape([0], ...shpr.map(v => Math.max(v, 1))));
                } else {
                    return makeEmpty(...envelop);
                }
            }
        }
    },
    {
        // TODO this pattern is to be deleted
        pattern: [A.pred(0, isArray), A.pred(1, isNoun)],
        cond: (x, y) => x.length === 0,
        f: (x, y) => y
    },
    {
        pattern: [A.pred(0, isNoun), A.pred(1, isArray)],
        cond: (x, y) => getNounType(x) === getNounType(y),
        f: (x, y) => {
            const shp = getShape(y);

            return shp.length > 1
                   ? [reshape([x], ...shp.slice(1))].concat(y)
                   : [x].concat(y);
        }
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isNoun)],
        cond: (x, y) => getNounType(x) === getNounType(y),
        f: (x, y) => {
            const shp = getShape(x);

            return shp.length > 1
                   ? x.concat([reshape([y], ...shp.slice(1))])
                   : x.concat([y]);
        }
    },
    {
        pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
        cond: (x, y) => getNounType(x) === getNounType(y),
        f: (x, y) => [x, y]
    },
    {
        pattern: [A.pred(0, isArray)],
        f: y => Array.from(walkArray(y, isArray))
    },
    {
        pattern: [A.pred(0, isNoun)],
        f: y => [y]
    }]), ",", [inf, inf, inf]);

    const ravelItems = v => {
        let result = [];

        if(isArray(v)) {
            for(let i = 0; i < v.length; i++) {
                result = result.concat(v[i]);
            }
        } else {
            result.push(v);
        }
        return result;
    };

    // TODO stub
    const commaDot = markVerb(A.pattern([{
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        cond: (x, y) => x.length === y.length && getShape(x).length === getShape(y).length,
        f: (x, y) => {
            const result = [];

            for(let i = 0; i < x.length; i++) {
                if(isArray(x[i]) && isArray(y[i])) {
                    result.push(x[i].concat(y[i]));
                } else if(!isArray(x[i]) && !isArray(y[i])) {
                    result.push([x[i], y[i]]);
                }
            }
            return result;
        }
    },
    //{
    //    pattern: [A.pred(0, isArray), A.pred(1, isArray)],
    //    cond: (x, y) => x.length === y.length && getShape(x).length > getShape(y).length,
    //    f: (x, y) => y.map((v, i) => x[i].concat([makeFiller(v, getShape(x[i]).slice(1), 0)]))
    //},
    {
        pattern: [A.pred(0, isArray), A.pred(1, isAtom)],
        f: (x, y) => x.map(v => v.concat([makeFiller(y, getShape(v).slice(1), 0)]))
    },
    {
        pattern: [A.pred(0, isAtom), A.pred(1, isAtom)],
        f: (x, y) => [x, y]
    },
    {
        pattern: [A.pred(0, isArray)],
        f: y => y.map(v => ravelItems(v))
    }]), ",.", [inf, inf, inf]);

    // TODO stub
    const commaColon = markVerb(A.pattern([{
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        cond: (x, y) => getShape(x).length === getShape(y).length,
        f: (x, y) => [x, y]
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        cond: (x, y) => getShape(x).length === getShape(y).length - 1 && x.length === y[0].length,
        f: (x, y) => [x].concat(y)
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        cond: (x, y) => getShape(x).length > getShape(y).length,
        f: (x, y) => [x, fillCommaColon(y, ...getShape(x))]
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        cond: (x, y) => getShape(x).length < getShape(y).length,
        f: (x, y) => [fillCommaColon(x, ...getShape(y)), y]
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isAtom)],
        f: (x, y) => [x, makeFiller(y, getShape(x), 0)]
    },
    {
        pattern: [A.pred(0, isAtom), A.pred(1, isArray)],
        f: (x, y) => [makeFiller(x, getShape(y), 0), y]
    },
    {
        pattern: [A.pred(0, isNoun)],
        f: y => [y]
    }]), ",:", [inf, inf, inf]);

    const leftBrace = markVerb(A.pattern([{
        pattern: [A.pred(0, isNumber), A.pred(1, isArray)],
        cond: (x, y) => isInteger(x) && toReal(x) >= -y.length && toReal(x) < y.length,
        f: (x, y) => y.at(toReal(x))
    },
    {
        pattern: [A.pred(0, isBox), A.pred(1, isNoun)],
        cond: (x, y) => isArray(unbox(x)) && unbox(x).length === 0,
        f: (x, y) => y
    },
    {
        pattern: [A.pred(0, isBox), A.pred(1, isArray)],
        cond: (x, y) => isArray(unbox(x)) && isInteger(unbox(x)[0]) && toReal(unbox(x)[0]) >= -y.length && toReal(unbox(x)[0]) < y.length,
        f: (x, y) => leftBrace(box(unbox(x).slice(1)), y.at(unbox(x)[0]))
    },
    {
        pattern: [A.pred(0, isBox), A.pred(1, isArray)],
        cond: (x, y) => isBox(unbox(x))
            && isNumber(unbox(unbox(x)))
            && toReal(unbox(unbox(x))) >= -y.length
            && toReal(unbox(unbox(x))) < y.length,
        f: (x, y) => y.at(toReal(unbox(unbox(x))))
    },
    {
        pattern: [A.pred(0, isBox), A.pred(1, isArray)],
        cond: (x, y) => isArray(unbox(x))
            && isNumber(unbox(unbox(x)[0]))
            && toReal(unbox(unbox(x)[0])) >= -y.length
            && toReal(unbox(unbox(x)[0])) < y.length,
        f: (x, y) => leftBrace(box(unbox(x).slice(1)), y.at(toReal(unbox(unbox(x)[0]))))
    },
    {
        pattern: [A.pred(0, isBox), A.pred(1, isArray)],
        cond: (x, y) => isArray(unbox(x))
            && isArray(unbox(unbox(x)[0]))
            && unbox(unbox(x)[0]).every(v => isNumber(v) && toReal(v) >= -y.length && toReal(v) < y.length),
        f: (x, y) => unbox(unbox(x)[0]).map(v => leftBrace(box(unbox(x).slice(1)), y.at(v)))
    },
    {
        pattern: [A.pred(0, isBox), A.pred(1, isArray)],
        cond: (x, y) => isArray(unbox(x))
            && isNumber(unbox(unbox(unbox(x)[0])))
            && toReal(unbox(unbox(unbox(x)[0]))) >= -y.length
            && toReal(unbox(unbox(unbox(x)[0]))) < y.length,
        f: (x, y) => leftBrace(box(unbox(x).slice(1)), y.filter((_, i) => toReal(unbox(unbox(unbox(x)[0]))) !== i))
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        f: (x, y) => x.map(a => leftBrace(a, y))
    }]), "{", [$1, 0, inf]);

    function* iotaAux(x) {
        for(let i = 0; i < x; i++) {
            yield i;
        }
    }

    const iota = markVerb(A.pattern([{
        pattern: [A.pred(0, isNumber)],
        cond: x => Number.isSafeInteger(toReal(x)) && isNonNegative(toReal(x)),
        f: x => Array.from(iotaAux(toReal(x)))
    },
    {
        pattern: [A.pred(0, isArray)],
        cond: x => x.every(a => isNumber(toReal(a)) && Number.isSafeInteger(toReal(a)) && toReal(a) > 0),
        f: x => dollar(x, Array.from(iotaAux(x.reduce((accum, x) => accum * toReal(x)))))
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isNoun)],
        f: (x, y) => {
            const index = x.indexOf(y);

            return index < 0 ? x.length : index;
        }
    }]), "i.", [$1, inf, inf]);

    const match = markVerb(A.pattern([{
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        f: (x, y) => x.length !== y.length ? $0 : mapDeep((a, b) => match(a, b), x, y).every(x => x) ? $1 : $0
    },
    {
        pattern: [A.pred(0, isBox), A.pred(1, isBox)],
        f: (x, y) => match(unbox(x), unbox(y))
    },
    {
        pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
        f: (x, y) => x === y ? $1 : $0
    },
    {
        pattern: [A.pred(0, isArray)],
        f: y => y.map(v => match(v))
    },
    {
        pattern: [A.pred(0, isNumber)],
        f: y => toReal(y) / 2
    }]), "-:", [0, inf, inf]);

    function* walkRaze(anObject) {
        if(isArray(anObject)) {
            for(let i = 0; i < anObject.length; i++) {
                yield* walkRaze(anObject[i]);
            }
        } else if(isBox(anObject)) {
            yield* walkRaze(unbox(anObject));
        } else {
            yield anObject;
        }
    };

    const semicolon = markVerb(A.pattern([{
        pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
        cond: (x, y) => getNounType(y) !== "box",
        f: (x, y) => [box(x), box(y)]
    },
    {
        pattern: [A.pred(0, isNoun), A.pred(1, isArray)],
        cond: (x, y) => getNounType(y) === "box",
        f: (x, y) => [box(x)].concat(y)
    },
    {
        pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
        cond: (x, y) => getNounType(y) === "box",
        f: (x, y) => [box(x), y]
    },
    {
        pattern: [A.pred(0, isNoun)],
        f: y => Array.from(walkRaze(y))
    }]), ";", [inf, inf, inf]);

    // TODO stub
    const format = markVerb(A.pattern([{
        pattern: [A.pred(0, x => getNounType(x) === "number")],
        f: x => Array.from(x.toString())
    },
    {
        pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
        f: (x, y) => error("dyadic \": is not supported")
    }]), "\":", [inf, $1, inf]);

    const left = markVerb(A.pattern([{
        pattern: [A.pred(0, isNoun)],
        f: a => a
    },
    {
        pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
        f: (a, c) => a
    }]), "[", [inf, inf, inf]);

    const right = markVerb(A.pattern([{
        pattern: [A.pred(0, isNoun)],
        f: a => a
    },
    {
        pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
        f: (a, c) => c
    }]), "]", [inf, inf, inf]);

    const leftColon = markVerb(A.pattern([{
        pattern: A.choice([A.pred(0, isNoun)], [A.pred(0, isNoun), A.pred(1, isNoun)]),
        f: (x, y) => error("Domain error")
    }]), "[:", [inf, inf, inf]);

    function constantFunction(k) {
        const str = (k < 0 ? "_" : "") + Math.abs(k).toString() + ":";

        return markVerb(A.pattern([{
            pattern: [A.pred(0, isNoun)],
            f: y => k
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            f: (x, y) => k
        }]), str, [inf, inf, inf]);
    }

    const rotate1 = (n, a) => {
        const result = [];

        for(let i = 0; i < a.length; i++) {
            result[(a.length - n + i) % a.length] = a[i];
        }
        return result;
    }

    // TODO stub
    const barDot = markVerb(A.pattern([{
        pattern: [A.pred(0, isArray)],
        f: a => a.slice().reverse()
    },
    {
        pattern: [A.pred(0, isNumber), A.pred(1, isArray)],
        f: (n, a) => rotate1(n, a)
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isNoun)],
        cond: (x, y) => x.length === 0,
        f: (x, y) => y
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        cond: (x, y) => x.every(v => isNonNegative(v)),
        f: (x, y) => rotate1(toReal(x[0]), y).map(a => barDot(x.slice(1), a))
    }]), "|.", [inf, 1, inf]);

    const isMember = (x, y) => {
        for(let i = 0; i < y.length; i++) {
            if(match(x, y[i])) {
                return $1;
            }
        }
        return $0;
    };

    const eDot = markVerb(A.pattern([{
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        cond: (x, y) => getRank(x) + 1 > getRank(y),
        f: (x, y) => x.map(v => eDot(v, y))
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        cond: (x, y) => getRank(x) + 1 === getRank(y),
        f: (x, y) => isMember(x, y)
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        f: (x, y) => $0
    },
    {
        pattern: [A.pred(0, isNoun), A.pred(1, isArray)],
        cond: (x, y) => getRank(y) === 1,
        f: (x, y) => isMember(x, y)
    },
    {
        pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
        f: (x, y) => $0
    },
    {
        pattern: [A.pred(0, isNoun)],
        f: y => error("monadic e. is not supported")
    }]), "e.", [inf, inf, inf]);

    // TODO stub
    const dquoteDot = markVerb(A.pattern([{
        pattern: [A.pred(0, isSimpleString)],
        f: y => evalJ(typeof y === "string" ? y : y.join(""))
    },
    {
        pattern: [A.pred(0, isArray)],
        f: y => y.map(a => dquoteDot(a))
    },
    {
        pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
        f: (x, y) => error("dyadic \". is not supported")
    }]), "\".", [1, inf, inf]);

    const fillTake = (anArray, s) => {
        const a1 = anArray.slice();
        const fl = getFiller(a1);

        for(let i = a1.length; i < s; i++) {
            a1.push(fl);
        }
        return a1;
    };

    // TODO stub
    const leftBraceDot = markVerb(A.pattern([{
        pattern: [A.pred(0, isInteger), A.pred(1, isArray)],
        cond: (x, y) => x >= 0 && x < y.length,
        f: (x, y) => y.slice(0, x)
    },
    {
        pattern: [A.pred(0, isInteger), A.pred(1, isArray)],
        cond: (x, y) => x >= -y.length && x < 0,
        f: (x, y) => y.slice(x)
    },
    {
        pattern: [A.pred(0, isInteger), A.pred(1, isArray)],
        cond: (x, y) => x >= y.length,
        f: (x, y) => fillTake(y, x)
    },
    {
        pattern: [A.pred(0, isArray)],
        f: y => y[0]
    }]), "{.", [inf, 1, inf]);

    // TODO stub
    const rightBraceDot = markVerb(A.pattern([{
        pattern: [A.pred(0, isInteger), A.pred(1, isArray)],
        cond: (x, y) => x >= 0 && x < y.length,
        f: (x, y) => y.slice(x)
    },
    {
        pattern: [A.pred(0, isInteger), A.pred(1, isArray)],
        cond: (x, y) => x >= -y.length && x < 0,
        f: (x, y) => y.slice(0, x)
    },
    {
        pattern: [A.pred(0, isArray)],
        f: y => y.slice(1)
    }]), "}.", [inf, 1, inf]);

    const leftBraceColon = markVerb(A.pattern([{
        pattern: [A.pred(0, isArray)],
        f: y => y.at(-1)
    }]), "{:", [inf, inf, inf]);

    const rightBraceColon = markVerb(A.pattern([{
        pattern: [A.pred(0, isArray)],
        f: y => y.slice(0, -1)
    }]), "}:", [inf, inf, inf]);

    // TODO stub
    const numberDot = markVerb(A.pattern([{
        pattern: [A.pred(0, isArray)],
        cond: y => getRank(y) === 1 && y.every(v => isNumber(v)),
        f: y => y.reduce((accum, v) => accum * 2 + v, 0)
    },
    {
        pattern: [A.pred(0, isNumber), A.pred(1, isArray)],
        cond: (x, y) => getRank(y) === 1 && y.every(v => isNumber(v)),
        f: (x, y) => y.reduce((accum, v) => accum * x + v, 0)
    }]), "#.", [1, 1, 1]);

    const slashColon = markVerb(A.pattern([{
        pattern: [A.pred(0, isArray)],
        f: y => sortIndex(y, compareFunction)
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        f: (x, y) => leftBrace(sortIndex(y, compareFunction), x)
    }]), "/:", [inf, inf, inf]);

    const bslashColon = markVerb(A.pattern([{
        pattern: [A.pred(0, isArray)],
        f: y => sortIndex(y, (x, y) => -compareFunction(x, y))
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        f: (x, y) => leftBrace(sortIndex(y, (x, y) => -compareFunction(x, y)), x)
    }]), "\\:", [inf, inf, inf]);

    const sameaxis = (rank, axes) => {
        const same = rank - axes.length;
        const result = [];
        let axisCount = 0;

        for(let i = 0; i < rank; i++) {
            result[i] = axes.indexOf(i) < 0 ? axisCount++ : same;
        }
        return result;
    };

    const barColon = markVerb(A.pattern([{
        pattern: [A.pred(0, isArray)],
        f: y => T(y)
    },
    {
        pattern: [A.pred(0, isNoun)],
        f: y => y
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        cond: (x, y) => x.every(isNonNegative) && x.length === getShape(y).length,
        f: (x, y) => transpose(y, ...x.map(v => toReal(v)))
    },
    {
        pattern: [A.pred(0, isBox), A.pred(1, isArray)],
        cond: (x, y) => unbox(x).length <= getShape(y).length,
        f: (x, y) => transpose(y, ...sameaxis(getShape(y).length, unbox(x).map(v => toReal(v))))
    }]), "|:", [inf, 1, inf]);

    // adverbs
    const insert = markAdverb(A.pattern([{
        pattern: [A.pred(0, isVerb)],
        f: f => markVerb(A.pattern([{
            pattern: [A.pred(0, isEmpty)],
            cond: a => getEmptyShape(a).length === 0,
            f: a => []
        },
        {
            pattern: [A.pred(0, isEmpty)],
            f: a => makeEmpty(...getEmptyShape(a).slice(1))
        },
        {
            pattern: [A.pred(0, isArray)],
            f: a => {
                if(a.length === 0) {
                    error("Zero size arrays is not supported");
                } else if(a.length === 1) {
                    return a[0];
                } else {
                    let result = f(a.at(-2), a.at(-1));

                    for(let i = a.length - 3; i >= 0; i--) {
                        result = f(a.at(i), result);
                    }
                    return result;
                }
            }
        },
        {
            pattern: [A.pred(0, isAtom)],
            f: x => x
        },
        {
            pattern: [A.pred(0, isArray), A.pred(1, isArray)],
            f: (x, y) => outer(x, y, f, Number.MAX_SAFE_INTEGER)
        }]), getToString(f) + "/", [inf, inf, inf])
    }]), "/");

    const tilde = markAdverb(A.pattern([{
        pattern: [A.pred(0, isVerb)],
        f: f => markVerb(A.pattern([{
            pattern: [A.pred(0, A.any), A.pred(1, A.any)],
            f: (x, y) => f(y, x)
        }]), getToString(f) + "~", [f[RANK][0], f[RANK][2], f[RANK][1]])
    }]), "~");

    const rankAdverb = markAdverb(A.pattern([{
        pattern: [A.pred(0, isVerb)],
        f: f => markVerb(A.pattern([{
            pattern: [$0],
            f: () => f[RANK]
        }]), getToString(f) + " b.", [0, 0, 0])
    }]), "b.");

    const backslash = markAdverb(A.pattern([{
        pattern: [A.pred(0, isVerb)],
        f: f => markVerb(A.pattern([{
            pattern: [A.pred(0, isArray)],
            f: a => {
                const result = [];

                for(let i = 1; i <= a.length; i++) {
                    result.push(f(a.slice(0, i)));
                }
                return result;
            },
        },
        {
            pattern: [A.pred(0, isEmpty)],
            f: a => {
                const shp = getEmptyShape(a);

                if(shp.length > 0) {
                    return makeEmpty(...[shp[0]].concat(shp));
                } else {
                    return makeEmpty(1, 1);
                }
            }
        },
        {
            pattern: [A.pred(0, isAtom)],
            f: a => a
        },
        {
            pattern: [A.pred(0, isNumber), A.pred(1, isArray)],
            cond: (m, a) => isInteger(m) && m !== 0 && m !== false,
            f: (m, a) => {
                const step = Math.abs(toReal(m));
                const result = [];
                const sign = toReal(m) >= 0;
                let i = 0;

                for(; i <= a.length - step; i += (sign ? 1 : step)) {
                    result.push(f(a.slice(i, i + step)));
                }
                if(!sign && i < a.length) {
                    result.push(f(a.slice(i, a.length)));
                }
                return result;
            }
        }]), getToString(f) + "\\", [inf, 0, inf])
    }]), "\\");

    const backslashDot = markAdverb(A.pattern([{
        pattern: [A.pred(0, isVerb)],
        f: f => markVerb(A.pattern([{
            pattern: [A.pred(0, isArray)],
            f: a => {
                const result = [];

                for(let i = 0; i < a.length; i++) {
                    result.push(f(a.slice(i, a.length)));
                }
                return result;
            },
        },
        {
            pattern: [A.pred(0, isEmpty)],
            f: a => {
                const shp = getEmptyShape(a);

                if(shp.length > 0) {
                    return makeEmpty(...[shp[0]].concat(shp));
                } else {
                    return makeEmpty(1, 1);
                }
            }
        },
        {
            pattern: [A.pred(0, isAtom)],
            f: a => a
        },
        {
            pattern: [A.pred(0, isNonNegativeInteger), A.pred(1, isArray)],
            f: (x, y) => {
                const result = [];
                const xr = toReal(x);

                for(let i = 0; i <= y.length - xr; i++) {
                    result.push(f(y.slice(0, i).concat(y.slice(i + xr))));
                }
                return result;
            }
        },
        {
            pattern: [A.pred(0, isInteger), A.pred(1, isArray)],
            f: (x, y) => {
                const result = [];

                for(let i = 0; i < y.length; i += -x) {
                    result.push(f(y.slice(0, i).concat(y.slice(i - x))));
                }
                return result;
            }
        }]), getToString(f) + "\\.", [inf, 0, inf])
    }]), "\\.");

    const RIGHTBRACE_DEFAULT = Symbol("}default");
    const mergeArrayAux = (m, shapem, y) => {
        const razem = comma(m);
        const permutation = (depth, v) => depth < shapem.length ? iota(shapem[depth]).map(w => permutation(depth + 1, v.concat([w]))) : v;
        const countp = (c, depth) => depth < shapem.length ? countp(c * shapem[depth], depth + 1) : c;
        const pc = countp(1, 0);
        const p1 = reshape(comma(permutation(0, [])), pc, shapem.length);
        const indices = p1.map((v, i) => [toReal(razem[i])].concat(v));

        return reshape(indices.map(i => getIndex(y, i)), ...shapem);
    };

    const rightBrace = markAdverb(A.pattern([{
        pattern: [A.pred(0, isNumber)],
        f: m => markVerb(A.pattern([{
            pattern: [A.pred(0, isAtom), A.pred(1, isArray)],
            f: (x, y) => {
                const result = y.slice();

                result[toReal(m)] = x;
                return result;
            }
        }]), getToString(m) + "}", [inf, inf, inf])
    },
    {
        pattern: [A.pred(0, isBox)],
        cond: m => isArray(unbox(m)),
        f: m => markVerb(A.pattern([{
            pattern: [RIGHTBRACE_DEFAULT, A.pred(1, isAtom)],
            f: (x, y) => y
        },
        {
            pattern: [A.pred(0, isAtom), A.pred(1, isAtom)],
            cond: (x, y) => unbox(m).length === 0,
            f: (x, y) => x
        },
        {
            pattern: [A.pred(0, isAtom), A.pred(1, isArray)],
            cond: (x, y) => isInteger(unbox(m)[0]) && toReal(unbox(m)[0]) >= -y.length && toReal(unbox(m)[0]) < y.length,
            f: (x, y) => y.map((v, i) => rightBrace(box(unbox(m).slice(1)))(x === RIGHTBRACE_DEFAULT || toReal(unbox(m)[0]) !== i ? RIGHTBRACE_DEFAULT : x, v))
        }]), getToString(m) + "}", [inf, inf, inf])
    },
    {
        pattern: [A.pred(0, isArray)],
        f: m => markVerb(A.pattern([{
            pattern: [A.pred(0, isAtom), A.pred(1, isArray)],
            cond: (x, y) => y.every(v => isAtom(v)),
            f: (x, y) => y.map((v, i) => m.map(z => toReal(z)).indexOf(i) < 0 ? v : x)
        },
        {
            pattern: [A.pred(0, isArray), A.pred(1, isArray)],
            cond: (x, y) => m.every(v => isInteger(v) && toReal(v) >= -y.length && toReal(v) < y.length) && x.length === m.length,
            f: (x, y) => y.map((v, i) => m.some(w => w >= 0 ? toReal(w) === i : toReal(w) === i - y.length) ? x.at(m.map(z => toReal(z)).indexOf(i)) : v)
        },
        {
            pattern: [A.pred(0, isArray), A.pred(1, isArray)],
            cond: (x, y) => getShape(x).length + 1 === getShape(y),
            f: (x, y) => mergeArray(u)(x, y)
        },
        {
            pattern: [A.pred(0, isArray)],
            cond: y => getShape(m).length + 1 === getShape(y).length,
            f: y => {
                const shapem = getShape(m);

                if(y[0].length !== m.length) {
                    error("Length error");
                } else if(shapem.length === 1 && !m.every(v => toReal(v) >= -y.length && toReal(v) < y.length)) {
                    error("Length error");
                } else {
                    return mergeArrayAux(m, shapem, y);
                }
            }
        }]), getToString(m) + "}", [inf, inf, inf])
    },
    {
        pattern: [A.pred(0, isVerb)],
        f: m => markVerb(A.pattern([{
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            f: (x, y) => dollar(dollar(y), rightBrace(m(x, y))(x, comma(y)))
        }]), getToString(m) + "}", [inf, inf, inf])
    }]), "}");

    // conjunctions
    const atColon = markConjunction(A.pattern([{
        pattern: [A.pred(0, isVerb), A.pred(1, isVerb)],
        f: (f, g) => markVerb(A.pattern([{
            pattern: [A.pred(0, isNoun)],
            f: x => f(g(x))
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            f: (x, y) => f(g(x, y))
        }]), getToString(f) + "@:" + getToString(g), [inf, inf, inf])
    }]), "@:");

    const ampersandColon = markConjunction(A.pattern([{
        pattern: [A.pred(0, isVerb), A.pred(1, isVerb)],
        f: (f, g) => markVerb(A.pattern([{
            pattern: [A.pred(0, isNoun)],
            f: x => f(g(x))
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            f: (x, y) => f(g(x), g(y))
        }]), getToString(f) + "&:" + getToString(g), [inf, inf, inf])
    }]), "&:");

    const atop = markConjunction(A.pattern([{
        pattern: [A.pred(0, isVerb), A.pred(1, isVerb)],
        f: (f, g) => markVerb(A.pattern([{
            pattern: [A.pred(0, isNoun)],
            f: y => dquote(atColon(f, g), g[RANK][0])(y)
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            f: (x, y) => dquote(atColon(f, g), [g[RANK][1], g[RANK][2]])(x, y)
        }]), getToString(f) + "@" + getToString(g), g[RANK])
    }]), "@");

    const ampersand = markConjunction(A.pattern([{
        pattern: [A.pred(0, isVerb), A.pred(1, isNoun)],
        f: (f, y) => markVerb(A.pattern([{
            pattern: [A.pred(0, A.any)],
            f: x => f(x, y)
        }]), getToString(f) + "&" + y, [inf, inf, inf])
    },
    {
        pattern: [A.pred(0, isNoun), A.pred(1, isVerb)],
        f: (x, f) => markVerb(A.pattern([{
            pattern: [A.pred(0, A.any)],
            f: y => f(x, y)
        }]), x + "&" + getToString(f), [inf, inf, inf])
    },
    {
        pattern: [A.pred(0, isVerb), A.pred(1, isVerb)],
        f: (f, g) => markVerb(A.pattern([{
            pattern: [A.pred(0, isNoun)],
            f: x => atop(f, g)(x)
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            f: (x, y) => dquote(f, [g[RANK][0], g[RANK][0]])(g(x), g(y))
        }]), getToString(f) + "&" + getToString(g), [inf, g[RANK][0], g[RANK][0]])
    }]), "&");

    const tie = markConjunction(A.pattern([{
        pattern: [A.pred(0, isVerb), A.pred(1, isVerb)],
        f: (u, v) => [gerand(u), gerand(v)]
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isVerb)],
        cond: (u, v) => u.every(v => isGerand(v)),
        f: (u, v) => u.concat(gerand(v))
    }]), "`");

    // TODO case of hook and fork
    const atDot = markConjunction(A.pattern([{
        pattern: [A.pred(0, isArray), A.pred(1, isVerb)],
        cond: (u, v) => u.every(v => isGerand(v)),
        f: (u, v) => markVerb(A.pattern([{
            pattern: [A.pred(0, isNoun)],
            f: y => {
                const index = toReal(v(y));
                const gerand = u.at(index);

                return gerand === undef ? error("Index error") : ungerand(gerand)(y);
            }
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            f: (x, y) => {
                const index = toReal(v(x, y));
                const gerand = u.at(index);

                return gerand === undef ? error("Index error") : ungerand(gerand)(x, y);
            }
        }]), getToString(u) + "@." + getToString(v), [inf, inf, inf]),
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isNumber)],
        cond: (u, m) => u.every(v => isGerand(v)),
        f: (u, m) => {
            const gerand = u.at(m);

            return gerand === undef ? error("Index error") : ungerand(gerand);
        }
    }]), "@.");

    const caretColon = markConjunction(A.pattern([{
        pattern: [A.pred(0, isVerb), A.pred(1, v => v === inf)],
        f: (u, n) => markVerb(A.pattern([{
            pattern: [A.pred(0, isNoun)],
            f: y => {
                let r = y, s = y;

                do {
                    [r, s] = [s, u(s)];
                } while(Math.abs(r - s) > epsilon);
                return r;
            }
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            f: (x, y) => caretColon(ampersand(x, u), n)(y)
        }]), getToString(u) + " ^: _", [inf, inf, inf])
    },
    {
        pattern: [A.pred(0, isVerb), A.pred(1, isVerb)],
        f: (u, v) => markVerb(A.pattern([{
            pattern: [A.pred(0, isNoun)],
            f: y => caretColon(u, v(y))(y)
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            f: (x, y) => caretColon(ampersand(x, u), n)(y)
        }]), getToString(u) + " ^: " + getToString(v), [inf, inf, inf])
    },
    {
        pattern: [A.pred(0, isVerb), A.pred(1, v => isNumber(v) && toReal(v) >= 0)],
        f: (u, n) => markVerb(A.pattern([{
            pattern: [A.pred(0, isNoun)],
            f: y => toReal(n) > 0 ? caretColon(u, toReal(n) - 1)(u(y)) : y
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            f: (x, y) => caretColon(ampersand(x, u), n)(y)
        }]), getToString(u) + " ^: " + n, [inf, inf, inf])
    },
    {
        pattern: [A.pred(0, isVerb), A.pred(1, a => isArray(a) && a.every(v => isNumber(v) && toReal(v) >= 0))],
        f: (u, a) => markVerb(A.pattern([{
            pattern: [A.pred(0, isNoun)],
            f: y => a.map(n => toReal(n) > 0 ? caretColon(u, toReal(n) - 1)(u(y)) : y)
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            f: (x, y) => caretColon(ampersand(x, u), n)(y)
        }]), getToString(u) + "^:" + a, [inf, inf, inf])  // TODO representation of array
    }]), "^:");

    const inv2 = (anArray, u) => getRank(anArray) > Math.max(1, u[RANK][0]) ? anArray.map((v, i) => v.map((w, j) => anArray[j][i])) : anArray;
    const dotAux = (f, u) => A.pattern([{
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        cond: (x, y) => getRank(x) > 1,
        f: (x, y) => x.map(v => dotAux(f, u)(v, y))
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        cond: (x, y) => getRank(y) > 1,
        f: (x, y) => inv2(y.map(v => dotAux(f, u)(x, v)), u)
    },
    {
        pattern: [A.pred(0, isArray), A.pred(1, isArray)],
        f: (x, y) => u(mapDeep(f, x, y))
    }]);
    const dotAuxMonad = (f, u) => error("Monadic dot product is not supported");

    const dot = markConjunction(A.pattern([{
        pattern: [A.pred(0, isVerb), A.pred(1, isVerb)],
        f: (u, v) => markVerb((x, y) => y === undef ? dotAuxMonad(v, u)(x) : dotAux(v, u)(x, getCols(y)), getToString(u) + " . " + getToString(v), [inf, inf, inf])
    }]), ".");

    const shift1 = n => (x, y) => toReal(x) > 0
            ? fill(y.slice(toReal(x), y.length).concat(new Array(toReal(x)).fill(n)), n)
            : toReal(x) < 0
            ? fill(new Array(-toReal(x)).fill(n).concat(y.slice(0, y.length + toReal(x))), n)
            : y

    // TODO stub
    const bangDot = markConjunction(A.pattern([{
        pattern: [A.pred(1, x => x === barDot), A.pred(0, isAtom)],
        f: n => markVerb(A.pattern([{
            pattern: [A.pred(0, isNumber), A.pred(1, isArray)],
            f: (x, y) => shift1(n)(x, y)
        },
        {
            pattern: [A.pred(0, isArray), A.pred(1, isNoun)],
            cond: (x, y) => x.length === 0,
            f: (x, y) => y
        },
        {
            pattern: [A.pred(0, isArray), A.pred(1, isArray)],
            cond: (x, y) => x.every(v => isNonNegative(v)),
            f: (x, y) => shift1(n)(toReal(x[0]), y).map(a => bangDot(barDot, n)(x.slice(1), a))
        }]), "|.!.", barDot[RANK])
    }]), "!.");

    // TODO stub
    const bangColon = markConjunction(A.pattern([{
        pattern: [A.pred(0, isNumber), A.pred(1, isNumber)],
        f: (m, n) => error(m + " !: " + n + " is not supported")
    }]), "!:")

    const partSubarray = (size, offset, anArray) => {
        if(size.length > 1) {
            return anArray
                   .slice(offset[0], offset[0] + size[0])
                   .map(a => partSubarray(size.slice(1), offset.slice(1), a));
        } else {
            return anArray.slice(offset[0], offset[0] + size[0]);
        }
    };

    const buildSubarray = (u, size) => (sizeNow, move, offset, anArray) => {
        const offsetNow = offset.slice().concat([0]);
        const result = [];

        for(let i = 0; i < anArray.length - sizeNow[0] + 1; i += move[0]) {
            offsetNow[offset.length] = i;
            if(move.length > 1) {
                result.push(buildSubarray(u, size)(sizeNow.slice(1), move.slice(1), offsetNow, anArray));
            } else {
                result.push(u(partSubarray(size, offsetNow, anArray)));
            }
        }
        return result;
    }

    // semicolon dot (;.)
    const reverseArray = a => isArray(a) ? a.slice().reverse().map(v => reverseArray(v)) : a;
    const separateArrayHead = (f, pred, a, include) => {
        const result = [];
        let buf = [];

        for(let i = 0; i < a.length; i++) {
            if(pred(i)) {
                if(i > 0) { 
                    result.push(f(buf));
                }
                buf = include ? [a[i]] : [];
            } else {
                buf.push(a[i]);
            }
        }

        if(buf.length > 0) {
            result.push(f(buf));
        }
        return result;
    };

    const separateArrayTail = (f, pred, a, include) => {
        const result = [];
        let buf = [];

        for(let i = 0; i < a.length; i++) {
            if(pred(i)) {
                if(include) {
                    buf.push(a[i]);
                }
                result.push(f(buf));
                buf = [];
            } else {
                buf.push(a[i]);
            }
        }

        if(buf.length > 0) {
            result.push(f(buf));
        }
        return result;
    };

    // TODO stub
    const semicolonDot = markConjunction(A.pattern([{
        pattern: [A.pred(0, isVerb), -3],
        f: u => markVerb(A.pattern([{
            pattern: [A.pred(0, isArray), A.pred(1, isArray)],
            f: (x, y) => buildSubarray(u, x[1])(x[1], x[0], [], y)
        }]), getToString(u) + ";._3", [inf, 2, inf])
    },
    {
        pattern: [A.pred(0, isVerb), A.pred(1, v => toReal(v) === 0)],
        f: u => markVerb(A.pattern([{
            pattern: [A.pred(0, isArray)],
            f: y => u(reverseArray(y))
        },
        {
            pattern: [A.pred(0, isArray), A.pred(1, isArray)],
            f: (x, y) => error("Not supported")
        }]), getToString(u) + ";.0", [inf, 2, inf])
    },
    {
        pattern: [A.pred(0, isVerb), A.pred(1, v => toReal(v) === 1)],
        f: u => markVerb(A.pattern([{
            pattern: [A.pred(0, isArray)],
            f: y => separateArrayHead(u, i => match(y[i], y.at(0)), y, true)
        },
        {
            pattern: [A.pred(0, isArray), A.pred(1, isArray)],
            cond: (x, y) => x.length === y.length,
            f: (x, y) => separateArrayHead(u, i => x[i], y, true)
        }]), getToString(u) + ":1", [inf, 1, inf])
    },
    {
        pattern: [A.pred(0, isVerb), -1],
        f: u => markVerb(A.pattern([{
            pattern: [A.pred(0, isArray)],
            f: y => separateArrayHead(u, i => match(y[i], y.at(0)), y, false)
        }]), getToString(u) + ":_1", [inf, 1, inf])
    },
    {
        pattern: [A.pred(0, isVerb), 2],
        f: u => markVerb(A.pattern([{
            pattern: [A.pred(0, isArray)],
            f: y => separateArrayTail(u, i => match(y[i], y.at(-1)), y, true)
        }]), getToString(u) + ":2", [inf, 1, inf])
    },
    {
        pattern: [A.pred(0, isVerb), -2],
        f: u => markVerb(A.pattern([{
            pattern: [A.pred(0, isArray)],
            f: y => separateArrayTail(u, i => match(y[i], y.at(-1)), y, false)
        },
        {
            pattern: [A.pred(0, isArray), A.pred(1, isArray)],
            cond: (x, y) => x.length === y.length,
            f: (x, y) => separateArrayTail(u, i => x[i], y, false)
        }]), getToString(u) + ":_2", [inf, 1, inf])
    },
    {
        pattern: [A.pred(0, isVerb), -3],
        f: u => error("u ;. _3 is not supported")
    }]), ";.");

    function getRank(value) {
        function inner(value, rank) {
            return isEmpty(value)
                   ? getEmptyShape(value).length
                   : !isArray(value)
                   ? rank
                   : inner(value[0], rank + 1);
        }
        return inner(value, 0);
    }

    function rankVerbNonnegative(verb, rank) {
        const inner = A.pattern([{
            pattern: [A.pred(0, isNoun)],
            cond: a => getRank(a) <= rank,
            f: a => verb(a)
        },
        {
            pattern: [A.pred(0, isNoun)],
            cond: a => isArray(a) && getRank(a) > rank,
            f: a => a.map(v => inner(v))
        },
        {
            pattern: [A.pred(0, isNoun)],
            cond: a => isEmpty(a) && getRank(a) > rank,
            f: a => {
                const shp = getEmptyShape(a);
                const applied = inner(makeEmpty(...shp.slice(1)));

                if(isArray(applied) && applied.length === 0) {
                    return makeEmpty(shp[0]); 
                } else if(isEmpty(applied)) {
                    return makeEmpty(...[shp[0]].concat(getEmptyShape(applied)));
                } else if(shp[0] !== 0) {
                    const result = [];

                    for(let i = 0; i < shp[0]; i++) {
                        result.push(applied);
                    }
                    return result;
                } else {
                    return makeEmpty(...[shp[0]].concat(getShape(applied)));
                }
            }
        }]);

        return inner;
    }

    function rankVerb(verb, rank) {
        const inner = rank => A.pattern([{
            pattern: [A.pred(0, isNoun)],
            f: a => rankVerbNonnegative(verb, rank < 0 ? getRank(a) + rank : rank)(a)
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            f: (a, c) => rankDyad(verb, rank, rank)(a, c)
        }]);

        return inner(rank);
    }

    function forRank(f, a, c) {
        if(a.length === c.length) {
            const result = [];

            for(let i = 0; i < a.length; i++) {
                result.push(f(a[i], c[i]));
            }
            return result;
        } else {
            error("Length error");
        }
    }

    function rankDyadNonnegative(verb, lrank, rrank) {
        const inner = A.pattern([{
            pattern: [A.pred(0, isEmpty), A.pred(1, isEmpty)],
            f: (l, r) => {
                const shpl = getEmptyShape(l);
                const shpr = getEmptyShape(r);

                return lrank === 0 && rrank > 0
                       ? makeEmpty(...shpl.concat(shpr.slice(-rrank)))
                       : rrank === 0 && lrank > 0
                       ? makeEmpty(...shpr.concat(shpl.slice(-lrank)))
                       : lrank === rrank && lrank > 0
                       ? verb(l, r)
                       : error("Length error");
            }
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            cond: (a, c) => getRank(a) <= lrank && getRank(c) <= rrank,
            f: (a, c) => verb(a, c)
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            cond: (a, c) => getRank(a) <= lrank && getRank(c) > rrank,
            f: (a, c) => c.map(v => inner(a, v))
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            cond: (a, c) => getRank(a) > lrank && getRank(c) <= rrank,
            f: (a, c) => a.map(v => inner(v, c))
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            cond: (a, c) => getRank(a) > lrank && getRank(c) > rrank,
            f: (a, c) => forRank(inner, a, c)
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            f: (a, c) => error("Rank error")
        }]);

        return inner;
    }

    function rankDyad(verb, lrank, rrank) {
        return A.pattern([{
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            cond: (a, c) => isArray(a) && isArray(c),
            f: (a, c) => rankDyadNonnegative(verb, lrank < 0 ? getRank(a) + lrank : lrank, rrank < 0 ? getRank(c) + rrank : rrank)(a, c)
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            cond: (a, c) => isAtom(a) && isArray(c),
            f: (a, c) => rankDyadNonnegative(verb, 0, rrank < 0 ? getRank(c) + rrank : rrank)(a, c)
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            cond: (a, c) => isArray(a) && isAtom(c),
            f: (a, c) => rankDyadNonnegative(verb, lrank < 0 ? getRank(a) + lrank : lrank, 0)(a, c)
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            cond: (a, c) => isEmpty(a) && isEmpty(c),
            f: (a, c) => rankDyadNonnegative(verb, lrank < 0 ? getRank(a) + lrank : lrank, rrank < 0 ? getRank(c) + rrank : rrank)(a, c)
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            cond: (a, c) => isEmpty(a) && isAtom(c),
            f: (a, c) => a
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            cond: (a, c) => isAtom(a) && isEmpty(c),
            f: (a, c) => c
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            cond: (a, c) => isAtom(a) && isAtom(c),
            f: (a, c) => rankDyadNonnegative(verb, 0, 0)(a, c)
        }]);
    }

    const dquote = markConjunction(A.pattern([{
        pattern: [A.pred(0, isVerb), A.pred(1, isNoun)],
        cond: (v, y) => isNumber(y) && (isInteger(y) || y === inf),
        f: (v, y) => markVerb(rankVerb(v, toReal(y)), getToString(v) + "\"" + toReal(y), [toReal(y), toReal(y), toReal(y)])
    },
    {
        pattern: [A.pred(0, isVerb), A.pred(1, isArray)],
        cond: (v, a) => a.length === 2 && (isInteger(a[0]) || a[0] === inf) && (isInteger(a[1]) || a[1] === inf),
        f: (v, a) => markVerb(rankDyad(v, toReal(a[0]), toReal(a[1])), getToString(v) + "\"" + toReal(a[0]) + " " + toReal(a[1]), [toReal(a[1]), toReal(a[0]), toReal(a[1])])
    },
    {
        pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
        cond: (v, y) => isNumber(y) && (isInteger(y) || y === inf),
        f: (m, y) => markVerb(rankVerb((x, y) => m, toReal(y)), m + "\"" + toReal(y), [toReal(y), toReal(y), toReal(y)])
    }]));

    function assign(name, value) {
        variables.set(name, value);
        return value;
    }

    const refer = name => variables.has(name) ? variables.get(name) : NOTDEFINED;

    function hook(f, g) {
        return markVerb(A.pattern([{
            pattern: [A.pred(0, isNoun)],
            f: y => f(y, g(y))
        },
        {
            pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
            f: (x, y) => f(x, g(y))
        }]), getToString(f) + " " + getToString(g), 0);
    }

    function fork(f, g, h) {
        if(f === leftColon) {
            return markVerb(A.pattern([{
                pattern: [A.pred(0, isNoun)],
                f: y => atColon(g, h)(y)
            },
            {
                pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
                f: (x, y) => atColon(g, h)(x, y)
            }]), getToString(f) + " " + getToString(g) + " " + getToString(h), 0);
        } else {
            return markVerb(A.pattern([{
                pattern: [A.pred(0, isNoun)],
                f: y => g(f(y), h(y))
            },
            {
                pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
                f: (x, y) => g(f(x, y), h(x, y))
            }]), getToString(f) + " " + getToString(g) + " " + getToString(h), 0);
        }
    }

    const notSupportedStub = s => markVerb(() => error("not supported: " + s), s, [inf, inf, inf]);
    const notSupportedAdverbStub = s => markAdverb(() => error("not supported: " + s), s);
    const notSupportedConjStub = s => markConjunction(() => error("not supported: " + s), s);

    const verbs = {
        "+": plus,
        "*": asterisk,
        "+.": logicalOr,
        "*.": logicalAnd,
        "%": percent,
        "-": minus,
        "%:": percentColon,
        "^": caret,
        "*:": asteriskColon,
        "+:": plusColon,
        "|": bar,
        "-.": minusDot,
        "^.": caretDot,
        "o.": oDot,
        ">": gt,
        "=": eq,
        "<": lt,
        "#": tally,
        ">.": gtDot,
        "<.": ltDot,
        ">:": gtColon,
        "<:": ltColon,
        "$": dollar,
        ",": comma,
        ",.": commaDot,
        ",:": commaColon,
        "{": leftBrace,
        "i.": iota,
        "-:": match,
        ";": semicolon,
        "\":": format,
        "[": left,
        "]": right,
        "|.": barDot,
        "e.": eDot,
        "\".": dquoteDot,
        "[:": leftColon,
        "{.": leftBraceDot,
        "}.": rightBraceDot,
        "{:": leftBraceColon,
        "}:": rightBraceColon,
        "#.": numberDot,
        "/:": slashColon,
        "\\:": bslashColon,
        "|:": barColon,
        "_:": notSupportedStub("_:"),
        "__:": notSupportedStub("__:"),
        "%.": notSupportedStub("%."),
        "$.": notSupportedStub("$."),
        "$:": notSupportedStub("$:"),
        "~.": notSupportedStub("~."),
        "~:": notSupportedStub("~:"),
        ";:": notSupportedStub(";:"),
        "#:": notSupportedStub("#:"),
        "!": notSupportedStub("!"),
        "{::": notSupportedStub("{::"),
        "?": notSupportedStub("?"),
        "?.": notSupportedStub("?."),
        "A.": notSupportedStub("A."),
        "C.": notSupportedStub("C."),
        "E.": notSupportedStub("E."),
        "i:": notSupportedStub("i:"),
        "I:": notSupportedStub("I:"),
        "j.": notSupportedStub("j."),
        "L.": notSupportedStub("L."),
        "p.": notSupportedStub("p."),
        "p..": notSupportedStub("p.."),
        "p:": notSupportedStub("p:"),
        "q:": notSupportedStub("q:"),
        "r.": notSupportedStub("r."),
        "s:": notSupportedStub("s:"),
        "T.": notSupportedStub("T."),
        "u:": notSupportedStub("u:"),
        "x:": notSupportedStub("x:"),
        "z:": notSupportedStub("z:"),
        "u.": notSupportedStub("u."),
        "v.": notSupportedStub("v.")
    };

    for(let i = -9; i <= 9; i++) {
        const str = (i < 0 ? "_" : "") + Math.abs(i).toString() + ":";

        verbs[str] = constantFunction(i);
    }

    const adverbConjunctions = {
        "/": insert,
        "~": tilde,
        "b.": rankAdverb,
        "\\": backslash,
        "\\.": backslashDot,
        "}": rightBrace,
        "/.": notSupportedAdverbStub("/."),
        "/..": notSupportedAdverbStub("/.."),
        "]:": notSupportedAdverbStub("]:"),
        "f.": notSupportedAdverbStub("f."),
        "M.": notSupportedAdverbStub("M."),
        "@:": atColon,
        "&:": ampersandColon,
        "@": atop,
        "&": ampersand,
        "`": tie,
        "@.": atDot,
        ".": dot,
        "^:": caretColon,
        "!.": bangDot,
        "!:": bangColon,
        ";.": semicolonDot,
        "\"": dquote,
        ":.": notSupportedConjStub(":."),
        "::": notSupportedConjStub("::"),
        "[.": notSupportedConjStub("[."),
        "].": notSupportedConjStub("]."),
        "`:": notSupportedConjStub("`:"),
        "&.": notSupportedConjStub("&."),
        "&.:": notSupportedConjStub("&.:"),
        "d.": notSupportedConjStub("d."),
        "D.": notSupportedConjStub("D."),
        "D:": notSupportedConjStub("D:"),
        "F.": notSupportedConjStub("F."),
        "F..": notSupportedConjStub("F.."),
        "F.:": notSupportedConjStub("F.:"),
        "F:": notSupportedConjStub("F:"),
        "F:.": notSupportedConjStub("F:."),
        "F::": notSupportedConjStub("F::"),
        "H.": notSupportedConjStub("H."),
        "L.": notSupportedConjStub("L."),
        "m.": notSupportedConjStub("m."),
        "S.": notSupportedConjStub("S."),
        "t.": notSupportedConjStub("t.")
    };
    const builtIn = mergeObject(verbs, adverbConjunctions);

    // tokenizer
    const patternSymbolString = "[A-Za-z_][A-Za-z_0-9]*";
    const patternSymbolReg = new RegExp("^(?:" + patternSymbolString + ")$");
    const isSymbolString = s => patternSymbolReg.test(s);

    function tokenizePass1(s) {
        const patternFloat = /(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)(?:[eE][\+\-]?[0-9]+)?/y;
        const patternNegativeFloat = /_(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)(?:[eE][\+\-]?[0-9]+)?/y;
        const patternSymbol = new RegExp(patternSymbolString, "y");
        const patternSpace = /[ \t\n]*/y;
        const patternString = /'(?:''|[^'\n])*'/y;
        const builtInName = Object.keys(builtIn).slice().sort((x, y) => y.length - x.length);

        const result = [];
        let index = 0, matched;

        function regexMatcher(re) {
            return () => {
                re.lastIndex = index;

                const matchResult = re.exec(s);

                if(matchResult) {
                    index = re.lastIndex;
                    matched = matchResult[0];
                    return true;
                } else {
                    return false;
                }
            }
        }

        const matchedSpace = regexMatcher(patternSpace);
        const matchedNumber = regexMatcher(patternFloat);
        const matchedNegativeNumber = regexMatcher(patternNegativeFloat);
        const matchedSymbol = regexMatcher(patternSymbol);
        const matchedString = regexMatcher(patternString);

        function stringMatcher(name) {
            if(s.substring(index).startsWith(name)) {
                index += name.length;
                matched = name;
                return true;
            } else {
                return false;
            }
        }

        function builtInMatcher() {
            for(let i = 0; i < builtInName.length; i++) {
                if(stringMatcher(builtInName[i])) {
                    return true;
                }
            }
            return false;
        }

        matchedSpace();
        while(index < s.length) {
            if(stringMatcher("=:")) {
                result.push(ASSIGN);
            } else if(stringMatcher("(")) {
                result.push(LPAREN);
            } else if(stringMatcher(")")) {
                result.push(RPAREN);
            } else if(stringMatcher(":")) {
                result.push(makeSymbol(":"));
            } else if(stringMatcher("=.")) {
                result.push(ASSIGN_LOCAL);
            } else if(builtInMatcher()) {
                result.push(makeSymbol(matched));
            } else if(matchedNumber()) {
                result.push(matched === "1" ? true : matched === "0" ? false : Number.parseFloat(matched));
            } else if(matchedNegativeNumber()) {
                result.push(-Number.parseFloat(matched.substring(1)));
            } else if(stringMatcher("_")) {
                result.push(Number.POSITIVE_INFINITY);
            } else if(stringMatcher("__")) {
                result.push(Number.NEGATIVE_INFINITY);
            } else if(stringMatcher("_.")) {
                result.push(Number.NaN);
            } else if(matchedSymbol()) {
                result.push(makeSymbol(matched));
            } else if(matchedString()) {
                const stringArray = Array.from(matched.substring(1, matched.length - 1).replace(/''/g, "'"));

                result.push(stringArray.length > 1 ? stringArray : (stringArray[0] ?? []));
            } else {
                error("Syntax error: " + s);
            }
            matchedSpace();
        }
        return result;
    }

    function tokenize(s) {
        const list = tokenizePass1(s);
        const result = [];
        let numbers = null;

        function pushNumbers() {
            if(numbers === null) {
                // do nothing
            } else if(numbers.length > 1) {
                result.push(numbers);
                numbers = null;
            } else {
                result.push(numbers[0]);
                numbers = null;
            }
        }

        for(let i = 0; i < list.length; i++) {
            if(!isNumber(list[i])) {
                pushNumbers();
                result.push(list[i]);
            } else if(numbers === null) {
                numbers = [list[i]];
            } else {
                numbers.push(list[i]);
            }
        }
        pushNumbers();
        return result;
    }

    class JSymbol {
        constructor(x) {
            this.name = x;
        }
    }

    const isSymbol = v => v instanceof JSymbol;
    const makeSymbol = x => new JSymbol(x);
    const getName = x => x.name;
    const LPAREN = Symbol("(");
    const RPAREN = Symbol(")");
    const ASSIGN = Symbol("=:");
    const ASSIGN_LOCAL = Symbol("=.");

    const MARK = Symbol("mark");
    const posEdge = x => x === MARK || x === LPAREN || x === ASSIGN || x === ASSIGN_LOCAL;
    const posVerb = x => isVerb(x);
    const posNoun = x => !(x instanceof JSymbol) && typeof x !== "symbol" && isNoun(x);
    const posAdverb = x => isAdverb(x);
    const posConjunction = x => isConjunction(x);
    const posVN = x => posVerb(x) || posNoun(x);
    const posEAVN = x => posEdge(x) || posVerb(x) || posNoun(x) || posAdverb(x);
    const posCAVN = x => posConjunction(x) || posVerb(x) || posNoun(x) || posAdverb(x);
    const posCAV = x => posConjunction(x) || posVerb(x) || posAdverb(x);
    const posName = x => x instanceof JSymbol;

    const rootEnv = {
        find: n => refer(n),
        set: (n, v) => assign(n, v)
    };
    rootEnv.set("LF", "\n");

    function makeEnv(prev, callback) {
        const table = new Map();
        const envNew = {
            find: n => table.get(n) ?? prev.find(n),
            set: (n, v) => table.set(n, v)
        };

        callback(envNew);
        return envNew;
    }

    const assignNoun = A.pattern([{
        pattern: [A.pred(0, f => typeof f === "function"), A.pred(1, isSimpleString), A.pred(2, isArray)],
        f: (f, n, v) => {
            const splitted = n.join("").split(/[ \t]+/);

            if(splitted.length !== v.length) {
                error("Length error: assign value and array");
            } else if(v.every(isBox)) {
                splitted.forEach((n0, i) => f(n0, unbox(v[i])));
            } else {
                splitted.forEach((n0, i) => f(n0, v[i]));
            }
        },
    },
    {
        pattern: [A.pred(0, f => typeof f === "function"), A.pred(1, isSimpleString), A.pred(2, isNoun)],
        cond: (f, n, v) => isSymbolString(n.join("")),
        f: (f, n, v) => f(n.join(""), v)
    },
    {
        pattern: [A.pred(0, f => typeof f === "function"), A.pred(1, isArray), A.pred(2, isArray)],
        cond: (f, n, v) => n.every(a => isSimpleString(unbox(a))) && n.every(a => isSymbolString(unbox(a).join(""))) && n.length === v.length && v.every(a => isBox(a)),
        f: (f, n, v) => n.forEach((n0, i) => f(unbox(n0).join(""), unbox(v[i])))
    },
    {
        pattern: [A.pred(0, f => typeof f === "function"), A.pred(1, isArray), A.pred(2, isArray)],
        cond: (f, n, v) => n.every(a => isSimpleString(unbox(a))) && n.every(a => isSymbolString(unbox(a).join(""))) && n.length === v.length,
        f: (f, n, v) => n.forEach((n0, i) => f(unbox(n0).join(""), v[i]))
    }]);

    function evalJ(program, environment) {
        const env = environment || rootEnv;
        const tokens = tokenize(program);
        const resolveToken = x => {
            if(x === LPAREN || x === RPAREN || x === ASSIGN || x === ASSIGN_LOCAL) {
                return x;
            } else if(isNumber(x) || isArray(x) || typeof x === "string") {
                return x;
            } else if(builtIn[getName(x)]) {
                return builtIn[getName(x)];
            } else {
                const found = env.find(getName(x));

                if(found === NOTDEFINED || isVerb(found)) {
                    return markVerb(A.pattern([{
                        pattern: [A.pred(0, isNoun)],
                        f: y => env.find(getName(x))(y)
                    },
                    {
                        pattern: [A.pred(0, isNoun), A.pred(1, isNoun)],
                        f: (x2, y) => env.find(getName(x))(x2, y)
                    }]), getName(x), found[RANK]);
                } else {
                    return found;
                }
            }
        };

        const rules = A.pattern([{
            pattern: [A.repeat(0, A.any), A.pred(1, posEdge), A.pred(2, posVerb), A.pred(3, posNoun), A.repeatNotBacktrack(4, A.any)],
            f: (z, e, v, n, r) => [...z, e, v(n), ...r]
        },
        {
            pattern: [A.repeat(0, A.any), A.pred(1, posEAVN), A.pred(2, posVerb), A.pred(3, posVerb), A.pred(4, posNoun), A.repeatNotBacktrack(5, A.any)],
            f: (z, e, v1, v2, n, r) => [...z, e, v1, v2(n), ...r]
        },
        {
            pattern: [A.repeat(0, A.any), A.pred(1, posEAVN), A.pred(2, posNoun), A.pred(3, posVerb), A.pred(4, posNoun), A.repeatNotBacktrack(5, A.any)],
            f: (z, e, n1, v, n2, r) => [...z, e, v(n1, n2), ...r]
        },
        {
            pattern: [A.repeat(0, A.any), A.pred(1, posEAVN), A.pred(2, posVN), A.pred(3, posAdverb), A.repeatNotBacktrack(4, A.any)],
            f: (z, e, vn, a, r) => [...z, e, a(vn), ...r]
        },
        {
            pattern: [A.repeat(0, A.any), A.pred(1, posEAVN), A.pred(2, posVN), A.pred(3, posConjunction), A.pred(4, posVN), A.repeatNotBacktrack(5, A.any)],
            f: (z, e, vn1, c, vn2, r) => [...z, e, c(vn1, vn2), ...r]
        },
        {
            pattern: [A.repeat(0, A.any), A.pred(1, posEAVN), A.pred(2, posVN), A.pred(3, posVerb), A.pred(4, posVerb), A.repeatNotBacktrack(5, A.any)],
            f: (z, e, vn, v1, v2, r) => {
                if(posVerb(vn)) {
                    return [...z, e, fork(vn, v1, v2), ...r]
                } else {
                    return [...z, e, markVerb(y => hook(v1, v2)(vn, y), 0), ...r]
                }
            }
        },
        {
            pattern: [A.repeat(0, A.any), A.pred(1, posEdge), A.pred(2, posVerb), A.pred(3, posVerb), A.repeatNotBacktrack(4, A.any)],
            f: (z, e, v1, v2, r) => [...z, e, hook(v1, v2), ...r]
        },
        {
            pattern: [A.repeat(0, A.any), A.pred(1, posEdge), A.pred(2, posAdverb), A.pred(3, posAdverb), A.repeatNotBacktrack(4, A.any)],
            f: (z, e, a1, a2, r) => [...z, e, markAdverb(x => a1(x, a2)), ...r]
        },
        {
            pattern: [A.repeat(0, A.any), A.pred(1, posEdge), A.pred(2, posConjunction), A.pred(3, posVerb), A.repeatNotBacktrack(4, A.any)],
            f: (z, e, c, v, r) => [...z, e, markAdverb(x => c(x, v)), ...r]
        },
        {
            pattern: [A.repeat(0, A.any), A.pred(1, posEdge), A.pred(2, posConjunction), A.pred(3, posNoun), A.repeatNotBacktrack(4, A.any)],
            f: (z, e, c, n, r) => [...z, e, markAdverb(x => c(x, n)), ...r]
        },
        {
            pattern: [A.repeat(0, A.any), A.pred(1, posEdge), A.pred(2, posVerb), A.pred(3, posConjunction), A.repeatNotBacktrack(4, A.any)],
            f: (z, e, v, c, r) => [...z, e, markAdverb(x => c(v, x)), ...r]
        },
        {
            pattern: [A.repeat(0, A.any), A.pred(1, posEdge), A.pred(2, posNoun), A.pred(3, posConjunction), A.repeatNotBacktrack(4, A.any)],
            f: (z, e, n, c, r) => [...z, e, markAdverb(x => c(n, x)), ...r]
        },
        {
            pattern: [A.repeat(0, A.any), A.pred(1, posName), ASSIGN, A.pred(2, posCAVN), A.repeatNotBacktrack(3, A.any)],
            f: (z, name, x, r) => (assign(getName(name), x), [...z, x, ...r])
        },
        {
            pattern: [A.repeat(0, A.any), A.pred(1, posName), ASSIGN_LOCAL, A.pred(2, posCAVN), A.repeatNotBacktrack(3, A.any)],
            f: (z, name, x, r) => (env.set(getName(name), x), [...z, x, ...r])
        },
        {
            pattern: [A.repeat(0, A.any), A.pred(1, posNoun), ASSIGN, A.pred(2, posCAVN), A.repeatNotBacktrack(3, A.any)],
            f: (z, n, x, r) => (assignNoun(assign, n, x), [...z, x, ...r])
        },
        {
            pattern: [A.repeat(0, A.any), A.pred(1, posNoun), ASSIGN_LOCAL, A.pred(2, posCAVN), A.repeatNotBacktrack(3, A.any)],
            f: (z, n, x, r) => (assignNoun(env.set, n, x), [...z, x, ...r])
        },
        {
            pattern: [A.repeat(0, A.any), LPAREN, A.pred(1, posNoun), RPAREN, A.repeatNotBacktrack(2, A.any)],
            f: (z, x, r) => [...z, x, ...r]
        },
        {
            pattern: [A.repeat(0, A.any), LPAREN, A.pred(1, posCAV), RPAREN, A.repeatNotBacktrack(2, A.any)],
            f: (z, x, r) => [...z, (x[TOSTRING] = "(" + getToString(x) + ")", x), ...r]
        },
        {
            pattern: A.pred(0, A.any),
            f: x => undef
        }]);
        let stack = [];

        tokens.unshift(MARK);
        while(!(stack[0] === MARK && stack.length <= 2)) {
            const next = rules(...stack);

            if(next !== undef) {
                stack = next;
            } else if(stack[0] !== MARK) {
                const popped = tokens.pop();

                if(popped === ASSIGN || popped === ASSIGN_LOCAL) {
                    stack.unshift(popped);
                    stack.unshift(tokens.pop());
                } else {
                    stack.unshift(popped === MARK ? popped : resolveToken(popped));
                }
            } else {
                error("Syntax error");
            }
        }
        return stack[1];
    }

    function execLines(program, env) {
        const lines = program.split("\n");
        let result = undef;

        for(let i = 0; i < lines.length; i++) {
            if(!/^NB\./.test(lines[i].trim())) {
                result = evalJ(lines[i], env);
            }
        }
        return result;
    }

    function execStatement(program, env, instruction) {
        const car = p => p[0];
        const cdr = p => p[1];
        const lista = anArray => {
            const inner = i => i < anArray.length ? [anArray[i], inner(i + 1)] : null;

            return inner(0);
        };
        const list = (...args) => lista(args);
        const forEach = (f, list) => list === null ? null : (f(car(list)), forEach(f, cdr(list)), list);

        const makeInst = inst => [inst, null];
        const setInstF = (inst, f) => inst[1] = f;
        const getInst = inst => inst[0];
        const getInstF = inst => inst[1];
        const makeLabel = (label, inst) => [label, inst];
        const getLabelName = label => label[0];
        const getLabelInst = label => label[1];
        const lookupLabel = (labels, name) =>
            labels === null
            ? error("Label not found: " + name)
            : getLabelName(car(labels)) === name
            ? getLabelInst(car(labels))
            : lookupLabel(cdr(labels), name);

        const type = inst => inst[0];
        const getLabel = inst => inst[1];
        const getBlock = inst => inst[1];
        const advance = pc => cdr(pc);

        const isCondTrue = a => isNumber(a) ? a : a;
        const instExecute = {
            makeBranchF: (inst, labels) => (v, pc) => isCondTrue(v) ? [v, lookupLabel(labels, getLabel(inst))] : [v, advance(pc)],
            makeJumpF: (inst, labels) => (v, pc) => [v, lookupLabel(labels, getLabel(inst))],
            makeExecBlockF: inst => (v, pc) => [execLines(getBlock(inst), env), advance(pc)],
            makeReturn: inst => (v, pc) => [v, null],
            makeAssert: inst => (v, pc) => error("Assertion error")
        };
        const insts = instruction || instExecute;

        const makeFunction = (inst, labels) =>
               type(inst) === "branch"
               ? insts.makeBranchF(inst, labels)
               : type(inst) === "jump"
               ? insts.makeJumpF(inst, labels)
               : type(inst) === "execBlock"
               ? insts.makeExecBlockF(inst)
               : type(inst) === "return"
               ? insts.makeReturn(inst)
               : type(inst) === "raise"
               ? insts.makeAssert(inst)
               : uncatchable("internal error: " + type(inst));

        const separateLabel = (code, cont) =>
               code === null
               ? cont(null, null)
               : separateLabel(
                     cdr(code),
                     (labels, insts) =>
                            typeof car(code) === "string"
                            ? cont([makeLabel(car(code), insts), labels], insts)
                            : cont(labels, [makeInst(car(code)), insts]));
        const update = (insts, labels) => forEach(inst => setInstF(inst, makeFunction(getInst(inst), labels)), insts);

        const assemble = code => separateLabel(code, (labels, insts) => (update(insts, labels), insts));
        let labelId = 0;
        const makeLabelName = name => name + (labelId++);

        function compile(program, env) {
            const blockRegex = /(?:'(?:''|[^'\n])*?'|[^])+?(?=$|(?:end|if|do|else|while|assert)\.)/y;
            const assertRegex = /(?:'(?:''|[^'\n])*?'|[^])+?(?=\n|$|(?:end|if|do|else|while|assert)\.)/y;

            const compileReturn = (breakLabel, continueLabel) => M.choice(
                M.from(/[^]*?return\./y).select(stmt => {
                    const st2 = stmt.substring(0, stmt.length - 7).trim();

                    return st2 ? [["execBlock", st2], ["return"]] : [["return"]];
                }),
                M.from(/[^]*?break\./y).select(stmt => {
                    const st2 = stmt.substring(0, stmt.length - 6).trim();

                    return !breakLabel
                           ? error("Syntax error: break.")
                           : st2
                           ? [["execBlock", st2], ["jump", breakLabel]]
                           : [["jump", breakLabel]];
                }),
                M.from(/[^]*?continue\./y).select(stmt => {
                    const st2 = stmt.substring(0, stmt.length - 9).trim();

                    return !continueLabel
                           ? error("Syntax error: continue.")
                           : st2
                           ? [["execBlock", st2], ["jump", continueLabel]]
                           : [["jump", continueLabel]];
                }),
                M.from(/[^]*/y).select(stmt => stmt.trim() ? [["execBlock", stmt.trim()]] : [])
            );

            const parser = (breakLabel, continueLabel) => M.choice(
                M.from("if.")
                 .from(list(breakLabel, continueLabel)("do."))
                 .from("do.")
                 .from(list(breakLabel, continueLabel)("else."))
                 .from("else.")
                 .from(list(breakLabel, continueLabel)("end."))
                 .from("end.").select((_1, sif, _2, sdo, _3, selse, _4) => {
                    const condLabel = makeLabelName("cond");
                    const endLabel = makeLabelName("end");
                    let result = [];

                    result = result.concat(sif);
                    result.push(["branch", condLabel]);
                    result = result.concat(selse);
                    result.push(["jump", endLabel]);
                    result.push(condLabel);
                    result = result.concat(sdo);
                    result.push(endLabel);
                    return result;
                }),
                M.from("if.")
                 .from(list(breakLabel, continueLabel)("do."))
                 .from("do.")
                 .from(list(breakLabel, continueLabel)("end."))
                 .from("end.").select((_1, sif, _2, sdo, _3) => {
                    const condLabel = makeLabelName("cond");
                    const endLabel = makeLabelName("end");
                    let result = [];

                    result = result.concat(sif);
                    result.push(["branch", condLabel]);
                    result.push(["jump", endLabel]);
                    result.push(condLabel);
                    result = result.concat(sdo);
                    result.push(endLabel);
                    return result;
                }),
                M.from(loop()).select(x => x),
                M.from(blockRegex).select(block => block.trim() ? compileReturn(breakLabel, continueLabel)(block, 0)[1] : [])
            );

            const loop = () => {
                const breakLabel = makeLabelName("break");
                const continueLabel = makeLabelName("cont");

                return M.choice(
                    M.from("while.")
                     .from(list(null, null)("do."))
                     .from("do.")
                     .from(list(breakLabel, continueLabel)("end."))
                     .from("end.")
                     .select((_1, scond, _2, sdo, _3) => {
                         const doLabel = makeLabelName("do");
                         let result = [];

                         result.push(continueLabel);
                         result = result.concat(scond);
                         result.push(["branch", doLabel]);
                         result.push(["jump", breakLabel]);
                         result.push(doLabel);
                         result = result.concat(sdo);
                         result.push(["jump", continueLabel]);
                         result.push(breakLabel);
                         return result;
                    })
                );
            };

            const list = (breakLabel, continueLabel) => follow => M.letrec(list => M.choice(
                M.from(follow ? M.lookahead(follow) : /$/y).select(_1 => []),
                M.from("assert.")
                 .from(assertRegex)
                 .from(/\n*/y)
                 .from(list)
                 .select((_1, block, _2, list) => {
                    const condLabel = makeLabelName("cond");

                    if(block.trim()) {
                        let result = [];

                        result = compileReturn(breakLabel, continueLabel)(block, 0)[1];
                        result.push(["branch", condLabel]);
                        result.push(["raise"]);
                        result.push(condLabel);
                        result = result.concat(list);
                        return result;
                    } else {
                        error("Syntax error: invalid assertion");
                    }
                 }),
                M.from(parser(breakLabel, continueLabel)).from(list).select((p, list) => p.concat(list))
            ));

            return list(null, null)(null)(program, 0)[1];
        }

        function exec() {
            const compiled = lista(compile(program, env));
            const assembled = assemble(compiled);
            let value = undef;
            let pc = assembled;

            while(pc !== null) {
                [value, pc] = getInstF(car(pc))(value, pc);
            }
            return value;
        }
        return exec();
    }

    function execProgram(program, environment) {
        function getExplicit() {
            const buf = [];

            linePointer++;
            for(; !/^[ \t]*\)/.test(lines[linePointer]); linePointer++) {
                if(linePointer >= lines.length) {
                    error("Unexpected EOS");
                } else {
                    buf.push(lines[linePointer]);
                }
            }

            const baseline = lines[linePointer].indexOf(")");
            const result = buf.map(s => s.substring(baseline).replace(/[ \t]*$/, ""));
            return result.join("\n");
        }

        const joinArray = (s, j) => typeof s === "string" ? s : s.join(j);

        // TODO refactor them
        const cdr = p => p[1];
        const getBlock = inst => inst[1];
        const advance = pc => cdr(pc);
        const removeComment = block => block.split("\n").filter(s => !/^NB\./.test(s.trim())).join("\n");
        const searchVerbParameter = block => tokenizePass1(removeComment(block)).reduce((accum, v) => accum || (isSymbol(v) && /^[xy]$/.test(getName(v))), false);
        const instSearch = {
            makeBranchF: (inst, labels) => (v, pc) => [v, advance(pc)],
            makeJumpF: (inst, labels) => (v, pc) => [v, advance(pc)],
            makeExecBlockF: inst => (v, pc) => [v || searchVerbParameter(getBlock(inst)), advance(pc)],
            makeReturn: inst => (v, pc) => [v, advance(pc)],
            makeAssert: inst => (v, pc) => [v, advance(pc)]
        };

        const splitAmbivalent = s => s.split(/^[ \t]*:[ \t]*$/m, 2);
        const splitMonad = s => s[0];
        const splitDyad = s => s[1];

        const env = environment || rootEnv;

        const colonConjunction = (fp, fy) => p => execStatement(p, env, instSearch)
            ? markConjunction((u, v) => {
                const closeEnv = makeEnv(env, e => (e.set("m", u), e.set("u", u), e.set("n", v), e.set("v", v)));

                return colonVerb(s => fy(s, u, v), closeEnv)(p);
            }, fp(p))
            : markConjunction((u, v) => execStatement(p, makeEnv(env, e => (e.set("m", u), e.set("u", u), e.set("n", v), e.set("v", v)))), fp(p));

        const colonAdverb = (fp, fy) => p => execStatement(p, env, instSearch)
            ? markAdverb(u => {
                const closeEnv = makeEnv(env, e => (e.set("m", u), e.set("u", u)));

                return colonVerb(v => fy(v, u), closeEnv)(p);
            }, fp(p))
            : markAdverb(u => execStatement(p, makeEnv(env, e => (e.set("m", u), e.set("u", u)))), fp(p));

        const colonVerb = (fp, env) => p => {
            const splitted = splitAmbivalent(p);

            return markVerb((x, y) =>
                y === undef
                ? execStatement(splitMonad(splitted), makeEnv(env, e => e.set("y", x)))
                : splitDyad(splitted)
                ? execStatement(splitDyad(splitted), makeEnv(env, e => (e.set("x", x), e.set("y", y))))
                : error("dyad not defined: " + p), fp(p), [inf, inf, inf]);
        };
        const unboxString = b => isArray(unbox(b)) ? unbox(b).join("") : [unbox(b)];

        const colon = markConjunction(A.pattern([{
            pattern: [$0, $0],
            f: () => (getExplicit() + "\n").split("")
        },
        {
            pattern: [$1, A.pred(0, isSimpleString)],
            f: p => colonAdverb(s => "1 : '" + s + "'", (s, u) => getToString(u) + " (1 : '" + s + "')")(joinArray(p, ""))
        },
        {
            pattern: [$1, A.pred(0, isArray)],
            cond: a => getRank(a) === 1 && a.every(v => isBox(v) && isSimpleString(unbox(v))),
            f: p => colonAdverb(s => "1 : 0\n" + s + "\n)", (s, u) => getToString(u) + " (1 : 0)\n" + s + "\n)")(joinArray(p.map(v => unboxString(v)), "\n"))
        },
        {
            pattern: [$1, $0],
            f: () => {
                const innerProgram = getExplicit().trim();

                return colonAdverb(p => "1 : 0\n" + p + "\n)", (p, u) => getToString(u) + " (1 : 0)\n" + p + "\n)")(innerProgram);
            }
        },
        {
            pattern: [2, A.pred(0, isSimpleString)],
            f: p => colonConjunction(s => "2 : '" + s + "'", (s, u, v) => getToString(u) + " (2 : '" + s + "')" + getToString(v))(joinArray(p, ""))
        },
        {
            pattern: [2, A.pred(0, isArray)],
            cond: a => getRank(a) === 1 && a.every(v => isBox(v) && isSimpleString(unbox(v))),
            f: p => colonConjunction(s => "2 : 0\n" + s + "\n)", (s, u, v) => getToString(u) + " (2 : 0)\n" + s + "\n" + getToString(v) + ")")
                (p.map(v => unboxString(v)).join("\n"))
        },
        {
            pattern: [2, $0],
            f: () => {
                const innerProgram = getExplicit().trim();

                return colonConjunction(p => "2 : 0\n" + p + "\n)", (p, u, v) => getToString(u) + " (2 : 0) " + getToString(v) + "\n" + p + "\n)")(innerProgram);
            }
        },
        {
            pattern: [3, $0],
            f: () => {
                const innerProgram = getExplicit().trim();

                return colonVerb(s => "3 : 0\n" + s + "\n)", env)(innerProgram);
            }
        },
        {
            pattern: [3, A.pred(0, isSimpleString)],
            f: p => {
                const prog = isArray(p) ? p.join("") : p;

                return colonVerb(s => "3 : '" + s + "'", env)(prog);
            }
        },
        {
            pattern: [3, A.pred(0, isArray)],
            cond: a => getRank(a) === 1 && a.every(v => isBox(v) && isSimpleString(unbox(v))),
            f: p => colonVerb(s => "3 : 0\n" + s + "\n)", env)(joinArray(p.map(v => unboxString(v)), "\n"))
        },
        {
            pattern: [4, $0],
            f: () => {
                const innerProgram = getExplicit().trim();

                return markVerb((x, y) => execStatement(innerProgram, makeEnv(env, e => (e.set("y", y), e.set("x", x)))), "4 : 0\n" + innerProgram + "\n)", [inf, inf, inf])
            }
        },
        {
            pattern: [4, A.pred(0, isSimpleString)],
            f: p => {
                const prog = isArray(p) ? p.join("") : p;

                return markVerb((x, y) => execStatement(prog, makeEnv(env, e => (e.set("x", x), e.set("y", y)))), "4 : '" + prog + "'", [inf, inf, inf])
            }
        },
        {
            pattern: [4, A.pred(0, isArray)],
            cond: a => getRank(a) === 1 && a.every(v => isBox(v) && isSimpleString(unbox(v))),
            f: p => {
                const innerProgram = p.map(v => unboxString(v)).join("\n");

                return markVerb((x, y) => execStatement(innerProgram, makeEnv(env, e => (e.set("x", x), e.set("y", y)))), "4 : 0\n" + innerProgram + "\n)", [inf, inf, inf])
            }
        }]), ":");
        const lines = program.split("\n");
        let linePointer = 0;
        let result = null;

        env.set(":", colon);
        env.set("def", colon);
        evalJ("define      =: : 0");
        for(; linePointer < lines.length; linePointer++) {
            if(!/^NB\./.test(lines[linePointer].trim())) {
                result = evalJ(lines[linePointer], env);
            }
        }
        return result;
    }

    const others = {
        toString: v => getToString(v),
        assign: assign,
        refer: refer,
        hook: hook,
        fork: fork,
        tokenize: tokenize,
        eval: evalJ,
        exec: execProgram,
        isNoun: isNoun,
        isVerb: isVerb,
        isAdverb: isAdverb,
        isConjunction: isConjunction,
        isBox: isBox,
        unbox: unbox,
        Exception: Exception
    };
    const me = mergeObject(builtIn, others);

    me.eval("noun        =: 0");
    me.eval("adverb      =: 1");
    me.eval("conjunction =: 2");
    me.eval("verb        =: 3");
    me.eval("monad       =: 3");
    me.eval("dyad        =: 4");

    return me;
}


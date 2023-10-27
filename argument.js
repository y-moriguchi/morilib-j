/**
 * Morilib J
 *
 * Copyright (c) 2023 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
function Argument(option) {
    const undef = void 0;
    const REPEAT = Symbol("REPEAT");
    const OPT = Symbol("OPT");
    const END = Symbol("END");

    const optattr = option ?? {};
    const defaultAction = optattr.defaultAction ?? (() => error("Not Matched"));

    function error(msg) {
        throw new Error(msg);
    }

    function copySet(args, index, value) {
        const result = args.slice();

        index >= 0 && (result[index] = value);
        return result;
    }

    const firstRest = (obj, args) => {
        return !Array.isArray(obj)
               ? null
               : obj.length === 0
               ? null
               : copySet(copySet(args, 0, obj[0]), 1, obj.slice(1));
    };

    const pred = (index, pred) => (obj, args) => pred(obj) ? copySet(args, index, obj) : null;
    const argsLength = (len, pred) => (obj, args) => {
        if(!Array.isArray(obj) || obj.length !== len) {
            return null;
        } else {
            const result = args.slice();

            for(let i = 0; i < len; i++) {
                if(!pred || pred(obj[i])) {
                    result[i] = obj[i];
                } else {
                    return null;
                }
            }
            return result;
        }
    };

    const opt = (index, pred, defvalue) => {
        function inner(obj, args, rest, type) {
            if(type === "array") {
                if(!Array.isArray(obj)) {
                    return null;
                } else if(obj.length === 0 || !pred(obj[0])) {
                    const argsOpt = matchPattern(rest, obj, args);

                    return argsOpt === null ? null : copySet(argsOpt, index, defvalue);
                } else {
                    const argsRest = matchPattern(rest, obj.slice(1), args);

                    return argsRest === null ? null : copySet(argsRest, index, obj[0]);
                }
            } else {
                return copySet(args, index, pred(obj) ? obj : defvalue);
            }
        }

        inner[OPT] = true;
        return inner;
    };

    const any = obj => true;
    const type = typeStr => obj => typeof obj === typeStr;
    const is = classe => obj => obj instanceof classe;
    const isNot = classe => obj => !(obj instanceof classe);
    const empty = obj => Array.isArray(obj) && obj.length === 0;
    const not = pred => obj => !pred(obj);

    const choice = (...ptns) => (obj, args) => ptns.length === 0 ? null : matchPattern(ptns[0], obj, args) ?? choice(...ptns.slice(1))(obj, args);

    function repeat(index, pred) {
        function inner(obj, args, argsList, rest) {
            if(!Array.isArray(obj)) {
                return null;
            } else if(obj.length === 0) {
                return rest.length === 0 ? copySet(args, index, argsList) : null;
            } else if(pred(obj[0])) {
                const result = inner(obj.slice(1), args, argsList.concat([obj[0]]), rest);

                if(result === null) {
                    const argsRest = matchPattern(rest, obj, args);

                    return argsRest === null ? null : copySet(argsRest, index, argsList);
                } else {
                    return result;
                }
            } else {
                const argsRest = matchPattern(rest, obj, args);

                return argsRest === null ? null : copySet(argsRest, index, argsList);
            }
        }

        const rule = (obj, args, rest) => inner(obj, args, [], rest);

        rule[REPEAT] = true;
        return rule;
    }

    function repeatNotBacktrack(index, pred) {
        function inner(obj, args, rest) {
            const result = [];
            let i;

            for(i = 0; i < obj.length; i++) {
                if(pred(obj[i])) {
                    result.push(obj[i]);
                } else {
                    break;
                }
            }

            const argsRest = matchPattern(rest, obj.slice(i), args);

            return argsRest === null ? null : copySet(argsRest, index, result); 
        }

        inner[REPEAT] = true;
        return inner;
    }

    function matchPattern(ptn, obj, args) {
        function ptnArray(ptn, obj, args) {
            if(ptn.length === 0 && obj.length === 0) {
                return args;
            } else if(ptn.length === 0) {
                return null;
            } else if(ptn[0][REPEAT]) {
                return ptn[0](obj, args, ptn.slice(1));
            } else if(ptn[0][OPT]) {
                return ptn[0](obj, args, ptn.slice(1), "array");
            } else if(obj.length === 0) {
                return null;
            } else if(typeof ptn[0] === "function") {
                const argsNew = ptn[0](obj[0], args);

                return argsNew === null ? null : ptnArray(ptn.slice(1), obj.slice(1), argsNew);
            } else if(typeof ptn[0] === "object" && ptn[0] !== null) {
                return ptnObject(ptn[0], obj[0], args);
            } else {
                return ptn[0] === obj[0] ? ptnArray(ptn.slice(1), obj.slice(1), args) : null;
            }
        }

        function ptnObject(ptn, obj, args) {
            let argsNew = args;

            if(typeof obj !== "object" || obj === null) {
                return null;
            }

            for(const key of Object.keys(ptn)) {
                if(obj[key] === undef) {
                    if(!ptn[key][OPT]) {
                        return null;
                    } else {
                        argsNew = ptn[key](obj, argsNew, [], "object");
                    }
                } else if(typeof ptn[key] === "function") {
                    argsNew = ptn[key](obj[key], argsNew);
                    if(argsNew === null) {
                        return null;
                    }
                } else {
                    return ptn[key] === obj[key] ? args : null;
                }
            }
            return argsNew;
        }

        function dispatch(ptn, obj, args) {
            return typeof ptn === "function"
                   ? ptn(obj, args)
                   : Array.isArray(obj) && Array.isArray(ptn)
                   ? ptnArray(ptn, obj, args)
                   : Array.isArray(obj) || Array.isArray(ptn)
                   ? null
                   : ptn !== null && typeof ptn === "object" && obj !== null && typeof obj === "object"
                   ? ptnObject(ptn, obj, args)
                   : null;
        }
        return dispatch(ptn, obj, args);
    }

    function pattern(ptns) {
        function exec(ptn, obj) {
            const args = matchPattern(ptn.pattern, obj, []);

            return args === null ? END : (!ptn.cond || ptn.cond(...args)) ? ptn.f(...args) : END;
        }

        function inner(ptn) {
            return (...obj) => {
                const r = !Array.isArray(ptn)
                          ? error("Patterns must be an array")
                          : ptn.length === 0
                          ? defaultAction()
                          : exec(ptn[0], obj);

                return r === END ? inner(ptn.slice(1))(...obj) : r;
            }
        }

        return inner(ptns);
    }

    const me = {
        pattern: pattern,
        firstRest: firstRest,
        empty: empty,
        argsLength: argsLength,
        pred: pred,
        not: not,
        any: any,
        type: type,
        is: is,
        isNot: isNot,
        opt: opt,
        choice: choice,
        repeat: repeat,
        repeatNotBacktrack: repeatNotBacktrack
    };

    return me;
}


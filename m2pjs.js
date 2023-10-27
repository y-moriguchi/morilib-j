/**
 * Morilib J
 *
 * Copyright (c) 2023 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
function MonadicParser(skipPattern) {
    const undef = void 0;
    const $ = x => (console.log(x), x);
    const skip = skipPattern ? ((s, i) => [regex(skipPattern)(s, i)[0] ?? i, null]) : ((s, i) => [i, null]);
    const patternFloat = /[\+\-]?(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)(?:[eE][\+\-]?[0-9]+)?/;

    function matchString(match) {
        return (s, i) => s.startsWith(match, i) ? [i + match.length, match] : [null, null];
    }

    function regex(pattern, f) {
        const stickyPattern = new RegExp(pattern.source, "y");
        const f0 = f ?? (x => x);

        return (s, i) => {
            stickyPattern.lastIndex = i;

            const matched = stickyPattern.exec(s);

            return matched === null ? [null, null] : [stickyPattern.lastIndex, f0(matched[0])];
        };
    }

    function select(parsers, func) {
        function selectInner(parsers, value) {
            return (s, i) => {
                if(parsers.length === 0) {
                    return [i, func(...value)];
                } else {
                    const [result, v] = parsers[0](s, i);

                    return result === null ? [null, null] : selectInner(parsers.slice(1), value.concat([v]))(s, result);
                }
            };
        }
        return selectInner(parsers, []);
    }

    function skipSpace(parser) {
        return select([parser, skip], (x, y) => x);
    }

    function wrap(anObject) {
        if(typeof anObject === "string") {
            return skipSpace(matchString(anObject));
        } else if(anObject instanceof RegExp) {
            return skipSpace(regex(anObject));
        } else {
            return anObject;
        }
    }

    function from(parser1) {
        const parsers = [];

        function fromInner(parser) {
            parsers.push(wrap(parser));
            return {
                from: fromInner,
                select: func => select(parsers, func)
            }
        }
        return fromInner(parser1);
    }

    function real() {
        return skipSpace(regex(patternFloat, x => parseFloat(x)));
    }

    function lookahead(parser) {
        return (s, i) => {
            const [idx, v] = wrap(parser)(s, i);

            return idx === null ? [null, null] : [i, v];
        }
    }

    function lookaheadNot(parser) {
        return (s, i) => [wrap(parser)(s, i)[0] === null ? i : null, null];
    }

    function choice(...parsers) {
        return (s, idx) => {
            for(let i = 0; i < parsers.length; i++) {
                const [idx2, v] = parsers[i](s, idx);

                if(idx2 !== null) {
                    return [idx2, v];
                }
            }
            return [null, null];
        }
    }

    function zeroOrMore(parser) {
        return (s, idx) => {
            let idx2 = idx, v = null;

            while(true) {
                const [idxNew, v2] = parser(s, idx2);

                if(idxNew === null) {
                    return [idx2, v];
                } else {
                    idx2 = idxNew;
                    v = v2;
                }
            }
            return [idx2, v];
        };
    }

    function key(word) {
        return select([str(word), lookahead(regex(skipPattern))], (x, y) => x);
    }

    function letrec(...l) {
        const delays = [];
        const memo = [];

        for(let i = 0; i < l.length; i++) {
            (function(i) {
                delays.push(function(...args) {
                    if(!memo[i]) {
                        memo[i] = l[i].apply(null, delays);
                    }
                    return memo[i].apply(null, args);
                });
            })(i);
        }
        return delays.at(0);
    }

    return {
        str: skipSpace(matchString),
        regex: skipSpace(regex),
        real: real,
        lookahead: lookahead,
        lookaheadNot: lookaheadNot,
        from: from,
        choice: choice,
        zeroOrMore: zeroOrMore,
        letrec: letrec
    };
}


/**
 * Morilib J
 *
 * Copyright (c) 2023 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
/*
 * This test case is described for Jasmine.
 */
describe("morilib-pattern", function() {
    function ok(actual, expected) {
        expect(expected).toEqual(actual);
    }

    function oknum(actual, expected) {
        expect(expected).toBeCloseTo(actual, 6);
    }

    function oknumArray(actual, expected) {
        expected.forEach((v, i) => expect(expected[i]).toBeCloseTo(actual[i], 4));
    }

    const stoa = s => Array.from(s);
    const $1 = true;
    const $0 = false;
    const _ = Number.POSITIVE_INFINITY;

    beforeEach(function() {
    });

    describe("testing morilib-pattern", function() {
        it("chapter1", () => {
            const J = MorilibJ();

            ok(J["#"](J["$"](17)), 0);
            ok(J["+"](2, 4), 6);
            ok(J["+"](2, 3), 5);
            ok(J["*"](2, 3), 6);
            ok(J["%"](3, 4), 0.75);
            ok(J["-"](2, 3), -1);
            ok(J["-"](3), -3);
            ok(J["^"](2, 3), 8);
            ok(J["*:"](4), 16);
            ok(J["*:"]([1, 2, 3, 4]), [1, 4, 9, 16]);
            ok(J["+"]([1, 2, 3], [10, 20, 30]), [11, 22, 33]);
            ok(J["+"](1, [10, 20, 30]), [11, 21, 31]);
            ok(J["+"]([1, 2, 3], 10), [11, 12, 13]);
            ok(J["|"](2, [0, 1, 2, 3, 4, 5, 6, 7]), [0, 1, 0, 1, 0, 1, 0, 1]);
            ok(J["|"](3, [0, 1, 2, 3, 4, 5, 6, 7]), [0, 1, 2, 0, 1, 2, 0, 1]);
            ok((J.assign("x", 100), J.refer("x")), 100);
            ok((J.assign("y", J["-"](J.refer("x"), 1)), J.refer("y")), 99);
            ok((J.assign("z", 6), J.assign("z", 8), J.refer("z")), 8);
            ok(J["+"](1, J.assign("u", 99)), 100);
            ok(J.refer("u"), 99);
            ok(J["/"](J["+"])([2, 3, 4]), 9);
            ok(J["/"](J["*"])([2, 3, 4]), 24);
            ok(J[">"](2, 1), $1);
            ok(J["="](2, 1), $0);
            ok(J["<"](2, 1), $0);
            ok((J.assign("x", [5, 4, 1, 9]), J[">"](J.refer("x"), 2)), [$1, $1, $0, $1]);
            ok(J["/"](J["*"])(J[">"](J.refer("x"), 2)), 0);
            ok(J["#"](J.refer("x")), 4);
            ok(J["#"]([1, 1, 0, 1, 0], J.assign("y", [6, 7, 8, 9, 10])), [6, 7, 9])
            ok(J["#"](J[">"](J.refer("y"), 7), J.refer("y")), [8, 9, 10]);
            ok(J[">."]([-1.7, 1, 1.7]), [-1, 1, 2]);
            ok(J[">."](3, [1, 3, 5]), [3, 3, 5]);
            ok(J["/"](J[">."])([1, 6, 5]), 6);
            ok(J[">:"]([-2, 3, 5, 6.3]), [-1, 4, 6, 7.3]);
            ok(J[">:"](3, [1, 3, 5]), [$1, $1, $0]);
        });

        it("chapter2", () => {
            const J = MorilibJ();

            ok(J["$"]([2, 3], [5, 6, 7, 8, 9, 10]), [[5, 6, 7], [8, 9, 10]]);
            ok(J["$"]([2, 4], [5, 6, 7, 8, 9]), [[5, 6, 7, 8], [9, 5, 6, 7]]);
            ok(J["$"]([2, 2], [1]), [[1, 1], [1, 1]]);
            J.assign("table", [[5, 6, 7], [8, 9, 10]]);
            ok(J["*"](10, J.refer("table")), [[50, 60, 70], [80, 90, 100]]);
            ok(J["+"](J.refer("table"), J.refer("table")), [[10, 12, 14], [16, 18, 20]]);
            ok(J["*"]([0, 1], J.refer("table")), [[0, 0, 0], [8, 9, 10]]);
            ok(J["$"]([3], [1]), [1, 1, 1]);
            ok(J["$"]([2, 3], [5, 6, 7]), [[5, 6, 7], [5, 6, 7]]);
            ok(J["$"]([2, 2, 3], [5, 6, 7, 8]), [[[5, 6, 7], [8, 5, 6]], [[7, 8, 5], [6, 7, 8]]]);
            ok(J["#"]([6, 7]), 2);
            ok(J["#"]([6, 7, 8]), 3);
            ok(J["$"]([5, 6, 7]), [3]);
            ok(J["$"](J["$"]([2, 3], [1])), [2, 3]);
            ok(J["#"](J["$"]([5, 6, 7])), 1);
            ok(J["#"](J["$"]([[1, 1, 1], [1, 1, 1]])), 2);
            ok(J["#"](J["$"](17)), 0);
            //ok(J["$"]([0], [99]), []);
            ok(J["#"](J["$"](17)), 0);
            ok(J["#"](J["$"]([17])), 1);
            ok(J["#"](J["$"]([[17]])), 2);
            ok(J["#"](J["$"](J["$"]([3, 1], [5, 6, 7]))), 2);
            ok(stoa("Nina"), ["N", "i", "n", "a"]);
            ok(J[","](stoa("rear"), stoa("ranged")), stoa("rearranged"));
            ok(J[","](0, [1, 2, 3]), [0, 1, 2, 3]);
            ok(J[","]([1, 2, 3], 0), [1, 2, 3, 0]);
            ok(J[","](0, 0), [0, 0]);
            ok(J[","]([1, 2, 3], [1, 2, 3]), [1, 2, 3, 1, 2, 3]);
            ok(J[","](J["$"]([2, 3], stoa("catdog")), J["$"]([2, 3], stoa("ratpig"))), J["$"]([4, 3], stoa("catdogratpig")));
            ok(J["#"]([1, 2, 3]), 3);
            ok(J["#"](J["$"]([2, 3], stoa("catdog"))), 2);
            ok(J["#"](6), 1);
            ok(J["/"](J["+"])(J["$"]([3, 2], [1, 2, 3, 4, 5, 6])), [9, 12]);
            ok(J["{"](0, stoa("abcd")), "a");
            ok(J["{"](1, stoa("abcd")), "b");
            ok(J["{"](3, stoa("abcd")), "d");
            ok(J["{"]([0, 1], stoa("abcd")), stoa("ab"));
            ok(J["{"]([3, 0, 1], stoa("abcd")), stoa("dab"));
            ok(J["i."](4), [0, 1, 2, 3]);
            ok(J["i."]([2, 3]), [[0, 1, 2], [3, 4, 5]]);
            ok(J["i."](stoa("park"), "k"), 3);
            ok(J["i."](stoa("parka"), "a"), 1);
            ok(J["i."](stoa("park"), "j"), 4);
            ok(J["-:"](stoa("abc"), stoa("abc")), true);
            ok(J["-:"](stoa("abc"), [1, 2, 3, 4]), false);
            ok(J["-:"](stoa(""), []), true);
            ok(J["="]([1, 2, 3, 4], [1, 5, 6, 4]), [$1, $0, $0, $1]);
            expect(() => J["="]([1, 2, 3, 4], [1, 5, 6])).toThrow();
            ok(J["{"](0, J[";"](stoa("Ichihara"), 27)), J["<"](stoa("Ichihara")));
            expect(() => J[","]("Ichihara", 27)).toThrow();
            ok(J["\":"](27), stoa("27"));
            ok(J["#"](J["\":"](27)), 2);
            ok(J[","](stoa("Ichihara"), J["\":"](27)), stoa("Ichihara27"));
            ok(J[">"](J["<"]([1, 2, 3])), [1, 2, 3]);
            ok(J["-:"](J[","](J["<"]([1, 1]), J[","](J["<"]([2, 2]), J["<"]([3, 3]))), J[";"]([1, 1], J[";"]([2, 2], [3, 3]))), true);
        });

        it("chapter3", () => {
            const J = MorilibJ();

            ok((J.assign("square", J["*:"]), J.refer("square")([1, 2, 3, 4])), [1, 4, 9, 16]);
            ok((J.assign("Ceiling", J[">."]), J.refer("Ceiling")(1.7)), 2);
            ok((J.assign("Max", J[">."]), J.refer("Max")(3, 4)), 4);
            ok((J.assign("sum", J["/"](J["+"])), J.refer("sum")([2, 3, 4])), 9);
            ok(J["~"](J[","])("a", "b"), ["b", "a"]);
            ok((J.assign("mod", J["~"](J["|"])), J.refer("mod")(7, 2)), 1);
            ok((J.assign("double", J["&"](J["*"], 2)), J.refer("double")(3)), 6);
            ok((J.assign("tax", J["&"](0.1, J["*"])), J.refer("tax")(50)), 5);
            ok((J.assign("sumsq", J["@:"](J.refer("sum"), J.refer("square"))), J.refer("sumsq")([1, 2, 3])), 14);
            ok((J.assign("s", J["&"](J["-"], 32)), J.assign("m", J["&"](J["*"], 5 / 9)), J.assign("convert", J["@:"](J.refer("m"), J.refer("s"))), J.refer("convert")(212)), 100);
            ok((J.assign("conv", J["@:"](J["&"](J["*"], 5 / 9), J["&"](J["-"], 32))), J.refer("conv")(212)), 100);
            ok((J.assign("total", J["@:"](J.refer("sum"), J["*"])), J.refer("total")([2, 3], [1, 100])), 302);
            ok((J.assign("payable", J.hook(J["+"], J.refer("tax"))), J.refer("payable")(50)), 55);
            ok((J.assign("wholenumber", J.hook(J["="], J["<."])), J.refer("wholenumber")([3, 2.7])), [$1, $0]);
            ok((J.assign("mean", J.fork(J.refer("sum"), J["%"], J["#"])), J.refer("mean")([3, 5, 7, 9])), 6);
            ok((J.assign("range", J.fork(J["/"](J["<."]), J[","], J["/"](J[">."]))), J.refer("range")([3, 5, 7, 9])), [3, 9]);
        });

/*
        it("tokenizer", () => {
            const J = MorilibJ();

            ok(J.tokenize("1827"), [1827]);
            ok(J.tokenize("xyz"), ["xyz"]);
            ok(J.tokenize("xyz27"), ["xyz27"]);
            ok(J.tokenize("+"), ["+"]);
            ok(J.tokenize("*:/"), ["*:", "/"]);
            ok(J.tokenize("a =: 0"), ["a", "=:", 0]);
            ok(J.tokenize("a =: (0 + 1)"), ["a", "=:", "(", 0, "+", 1, ")"]);
            ok(J.tokenize("18 27"), [[18, 27]]);
            ok(J.tokenize(" 18 27"), [[18, 27]]);
            ok(J.tokenize("18 27 72"), [[18, 27, 72]]);
            ok(J.tokenize("18 27 72 91"), [[18, 27, 72, 91]]);
        });
*/

        it("parser", () => {
            const J = MorilibJ();

            ok(J.eval("*: 4"), 16);
            ok(J.eval("- *: 4"), -16);
            ok(J.eval("3 * 4"), 12);
            ok(J.eval("+ / 1 2 3"), 6);
            ok(J.eval("1 & + 2"), 3);
            ok(J.eval("(1 + *:) 2 3"), [5, 10])
            ok(J.eval("(1+2)*3"), 9);
            ok(J.eval("+ (1 &) 2"), 3);
            ok(J.eval("1 + x =: 6"), 7);
            ok(J.refer("x"), 6);
        });

        it("exec", () => {
            const J = MorilibJ();

            ok(J.exec("*: 4"), 16);
            ok((J.exec(`txt =: 0 : 0
            This is a line.
            That is a line.
            )`), J.refer("txt")), stoa("This is a line.\nThat is a line.\n"));
            ok((J.exec(`txt =: 3 : 0
                y * y
            )`), J.exec("txt 3")), 9);
            J.assign("t", 1000);
            ok((J.exec(`Celsius =: 3 : 0
                t =. y - 32
                t * 5 % 9
            )`), J.exec("Celsius 32 212")), [0, 100]);
            ok(J.exec("1 + Celsius 32 212"), [1, 101]);
            ok(J.refer("t"), 1000);
            ok((J.exec(`posdiff =: 4 : 0
                larger =. x >. y
                smaller =. x <. y
                larger - smaller
            )`), J.exec("3 posdiff 4")), 1);
            ok(J.exec("4 posdiff 3"), 1);
            ok((J.exec("PosDiff =: 4 : '(x >. y) - (x <. y)'"), J.exec("3 PosDiff 4")), 1);
        });

        it("string", () => {
            const J = MorilibJ();

            ok(J.toString(J.exec("+")), "+");
            ok(J.toString(J.exec("/")), "/");
            ok(J.toString(J.exec("+/")), "+/");
            ok(J.toString(J.exec("~")), "~");
            ok(J.toString(J.exec("+~")), "+~");
            ok(J.toString(J.exec("&")), "&");
            ok(J.toString(J.exec("+&2")), "+&2");
            ok(J.toString(J.exec("2&+")), "2&+");
            ok(J.toString(J.exec("@:")), "@:");
            ok(J.toString(J.exec("+@:+")), "+@:+");
            ok(J.toString(J.exec("+ + +")), "+ + +");
            ok(J.toString(J.exec("(+ +) +")), "(+ +) +");
            ok((J.exec(`Celsius =: 3 : 0
                t =. y - 32
                t * 5 % 9
            )`), J.toString(J.exec("Celsius"))), "Celsius");
            ok((J.exec("PosDiff =: 4 : '(x >. y) - (x <. y)'"), J.toString(J.exec("PosDiff"))), "PosDiff");
        });

        it("type", () => {
            const J = MorilibJ();

            ok(J.exec("1"), true);
            ok(J.exec("0"), false);
            //ok(J.exec("1234567890x"), 1234567890n);
            ok(J.exec("1 + 1"), 2);
            ok(J.exec("1 + 2"), 3);
            //ok(J.exec("1 + 100x"), 101n);
            ok(J.exec("1 + 10.2"), 11.2);
            //ok(J.exec("21 + 100x"), 121n);
            ok(J.exec("21 + 10.2"), 31.2);
            //ok(J.exec("100x + 10.2"), 110.2);
            ok(J.exec("2 + 1"), 3);
            //ok(J.exec("100x + 2"), 102n);
        });

        it("statement", () => {
            const J = MorilibJ();

            ok((J.exec("test1 =: 3 : 'if. 1 do. 2 else. 3 end.'"), J.exec("test1 0")), 2);
            ok((J.exec(`test =: 3 : 0
                if. y > 100 do. 0 return. end.
                y
            )`), J.exec("test 101")), false);
            ok(J.exec("test 100"), 100);
            ok(J.exec(`test2 =: 3 : 0
                if. y > 100 do. 0 return. end.
                y
            )
            1`), true);
            ok(J.exec("test2 100"), 100);
            ok((J.exec(`test3 =: 3 : 0
                if. y > 100
                do. 0 return.
                end.
                y
            )`), J.exec("test3 101")), false);
            ok((J.exec("frac =: 3 : 'if. y > 1 do. y * frac y - 1 else. 1 end.'"), J.exec("frac 3")), 6);
            ok((J.exec("t2 =: 3 : 'if. 1 do. if. 1 do. 3 else. 2 end. else. 3 end.'"), J.exec("t2 0")), 3);
            ok((J.exec("t3 =: 3 : 'if. 1 do. if. 1 do. 3 else. 2 end. 4 else. 3 end.'"), J.exec("t3 0")), 4);
            ok((J.exec(`fact =: 3 : 0
                r =. 1
                while. y - 1
                do.    r =. r * y
                       y =. y - 1
                end.
                r
            )`), J.exec("fact 5")), 120);
            ok((J.exec(`fact =: 3 : 0
                r =. 1
                while. 1
                do.    r =. r * y
                       y =. y - 1
                       if. y do. 1 else. break. end.
                end.
                r
            )`), J.exec("fact 5")), 120);
            ok((J.exec("t4 =: 3 : 'if. 1 do. if. 1 do. 3 else. 2 end. ''else.'' else. 3 end.'"), J.exec("t4 0")), Array.from("else."));
            ok((J.exec("t5 =: 3 : 'if. 1 do. if. 1 do. 3 else. 2 end. ''''''else.'' else. 3 end.'"), J.exec("t5 0")), Array.from("'else."));
            ok((J.exec("t6 =: 3 : 'if. 1 do. if. 1 do. 3 else. 2 end. ''''''''''else.'''''' else. 3 end.'"), J.exec("t6 0")), Array.from("''else.'"));
            ok((J.exec(`test4 =: 3 : 0
                assert. y > 100
                y
            )`), J.exec("test4 101")), 101);
            expect(() => J.exec("test4 10")).toThrow();
            ok((J.exec(`test5 =: 3 : 0
                assert. y < 100
                assert. y > 10
                y
            )`), J.exec("test5 90")), 90);
            expect(() => J.exec("test5 9")).toThrow();
            expect(() => J.exec("test5 101")).toThrow();
            ok((J.exec(`test6 =: 3 : 0
                assert. y < 100
                assert. y > 10 if. 1 do. 2 else. 3 end.
            )`), J.exec("test6 90")), 2);
            ok((J.exec(`test6 =: 3 : 0
                if. 1 do. 2 else. 3 end.
                assert. y < 100
                assert. y > 10
                if. 1 do. 2 else. 3 end.
            )`), J.exec("test6 90")), 2);
            ok((J.exec(`test6 =: 3 : 0
                if. 1 do. 2 else. 3 end.
                assert. y < 100 if. 1 do. 2 else. 3 end.
                assert. y > 10
                if. 1 do. 2 else. 3 end.
            )`), J.exec("test6 90")), 2);
        });

        it("rank", () => {
            const J = MorilibJ();

            ok(J.exec("+ b. 0"), [0, 0, 0]);
            ok(J.exec("+/ \" 1 i. 2 3"), [3, 12]);
            ok(J.exec("+/\"1 i. 2 3 4"), [[6, 22, 38], [54, 70, 86]]);
            ok(J.exec("+/\"2 i. 2 3 4"), [[12, 15, 18, 21], [48, 51, 54, 57]]);
            ok(J.exec("+/\"3 i. 2 3 4"), [[12, 14, 16, 18], [20, 22, 24, 26], [28, 30, 32, 34]]);
            ok(J.exec("i.\"0 (2 2 2)"), [[0, 1], [0, 1], [0, 1]]);
            ok(J.exec("(i. 3 3) ,\"1 0 i. 3"), [[0, 1, 2, 0], [3, 4, 5, 1], [6, 7, 8, 2]]);
            ok(J.exec("'abc' ,\"_ 0 'defg'"), [Array.from("abcd"), Array.from("abce"), Array.from("abcf"), Array.from("abcg")]);
            ok(J.exec("1 2 3 +\"1 i. 2 3"), [[1, 3, 5], [4, 6, 8]]);
            ok(J.exec("100 200 300 +\"0\"0 _ (1 2 3 4)"), [[101, 102, 103, 104], [201, 202, 203, 204], [301, 302, 303, 304]]);
            ok(J.exec("100 200 +\"0\"_ 0 (1 2 3)"), [[101, 201], [102, 202], [103, 203]]);
            ok(J.exec("'ab' ,\"0\"0 _ 'def'"), [[Array.from("ad"), Array.from("ae"), Array.from("af")], [Array.from("bd"), Array.from("be"), Array.from("bf")]]);
            ok(J.exec("'ab' ,\"0\"_ 0 'def'"), [[Array.from("ad"), Array.from("bd")], [Array.from("ae"), Array.from("be")], [Array.from("af"), Array.from("bf")]]);
            ok(J.exec("+/\"1\"2 i. 2 3 4"), [[6, 22, 38], [54, 70, 86]]);
            ok(J.exec("+/\"2 i. 2 3 4"), [[12, 15, 18, 21], [48, 51, 54, 57]]);
            ok(J.exec("(i. 3 4) +\"1\"2 i. 2 3 4"), [[[0, 2, 4, 6], [8, 10, 12, 14], [16, 18, 20, 22]], [[12, 14, 16, 18], [20, 22, 24, 26], [28, 30, 32, 34]]]);
            ok(J.exec("+/\"_1 i. 3"), [0, 1, 2]);
            ok(J.exec("+/\"_1 i. 2 3"), [3, 12]);
            ok(J.exec("+/\"_2 i. 2 2 3"), [[3, 12], [21, 30]]);
            ok(J.exec("(i. 3) +\"_1 _1 i. 3"), [0, 2, 4]);
            ok(J.exec("i. 2 +\"_1 _1 i. 2"), [[0, 1, 2], [3, 4, 5]]);
            ok(J.exec("(i. 2) +\"_1 _1 (2)"), [2, 3]);
            ok(J.exec("2 +\"_1 _1 (2)"), 4);
        });

        it("fill", () => {
            const J = MorilibJ();

            ok(J.exec("i.\"0 (1 1 2 3)"), [[0, 0, 0], [0, 0, 0], [0, 1, 0], [0, 1, 2]]);
            ok(J.exec("i.\"0 (1 1 2 3)"), [[0, 0, 0], [0, 0, 0], [0, 1, 0], [0, 1, 2]]);
            ok(J.exec("i.\"1 (2 2 $ 1 2 3)"), [[[0, 1], [0, 0], [0, 0]], [[0, 0], [1, 0], [2, 0]]]);
            ok(J.exec("i.\"1 (2 2 2 $ 1 2 3)"),
                [[[[0, 1, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [1, 0, 0], [2, 0, 0]]], [[[0, 1, 2], [3, 4, 5], [0, 0, 0]], [[0, 1, 0], [0, 0, 0], [0, 0, 0]]]]);
        });

        it("backslash", () => {
            const J = MorilibJ();

            ok(J.exec("#\\ 4 5 6 7"), [1, 2, 3, 4]);
            ok(J.exec("]\\ i. 3"), [[0, 0, 0], [0, 1, 0], [0, 1, 2]]);
            ok(J.exec("+/\\ i. 6"), [0, 1, 3, 6, 10, 15]);
            ok(J.exec(">./\\ 9 5 3 10 3 2 20"), [9, 9, 9, 10, 10, 10, 20]);
            ok(J.exec("+\\ 2 2 $ 1 2 3 4"), [[[1, 2], [0, 0]], [[1, 2], [3, 4]]]);
            ok(J.exec("+/\\. 1 2 3 4"), [10, 9, 7, 4]);
            ok(J.exec("_2 ]\\ 100 2 110 6 120 8 130 3"), [[100, 2], [110, 6], [120, 8], [130, 3]]);
            ok(J.exec("2 -/\\ 10 8 6 4 2"), [2, 2, 2, 2]);
            ok(J.exec("2 -~/\\ 10 8 6 4 2"), [-2, -2, -2, -2]);
            ok(J.exec("3 -/\\ 10 8 6 4 2"), [8, 6, 4]);
            ok(J.exec("3 >./\\ 1 2 3 8 2 3 1 5 4 3 12 3 2"), [3, 8, 8, 8, 3, 5, 5, 5, 12, 12, 12]);
        });

        //it("empty", () => {
        //    const J = MorilibJ();

        //    ok(J.exec("$ +/ 2 0 3 $ 0"), [0, 3]);
        //    ok(J.exec('$ +/"2 (2 0 3 $ 0)'), [2, 3]);
        //    ok(J.exec('+/"2 (2 0 3 $ 0)'), [[0, 0, 0], [0, 0, 0]]);
        //    ok(J.exec('$ +/"1 (2 0 3 $ 0)'), [2, 0]);
        //    ok(J.exec('$ +/"0 (2 0 3 $ 0)'), [2, 0, 3]);
        //    ok(J.exec('$ <"2 (2 0 3 $ 0)'), [2]);
        //    ok(J.exec('$ <"1 (2 0 3 $ 0)'), [2, 0]);
        //    ok(J.exec('$ <"0 (2 0 3 $ 0)'), [2, 0, 3]);
        //    ok(J.exec('$ +\\ 2 0 3 $ 0'), [2, 2, 0, 3]);
        //    ok(J.exec('$ +\\"2 (2 0 3 $ 0)'), [2, 0, 0, 3]);
        //    ok(J.exec('$ +\\"1 (2 0 3 $ 0)'), [2, 0, 3, 3]);
        //    ok(J.exec('$ +\\"0 (2 0 3 $ 0)'), [2, 0, 3, 1, 1]);
        //    ok(J.exec('$ +\\. 2 0 3 $ 0'), [2, 2, 0, 3]);
        //    ok(J.exec('$ +\\."2 (2 0 3 $ 0)'), [2, 0, 0, 3]);
        //    ok(J.exec('$ +\\."1 (2 0 3 $ 0)'), [2, 0, 3, 3]);
        //    ok(J.exec('$ +\\."0 (2 0 3 $ 0)'), [2, 0, 3, 1, 1]);
        //    ok(J.exec('$ + (2 0 3 $ 0)'), [2, 0, 3]);
        //    ok(J.exec('$ - (2 0 3 $ 0)'), [2, 0, 3]);
        //    ok(J.exec('$ *: (2 0 3 $ 0)'), [2, 0, 3]);
        //    ok(J.exec('# (2 0 3 $ 0)'), 2);
        //    ok(J.exec('$ >: (2 0 3 $ 0)'), [2, 0, 3]);
        //    ok(J.exec('$ (2 0 3 $ 1) + 2 0 3 $ 1'), [2, 0, 3]);
        //    ok(J.exec('$ (2 0 3 4 $ 1) + 2 0 3 $ 1'), [2, 0, 3, 4]);
        //    ok(J.exec('$ (2 0 3 $ 1) + 2 0 3 4 $ 1'), [2, 0, 3, 4]);
        //    ok(J.exec('$ (2 0 3 $ 1) +" 2 (2 0 3 $ 1)'), [2, 0, 3]);
        //    ok(J.exec('$ (2 0 3 $ 1) +" 2 2 (2 0 3 $ 1)'), [2, 0, 3]);
        //    ok(J.exec('$ (2 0 3 $ 1) +" 2 0 (2 0 4 $ 1)'), [2, 0, 4, 0, 3]);
        //    ok(J.exec('$ (2 0 3 $ 1) +" 0 2 (2 0 4 $ 1)'), [2, 0, 3, 0, 4]);
        //    ok(J.exec('$ (2 0 3 $ 1) +" 2 (2)'), [2, 0, 3]);
        //    ok(J.exec('$ 2 +" 2 (2 0 3 $ 1)'), [2, 0, 3]);
        //});

        it("concat", () => {
            const J = MorilibJ();

            ok(J.exec('(2 2 3 $ 0) , 3 2 2 $ 1'), [[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]], [[1, 1, 0], [1, 1, 0]], [[1, 1, 0], [1, 1, 0]], [[1, 1, 0], [1, 1, 0]]])
            ok(J.exec('(2 2 3 $ 2) , 3 $ 1'), [[[2, 2, 2], [2, 2, 2]], [[2, 2, 2], [2, 2, 2]], [[1, 1, 1], [0, 0, 0]]]);
            ok(J.exec('(2 2 3 $ 2) , 3 3 $ 1'), [[[2, 2, 2], [2, 2, 2], [0, 0, 0]], [[2, 2, 2], [2, 2, 2], [0, 0, 0]], [[1, 1, 1], [1, 1, 1], [1, 1, 1]]]);
            ok(J.exec('(2 2 3 $ 2) , 3'), [[[2, 2, 2], [2, 2, 2]], [[2, 2, 2], [2, 2, 2]], [[3, 3, 3], [3, 3, 3]]]);
            ok(J.exec('(3 $ 1) , 2 2 3 $ 2'), [[[1, 1, 1], [0, 0, 0]], [[2, 2, 2], [2, 2, 2]], [[2, 2, 2], [2, 2, 2]]]);
            ok(J.exec('3 , 2 2 3 $ 2'), [[[3, 3, 3], [3, 3, 3]], [[2, 2, 2], [2, 2, 2]], [[2, 2, 2], [2, 2, 2]]]);
            ok(J.exec('3 , 3'), [3, 3]);
            //ok(J.exec('$ (2 0 3 $ 1) , (0 $ 2)'), [3, 1, 3]);
            //ok(J.exec('$ (2 0 3 0 $ 1) , (0 0 $ 2)'), [3, 1, 3, 0]);
            //ok(J.exec('$ (2 0 3 $ 1) , (3 0 4 $ 2)'), [5, 0, 4]);
            //ok(J.exec('$ (0 $ 1) , (2 0 3 $ 2)'), [3, 1, 3]);
            //ok(J.exec('(0 $ 1) , (2 0 3 $ 2)'), [[[0, 0, 0]], [[0, 0, 0]], [[0, 0, 0]]]);
            //ok(J.exec('$ (0 0 $ 1) , (2 0 3 0 $ 2)'), [3, 1, 3, 0]);
            //ok(J.exec('(2 0 3 $ 1) , (4 $ 2)'), [[[0, 0, 0, 0]], [[0, 0, 0, 0]], [[2, 2, 2, 2]]]);
            //ok(J.exec('(2 0 3 $ 1) , (2 4 $ 2)'), [[[0, 0, 0, 0], [0, 0, 0, 0]], [[0, 0, 0, 0], [0, 0, 0, 0]], [[2, 2, 2, 2], [2, 2, 2, 2]]]);
            //ok(J.exec('(2 0 $ 2) , (2 3 3 $ 1)'), [[[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[1, 1, 1], [1, 1, 1], [1, 1, 1]], [[1, 1, 1], [1, 1, 1], [1, 1, 1]]]);
            //ok(J.exec('(2 0 3 $ 2) , (2 3 3 $ 1)'), [[[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
            //    [[1, 1, 1], [1, 1, 1], [1, 1, 1]], [[1, 1, 1], [1, 1, 1], [1, 1, 1]]]);
            //ok(J.exec('(4 $ 1) , (2 0 3 $ 2)'), [[[1, 1, 1, 1]], [[0, 0, 0, 0]], [[0, 0, 0, 0]]]);
            //ok(J.exec('(2 4 $ 1) , (2 0 3 $ 2)'), [[[1, 1, 1, 1], [1, 1, 1, 1]], [[0, 0, 0, 0], [0, 0, 0, 0]], [[0, 0, 0 ,0], [0, 0, 0 ,0]]]);
            //ok(J.exec('(2 3 3 $ 1) , (2 0 $ 2)'), [[[1, 1, 1], [1, 1, 1], [1, 1, 1]], [[1, 1, 1], [1, 1, 1], [1, 1, 1]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]]]);
            //ok(J.exec('(2 3 3 $ 1) , (2 0 3 $ 2)'), [[[1, 1, 1], [1, 1, 1], [1, 1, 1]], [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
            //    [[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]]]);
        });

        it("explicit", () => {
            const J = MorilibJ();

            ok((J.exec("t1 =: 1 : 'u/'"), J.toString(J.exec("+ t1"))), "u/");   // TODO argument
            ok(J.exec("+ t1 1 2 3"), 6);
            ok((J.exec("t2 =: 1 : 'u/ y'"), J.toString(J.exec("+ t2"))), "+ (1 : 'u/ y')");
            ok(J.exec("+ t2 1 2 3"), 6);
            ok((J.exec(`t3 =: 1 : 0
                NB. (
                t =. u /
                t
            )`), J.toString(J.exec("+ t3"))), "t");   // TODO to throw error
            ok(J.exec("+ t3 1 2 3"), 6);
            ok((J.exec(`t4 =: 1 : 0
                NB. (
                t =. u /
                t y
                )`), J.toString(J.exec("+ t4"))), "+ (1 : 0)\nNB. (\nt =. u /\nt y\n)");
            ok(J.exec("+ t4 1 2 3"), 6);
            ok((J.exec(`t5 =: + (1 : 0)
                NB. (
                t =. u /
                t y
                )`), J.exec("+ t5 1 2 3")), 6);
            ok((J.exec(`t6 =: 3 : 0
                NB. (
                t =. +/ y
                t
                :
                t =. x + y
                t
                )`), J.exec("t6 1 2 3")), 6);
            ok(J.exec("2 t6 3"), 5);
            ok((J.exec("t7 =: 3 : ('t =. +/ y' ; 't + 2')"), J.exec("t7 1 2 3")), 8);
            ok((J.exec("t8 =: 3 : ('t =. +/ y' ; 't + 2' ; ':' ; 't =. x + y' ; 't + 2')"), J.exec("t7 1 2 3")), 8);
            ok(J.exec("2 t8 3"), 7);
            ok((J.exec("t9 =: 4 : ('t =. x + y' ; 't + 2')"), J.exec("2 t9 3")), 7);
            ok((J.exec("t10 =: 1 : ('t =. u /' ; 't y')"), J.exec("+ t10 1 2 3")), 6);
            J.exec(`NB. ((
                    (<;._2 (0 : 0)) =: <;._2 (0 : 0)
                Lorem ipsum dolor sit amet, consectetur
                adipiscing elit, sed do eiusmod
                )
                name1
                name2
                )`);
            ok(J.exec("name1"), stoa("Lorem ipsum dolor sit amet, consectetur"));
            ok(J.exec("name2"), stoa("adipiscing elit, sed do eiusmod"));
        });

        it("chapter5", () => {
            const J = MorilibJ();

            ok(J.exec("2 2 $ 0 1 2 3"), [[0, 1], [2, 3]]);
            ok(J.exec("2 3 $ 'ABCDEF'"), [stoa("ABC"), stoa("DEF")]);
            ok(J.exec("2 3 $ 'ABCD'"), [stoa("ABC"), stoa("DAB")]);
            ok((J.exec("A =: 2 3 $ 'ABCDEF'"), J.exec("$ A")), [2, 3]);
            ok((J.exec("a =: 'pqr'"), J.exec("$ a")), [3]);
            ok(J.exec("$ A"), [2, 3]);
            ok(J.exec("$ $ A"), [2]);
            ok(J.exec("$ $ $ A"), [1]);
            //ok((J.exec("E =: 0 $ 99"), J.exec("$ E")), [0]);
            //ok((J.exec("w =: E ,98"), J.exec("$ w")), [1]);
            //ok((J.exec("ET =: 0 3 $ 'x'"), J.exec("$ ET")), [0, 3]);
            //ok(J.exec("$ ET , 'pqr'"), [1, 3]);
            //ok((J.exec("S =: (0$0) $ 17"), J.exec("$ S")), 1);
            ok((J.exec("X =: 2"), J.exec("Y =: 3 4 $ 'A'")), [stoa("AAAA"), stoa("AAAA"), stoa("AAAA")]);
            ok((J.exec("Z =: X $ Y"), J.exec("Z")), [stoa("AAAA"), stoa("AAAA")]);
            J.exec("B =: 2 3 $ 'UVWXYZ'");
            J.exec("b =:   3 $ 'uvw'");
            ok(J.exec("a , b"), stoa("pqruvw"));
            ok(J.exec("A , B"), [stoa("ABC"), stoa("DEF"), stoa("UVW"), stoa("XYZ")]);
            ok(J.exec("A , b"), [stoa("ABC"), stoa("DEF"), stoa("uvw")]);
            ok(J.exec("A , (1 3 $ b)"), [stoa("ABC"), stoa("DEF"), stoa("uvw")]);
            ok(J.exec("A , b"), [stoa("ABC"), stoa("DEF"), stoa("uvw")]);
            ok(J.exec("b , A"), [stoa("uvw"), stoa("ABC"), stoa("DEF")]);
            ok(J.exec("A , 'XY'"), [stoa("ABC"), stoa("DEF"), stoa("XY ")]);
            ok(J.exec("(2 3 $ 1) , 9 9"), [[1, 1, 1], [1, 1, 1], [9, 9, 0]]);
            ok(J.exec("A , '*'"), [stoa("ABC"), stoa("DEF"), stoa("***")]);
            ok(J.exec("A , 1 $ '*'"), [stoa("ABC"), stoa("DEF"), stoa("*  ")]);
            ok(J.exec("a ,. b"), [stoa("pu"), stoa("qv"), stoa("rw")]);
            ok(J.exec("A ,. B"), [stoa("ABCUVW"), stoa("DEFXYZ")]);
            ok(J.exec("A ,. 'a'"), [stoa("ABCa"), stoa("DEFa")]);
            ok(J.exec("(2 2 2 $ 'A') ,. 'a'"), [[stoa("AA"), stoa("AA"), stoa("aa")], [stoa("AA"), stoa("AA"), stoa("aa")]]);
            //ok(J.exec("(2 2 2 $ 'A') ,. 'BC'"), [[stoa("AA"), stoa("AA"), stoa("BB")], [stoa("AA"), stoa("AA"), stoa("CC")]]);
            //ok(J.exec("(2 2 2 $ 'A') ,. 2 2 $ 'BC'"), [[stoa("AA"), stoa("AA"), stoa("BB")], [stoa("AA"), stoa("AA"), stoa("CC")]]);
            ok(J.exec("a ,: b"), [stoa("pqr"), stoa("uvw")]);
            ok(J.exec("A ,: B"), [[stoa("ABC"), stoa("DEF")], [stoa("UVW"), stoa("XYZ")]]);
            ok(J.exec("(2 2 2 $ 'A') ,: 'a'"), [[[stoa("AA"), stoa("AA")], [stoa("AA"), stoa("AA")]], [[stoa("aa"), stoa("aa")], [stoa("aa"), stoa("aa")]]]);
            ok(J.exec("(2 2 2 $ 'A') ,: 'BC'"), [[[stoa("AA"), stoa("AA")], [stoa("AA"), stoa("AA")]], [[stoa("BC"), stoa("  ")], [stoa("  "), stoa("  ")]]]);
            ok(J.exec("(2 2 2 $ 8) ,: 2 2 $ 3"), [[[[8, 8], [8, 8]], [[8, 8], [8, 8]]], [[[3, 3], [3, 3]], [[0, 0], [0, 0]]]]);
            ok(J.exec("'a' ,: 2 2 2 $ 'A'"), [[[stoa("aa"), stoa("aa")], [stoa("aa"), stoa("aa")]], [[stoa("AA"), stoa("AA")], [stoa("AA"), stoa("AA")]]]);
            ok(J.exec("'BC' ,: 2 2 2 $ 'A'"), [[[stoa("BC"), stoa("  ")], [stoa("  "), stoa("  ")]], [[stoa("AA"), stoa("AA")], [stoa("AA"), stoa("AA")]]]);
            ok(J["-:"](J.exec("'good' ; 'morning'"), J.exec("(< 'good') , < 'morning'")), true);
            ok((J.exec("B =: 2 2 $ 1;2;3;4"), J.exec("; B")), [true, 2, 3, 4]);
            ok(J["-:"](J.exec(", B"), J.exec("1 ; 2 ; 3 ; 4")), true);
            ok((J.exec("k =: 2 2 3 $ i. 12"), J.exec(",. k")), [[0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11]]);
            ok(J.exec(",. b"), [["u"], ["v"], ["w"]]);
            ok(J.exec(",: A"), [[stoa("ABC"), stoa("DEF")]]);
            ok(J.exec("$ ,: A"), [1, 2, 3]);
            ok(J.exec("> 1 2 ; 3 4 ; 5 6"), [[true, 2], [3, 4], [5, 6]]);
            ok(J.exec("1 2 , 3 4 ,: 5 6"), [[true, 2], [3, 4], [5, 6]]);
            J.exec("ArrayMaker =: \". ;. _2");
            ok(J.exec(`NB. (
                table =: ArrayMaker 0 : 0
                1 2 3
                4 5 6
                7 8 9
                )`), [[true, 2, 3], [4, 5, 6], [7, 8, 9]]);
        });

        it("chapter6", () => {
            const J = MorilibJ();

            ok((J.exec("L =: 'abcdef'"), J.exec("0 { L")), "a");
            ok(J.exec("1 { L"), "b");
            ok(J.exec("0 2 4 { L"), stoa("ace"));
            ok(J.exec("5 4 4 3 { L"), stoa("feed"));
            ok(J.exec("_1 { L"), "f");
            ok(J.exec("_2 1 { L"), stoa("eb"));
            ok((J.exec("T =: 3 3 $ 'abcdefghi'"), J.exec("(< 1 ; 2) { T")), "f");
            ok(J.exec("(< 1 2;0 1) { T"), [stoa("de"), stoa("gh")]);
            ok(J.exec("1 { T"), stoa("def"));
            ok(J.exec("2 1 { T"), [stoa("ghi"), stoa("def")]);
            ok(J.exec("(< 0 1 2 ; 1 ){ T"), stoa("beh"));
            ok(J.exec("2 {. L"), stoa("ab"));
            ok((J.exec("s =: 'pasta'"), J.exec("z =: 8 {. s"), J.exec("z")), stoa("pasta   ")); 
            ok(J.exec("2 }. L"), stoa("cdef"));
            ok(J.exec("_2 {. L"), stoa("ef"));
            ok(J.exec("_2 }. L"), stoa("abcd"));
            ok(J.exec("{. L"), "a");
            ok(J.exec("}. L"), stoa("bcdef"));
            ok(J.exec("{: L"), "f");
            ok(J.exec("}: L"), stoa("abcde"));
            ok(J.exec("0 1 { L"), stoa("ab"));
            ok((J.exec("index =: 2 2 $ 2 0 3 1"), J.exec("index { L")), [stoa("ca"), stoa("db")]);
            ok((J.exec("A =: 2 3 $ 'abcdef'"), J.exec("1 { A")), stoa("def"));
            ok((J.exec("SuAx =: <"), J.exec("(SuAx 1 0) { A")), "d");
            ok((J.exec("Sel =: <"), J.exec("(SuAx (Sel 1), (Sel 0 2)) { A")), stoa("df"));
            ok((J.exec("Excl =: <"), J.exec("(SuAx (Sel 0), (Sel (Excl 1))) { A")), stoa("ac"));
            //ok(J.exec("(SuAx (Sel 1),(Sel (Excl 0$0))) { A"), stoa("def"));
            //ok(J.exec("(SuAx (Sel 1),(Sel a:)) { A"), stoa("def"));
            ok(J.exec("(SuAx (Sel 1)) {A"), stoa("def"));
            ok(J.exec("(SuAx (Sel 1),(Sel 0 2)) {A"), stoa("df"));
            ok(J.exec("(SuAx 1;0 2) {A"), stoa("df"));
            ok(J.exec("(SuAx 1;2) { A"), "f");
            ok(J.exec("(SuAx 1 2) { A"), "f");
            ok((J.exec("B =: 10 + i. 3 3 3"), J.exec("p =: 1 2"), J.exec("r =: 1 2"), J.exec("c =: 0 1"), J.exec("R =: (< p;r;c) { B"), J.exec("R")),
                [[[22, 23], [25, 26]], [[31, 32], [34, 35]]]);
            ok((J.exec("r =: 1 $ 1"), J.exec("S =: (< p;r;c){B"), J.exec("S")), [[[22, 23]], [[31, 32]]]);
            ok((J.exec("r =: 1"), J.exec("T =: (< p;r;c){B"), J.exec("T")), [[22, 23], [31, 32]]);
            ok((J.exec("new=:'*'"), J.exec("index=:0"), J.exec("new index } L")), stoa("*bcdef"));
            ok((J.exec("ReplaceFirst =: 0 }"), J.exec("'*' ReplaceFirst L")), stoa("*bcdef"));
            ok(J.exec("'*' (< 1 2) } A"), [stoa("abc"), stoa("de*")]);
            ok(J.exec("'*#' 1 2 } L"), stoa("a*#def"));
            ok((J.exec("X =: 100"), J.exec("Y =: 98 102 101 99"), J.exec("Y > X")), [false, true, true, false]);
            ok((J.exec("f =: 4 : '(y > x) # (i. # y)'"), J.exec("X f Y")), [1, 2]);
            ok(J.exec("X (X f Y) } Y"), [98, 100, 100, 99]);
            ok(J.exec("X f } Y"), [98, 100, 100, 99]);
            ok((J.exec("cap =: f }"), J.exec("10 cap 8 9 10 11")), [8, 9, 10, 10]);
            J.exec("M =: 2 2 $ 13 52 51 14");
            ok((J.exec("LL =: ,M"), J.exec("LL")), [13, 52, 51, 14]);
            ok((J.exec("Z =: 50 f } LL"), J.exec("Z")), [13, 50, 50, 14]);
            ok(J.exec("($M) $ Z"), [[13, 50], [50, 14]]);
            J.exec(`f =: 4 : 0
                NB. (
                y =. , y
                (y > x) # (i. # y)
                )`);
            ok(J.exec("50 f M"), [1, 2]);
            ok(J.exec("($M) $ 50 (50 f M) } (, M)"), [[13, 50], [50, 14]]);
            ok(J.exec("50 f } M"), [[13, 50], [50, 14]]);
            J.exec("T =: 3 4 $ 'ABCDEFGHIJKL'");
            J.exec("m =: 1 2 0 2");
            ok(J.exec("(m }) T"), stoa("EJCL"));
            J.exec("AA =: i. 2 2 2");
            ok(J.exec("(1 0 ,: 1 0) } AA"), [[4, 1], [6, 3]]);
            J.exec("AB =: i. 2 2 3");
            ok(J.exec("(1 1 1 ,: 0 1 0) } AB"), [[6, 7, 8], [3, 10, 5]]);
            J.exec("AC =: i. 2 3 4");
            ok(J.exec("(1 1 1 0 , 0 1 1 1 ,: 1 0 1 1) } AC"), [[12, 13, 14, 3], [4, 17, 18, 19], [20, 9, 22, 23]]);
            J.exec("AD =: i. 2 2 2 2");
            ok(J.exec("(2 2 2 $ 0 1) } AD"), [[[0, 9], [2, 11]], [[4, 13], [6, 15]]]);
        });

        it("chapter7", () => {
            const J = MorilibJ();

            ok(J["-:"]((J.exec("M =: 2 3 $ 'abcdef'"), J.exec("< \" 0 M")), J.exec("('a' ; 'b' ; 'c') ,: 'd' ; 'e' ; 'f'")), true);
            ok(J["-:"](J.exec("< \" 1 M"), J.exec("'abc' ; 'def'")), true);
            ok(J["-:"](J.exec("< \" 2 M"), J.exec("< M")), true);
            ok(J["-:"]((J.exec("cells  =: 4 : '< \" x y'"), J.exec("0 cells M")), J.exec("('a' ; 'b' ; 'c') ,: 'd' ; 'e' ; 'f'")), true);
            ok(J["-:"](J.exec("1 cells M"), J.exec("'abc' ; 'def'")), true);
            ok((J.exec("X =: 2 2 $ 0 1 2 3"), J.exec("Y =: 2 3"), J.exec("X (* \" 1 0) Y")), [[0, 2], [6, 9]]);
            ok(J.exec("X (* \" 1 1) Y"), [[0, 3], [4, 9]]);
            //ok((J.exec("t =: 3 3 $ 1 0 1 0 0 1 0 1 1"), J.exec("#. t")), [5, 1, 3]);
            ok(J.exec("(<\"1) b. 0"), [1, 1, 1]);
            ok(J.exec("(<\"1 2) b. 0"), [2, 1, 2]);
            //ok(J.exec("(<\"1 2 3) b. 0"), [1, 2, 3]);
            ok((J.exec("u =: (+/) @: (+/) \" 2"), J.exec("w =: 4 5 $ 1"), J.exec("u w")), 20);
            ok(J.exec("u b. 0"), [2, 2, 2]);
            ok((J.exec("A =: 2 3 4 5 $  1"), J.exec("u A")), [[20, 20, 20], [20, 20, 20]]);
            ok((J.exec("frame =: 4 : '$ x cells y'"), J.exec("2 frame A")), [2, 3]);
            //ok((J.exec("k =: 0 { u b. 0"), J.exec("s =: $ u  0 { > (, k cells A)"), J.exec("kfr =: k frame A"), J.exec("kfr, s")), [2, 3]);   // TODO empty array
            J.exec("u =: < @ ,  \" 0 1");
            J.exec("X =: 2  $ 'ab'");
            J.exec("Y =: 2 3 $ 'ABCDEF'");
            ok(J["-:"](J.exec("X u Y"), J.exec("'aABC' ; 'bDEF'")), true);
            J.exec("X =: 2 3 2 $ i. 12");
            J.exec("Y =: 2     $ 0 1");
            ok(J.exec("X+Y"), [[[0, 1], [2, 3], [4, 5]], [[7, 8], [9, 10], [11, 12]]]);
            ok((J.exec("YYY =: (3 2&$)\"0 Y"), J.exec("X + YYY")), [[[0, 1], [2, 3], [4, 5]], [[7, 8], [9, 10], [11, 12]]]);
            J.exec("R =: (3 : '(y $ y) $ y') \" 0");
            ok(J.exec("R 1"), [1]);
            ok(J.exec("R 2"), [[2, 2], [2, 2]]);
            ok(J["-:"](J.exec("(R 1) ; (R 2)"), J.exec("(1 $ 1) ; 2 2 $ 2")), true);
            ok(J.exec("> (R 1) ; (R 2)"), [[[1, 0], [0, 0]], [[2, 2], [2, 2]]]);
            ok(J["-:"](J.exec("< \" _1 X"), J.exec("(3 2 $ i. 6) ; 3 2 $ 6+i.6")), true);
            ok(J["-:"](J.exec("< \" _2 X"), J.exec("(00 01 ; 2 3 ; 4 5) ,: 6 7 ; 8 9 ; 10 11")), true);
            ok((J.exec("f =: */ @: >: @: i."), J.exec("f 2")), 2);
            ok(J.exec("f 5"), 120);
            ok(J.exec("f 2 3"), [4, 10, 18]);
            ok((J.exec("f  =: (*/ @: (>: @: i.)) \" 0"), J.exec("f 2 3 4 5")), [2, 6, 24, 120]);
            ok((J.exec("abs =: 3 : 'if. y < 0 do. - y else. y end.'"), J.exec("abs 3")), 3);
            ok(J.exec("abs _3"), 3);
            ok(J.exec("abs b. 0"), [_, _, _]);
            //ok(J.exec("abs 3 _3"), [3, -3]);
            ok((J.exec("abs =:(3 : 'if. y < 0 do. -y else. y end.') \" 0"), J.exec("abs 3 _3")), [3, 3]);

            ok(J.exec("> (2 2 $ 2) ; 3"), [[[2, 2], [2, 2]], [[3, 0], [0, 0]]]);
            ok(J.exec("> (2 2 2 $ 2) ; 3 3"), [[[[2, 2], [2, 2]], [[2, 2], [2, 2]]], [[[3, 3], [0, 0]], [[0, 0], [0, 0]]]]);
            ok(J.exec("> (2 2 $ 2) ; 3 ; 5 5"), [[[2, 2], [2, 2]], [[3, 0], [0, 0]], [[5, 5], [0, 0]]]);
        });

        it("chapter8", () => {
            const J = MorilibJ();

            ok((J.exec("sum =: +/"), J.exec("square =: *:"), J.exec("sumsq =: sum @: square"), J.exec("sumsq 3 4")), 25);
            ok((J.exec("g =: sum \" 1"), J.exec("f =: <"), J.exec("y =: 2 2 $ 1 2 3 4"), J["-:"](J.exec("f g y"), J.exec("(f @: g) y"))), true);
            ok((J.exec("sp =: +/ @: *"), J.exec("x =: 1 2"), J.exec("y =: 2 3"), J.exec("x sp y")), 8);
            ok((J.exec("eqlen =: = &: #"), J.exec("x eqlen y")), true);
            ok((J.exec("y =: 'abcdef'"), J["-:"](J.exec("(< &: |.) y"), J.exec("< 'fedcba'"))), true);
            ok((J.exec("y =: 'abcdef'"), J["-:"](J.exec("1 (< @: |.) y"), J.exec("< 'bcdefa'"))), true);
            ok(J.exec("(% &: *:) 2"), 0.25);
            ok(J.exec("3 (% &: *:) 2"), 2.25);
            ok((J.exec("y =: 2 2 $ 0 1 2 3"), J.exec("f =: <"), J.exec("g =: sum\"1"), J["-:"](J.exec("(f @ g) y"), J.exec("01 ; 5"))), true);
            ok((J.exec("f =: <"), J.exec("g =: |. \" 0 1"), J.exec("x =: 1 2"), J.exec("y =: 2 3 $ 'abcdef'"), J.exec("x g y")), [stoa("bca"), stoa("fde")]);
            ok(J["-:"](J.exec("x (f @ g) y"), J.exec("'bca' ; 'fde'")), true);
            ok((J.exec("f =: ,"), J.exec("g =: *:"), J.exec("(1 2) (f & g) 3 4")), [[1, 9], [4, 16]]);
        });

        it("chapter9", () => {
            const J = MorilibJ();

            ok((J.exec("y =: 2.1 3"), J.exec("(= <.) y")), [false, true]);
            ok((J.exec("sum  =: +/"), J.exec("mean =: sum % #"), J.exec("y =: 1 2 3 4"), J.exec("mean y")), 2.5);
            ok((J.exec("hr =: + (%&60)"), J.exec("3 hr 15")), 3.25);
            ok(J.exec("10 (+,-) 2"), [12, 8]);
            ok((J.exec("y =: 2 3 4"), J.exec("(- sum % #) y")), [-1, 0, 1]);
            oknum(J.exec("2 (+ % ]) 3"), 1.6666666666);
            ok((J.exec("f =: 'f' & ,"), J.exec("g =: 'g' & ,"), J.exec("foo =: (f @: [) , (g @: ])"), J.exec("'a' foo 'b'")), stoa("fagb"));
            ok(J.exec("([: f g) 'y'"), stoa("fgy"));
            ok((J.exec("h =: 'h'&,"), J.exec("(f , [: g h) 'y'")), stoa("fyghy"));
            ok(J.exec("0: 99"), 0);
            ok(J.exec("0: 2 3 4"), 0);
            ok(J.exec("0: 'hello'"), 0);
            ok(J.exec("88 0: 99"), 0);
            ok(J.exec("1: 2 3 4"), 1);
            ok(J.exec("_3: 'hello'"), -3);
            ok((J.exec("x =: _1 0 2"), J.exec("x < (0: x)")), [true, false, false]);
            ok((J.exec("k =: 'hello'"), J.exec("(3 : 'k') 1")), stoa("hello"));
            ok(J.exec("(3 : 'k') 1 2"), stoa("hello"));
            ok(J.exec("((3 : 'k') \" 0) 1 2"), [stoa("hello"), stoa("hello")]);
            ok(J.exec("('hello' \" 0) 1 2"), [stoa("hello"), stoa("hello")]);
            ok((J.exec("Celsius =: ((5%9) & *) @: (- &32)"), J.exec("Celsius 32 212")), [0, 100]);
            ok((J.exec("Celsius =: (5%9 \"_ ) * (-&32)"), J.exec("Celsius 32 212")), [0, 100]);
            ok((J.exec("Celsius =: (5%9) * (-&32)"), J.exec("Celsius 32 212")), [0, 100]);
            ok(J.exec("(1 + i.) 5"), [1, 2, 3, 4, 5]);
        });

        it("chapter10", () => {
            const J = MorilibJ();

            J.exec("halve =: -:");
            J.exec("mult  =: 1: + (* 3:)");
            J.exec("odd   =: 2 & |");
            J.exec("COLLATZ =: 3 : 'if. odd y do. mult y else.  halve y end. '");
            J.exec("collatz =: halve ` mult @. odd");
            ok(J.exec("COLLATZ 17"), 52);
            ok(J.exec("collatz 17"), 52);
            ok((J.exec("pi =: * & 1.005"), J.exec("ci =: * & 1.02"), J.exec("uc =: * & 1"), J.exec("case =: (>: & 0) + (>: & 100)"),
                J.exec("case _50 0 1 100 200")), [0, 1, 1, 2, 2]);
            J.exec("PB =: ci ` uc  ` pi  @. case");
            ok(J.exec("PB _50"), -51);
            ok(J.exec("PB 0"), 0);
            ok(J.exec("PB 1"), 1);
            oknum(J.exec("PB 100"), 100.5);
            oknum(J.exec("PB 200"), 201);
            //expect(() => J.exec("PB 99 100")).toThrow();
            ok(J.exec("(PB \"0) 99 99"), [99, 99]);
            ok((J.exec("empty =: # = 0:"), J.exec("first =: {."), J.exec("rest  =: }."), J.exec("Sum =: (first + Sum @ rest) ` 0:  @. empty"), J.exec("Sum 1 1 2")), 4);
            //ok(J.exec("((first + $: @ rest) ` 0: @. empty)  1 2 3"), 6);
            ok((J.exec("ack =: c1 ` c1 ` c2 ` c3 @. (#. @(,&*))"), J.exec("c1 =: >:@]"), J.exec("c2 =: <:@[ ack 1:"),
                J.exec("c3 =: <:@[ ack [ack <:@]"), J.exec("2 ack 3")), 9);
            J.exec("x =: [");
            J.exec("y =: ]");
            J.exec("ACK =: A1 `  (y + 1:)                    @. (x = 0:)");
            J.exec("A1  =: A2 ` ((x - 1:) ACK 1:)            @. (y = 0:)");
            J.exec("A2  =:       (x - 1:) ACK (x ACK y - 1:)");
            ok(J.exec("2 ACK 3"), 9);
            ok(J.exec("(+: ^: 3) 1"), 8);
            ok(J.exec("(collatz ^: 0) 6"), 6);
            ok(J.exec("(collatz ^: 1) 6"), 3);
            ok(J.exec("(collatz ^: 0 1 2 3 4 5 6) 6"), [6, 3, 10, 5, 16, 8, 4]);
            oknumArray((J.exec("P =: 3 : '2.8  * y * (1 - y)'"), J.exec("(P ^: 0 1 2 3 19 20 _) 0.5")), [0.5, 0.7, 0.588, 0.6783, 0.6439, 0.642, 0.6429]);
            ok((J.exec("halve =: -:"), J.exec("even  =: 0: = 2 & |"), J.exec("foo =: halve ^: even"), J.exec("(foo \" 0) 1 2 3 4")), [true, 1, 3, 2]);
            ok(J.exec("(halve ^: even ^: _) 3 * 16"), 3);
            ok(J.exec("3 (+ ^: 2) 0"), 6);
        });

        it("chapter12", () => {
            const J = MorilibJ();

            ok((J.exec("PosDiff =: dyad def '(x >. y) - (x <. y)'"), J.exec("3 PosDiff 4")), 1);
            ok((J.exec(`PosDiff =: 4 : 0
                NB. (
                larger  =. x >. y
                smaller =. x <. y
                larger - smaller
                )`), J.exec("3 PosDiff 4")), 1);
            ok((J.exec("PosDiff =: 4 : ('la =. x >. y', LF, 'sm =. x <. y', LF, 'la - sm')"), J.exec("3 PosDiff 4")), 1);
            ok((J.exec("PosDiff =: 4 : ('la =. x >. y' ; 'sm =. x <. y' ;  'la - sm')"), J.exec("3 PosDiff 4")), 1);
            // TODO comment
            J.exec(`log =: 3 : 0
                NB. (
                ^. y
                :
                x ^. y
                )`);
            oknum(J.exec("log 2.7182818"), 1);
            oknum(J.exec("10 log 100"), 2);
            J.exec(`foo =: 3 : 0
                NB. (
                L =.  y
                G =:  y
                L
                )`);
            J.exec("L =: 'old L'");
            J.exec("G =: 'old G'");
            ok(J.exec("foo 'new'"), stoa("new"));
            ok(J.exec("L"), stoa("old L"));
            ok(J.exec("G"), stoa("new"));
            // TODO error
            J.exec(`foo =: 3 : 0
                NB. (
                z =. y + 1
                y =: 'hello'
                z
                )`);
            //expect(() => J.exec("foo 6")).toThrow();
            //J.exec(`foo =: 3 : 0
            //    NB. (
            //    z =. y+1
            //    erase <'y'
            //    y =: 'hello'
            //    z
            //    )`)
            //ok(J.exec("foo 6"), 7);
            //ok(J.exec("y"), stoa("hello"));
            J.exec(`foo =: 3 : 0
                NB. (
                Square  =. *:
                Cube    =. 3 : 'y * y * y'
                (Square y) + (Cube y)
                )`);
            ok(J.exec("foo 2"), 12);
            J.exec(`FTOC =: 3 : 0
                NB. (
                line1   =. 'k =. 5 % 9'
                line2   =. 'k * y'
                scale =. 3 : (line1 ; line2)  
                scale y - 32
                )`);
            ok(J.exec("FTOC 212"), 100);
            J.exec("K =: 'hello '");
            J.exec(`zip =: 3 : 0
                NB. (
                K =. 'goodbye '
                zap =. 3 : 'K , y'
                zap y
                )`);
            ok(J.exec("zip 'George'"), stoa("hello George"));
            J.exec("'day mo yr' =: 16 10 95");
            ok(J.exec("day"), 16);
            ok(J.exec("mo"), 10);
            ok(J.exec("yr"), 95);
            J.exec("('day';'mo';'yr') =: 17 11 96");
            ok(J.exec("day"), 17);
            ok(J.exec("mo"), 11);
            ok(J.exec("yr"), 96);
            J.exec("N =: 'DAY';'MO';'YR'");
            J.exec("(N) =: 18 12 97");
            ok(J.exec("DAY"), 18);
            ok(J.exec("MO"), 12);
            ok(J.exec("YR"), 97);
            J.exec("(N) =: 19;'Jan';98");
            ok(J.exec("DAY"), 19);
            ok(J.exec("MO"), stoa("Jan"));
            ok(J.exec("YR"), 98);
            ok((J.exec("'AA' =: 27"), J.exec("AA")), 27);
            J.exec(`rq =: 3 : 0
                NB. (
                'a b c' =. y
                ((-b) (+,-) %: (b^2)-4*a*c) % (2*a)
                )`);
            ok(J.exec("rq 1 1 _6"), [2, -3]);
            ok(J.exec("rq 1 ; 1 ; _6"), [2, -3]);
        });

        it("chapter13", () => {
            const J = MorilibJ();

            J.exec("A =: 1 : 'u \" 0'");
            ok(J.toString(J.exec("f =: < A")), "u\"0");   // TODO argument
            ok(J["-:"](J.exec("f 1 2"), J.exec("1 ; 2")), true);
            J.exec("W =: 1 : '< \" u'");
            ok(J.toString(J.exec("0 W")), "<\"0");
            ok(J["-:"](J.exec("0 W 'abc'"), J.exec("'a' ; 'b' ; 'c'")), true);
            ok(J["-:"](J.exec("1 W 'abc'"), J.exec("< 'abc'")), true);
            ok((J.exec("y =: 1 0 2 3"), J.exec("1 0 1 1 # y")), [true, 2, 3]);
            ok(J.exec("(>&0 y) # y"), [true, 2, 3]);
            ok((J.exec("f =: >&0 # ]"), J.exec("f y")), [true, 2, 3]);
            ok((J.exec("B =: 1 : 'u # ]'"), J.exec("g =: (>&1) B"), J.exec("g y")), [2, 3]);
            ok(J["-:"]((J.exec("THEN =: 2 : 'v @: u'"), J.exec("h =: *: THEN <"), J.exec("h 1 2 3")), J.exec("< (01 4 9)")), true);
            ok((J.exec("foo =: # @: (>&0 # ])"), J.exec("foo y")), 3);
            ok((J.exec("C =: 2 : 'u @: (v # ])'"), J.exec("f =: # C (>&0)"), J.exec("f y")), 3);
            ok((J.exec(`D =: 2 : 0
                NB. (
                select =: v # ]
                u @: select
                )`), J.exec("f =: # D (>&0)"), J.exec("f y")), 3);
            //ok((J.exec(`E =: 2 : 0
            //    NB. (
            //    select =. v # ]
            //    (u @: select) f.
            //    )`), J.exec("g =: # E (>&0)"), J.exec("g y")), 3);
            J.exec("sh    =: |. !. 0");
            J.exec("prev  =: _1 & sh");
            J.exec("next  =: 1 & sh");
            J.exec("halve =: -:");
            J.exec("smoo  =: halve @: (prev + next)");
            J.exec("N =: 6 2 8 2 4");
            ok(J.exec("prev N"), [false, 6, 2, 8, 2]);
            ok(J.exec("next N"), [2, 8, 2, 4, false]);
            ok(J.exec("smoo N"), [1, 7, 2, 6, 1]);
            //J.exec("SMOO =: 1 : ('sh =. u' ; 'smoo f.')");
            //J.exec("rv =: |. SMOO");
            //ok(J.exec("rv N"), [3, 7, 2, 6, 4]);
            //J.exec(`H =:  2 : 0
            //    NB. (
            //    U =. 5!:5 < 'u'
            //    V =. 5!:5 < 'v'
            //    string =. 'z =. ', V , 'y',  LF
            //    string =. string , 'y ', U , ' z', LF
            //    3 : string
            //    )`);
            //ok((J.exec("foo =: + H *:"), J.exec("foo 5")), 30);
            J.exec(`K =: 2 : 0
                NB. (
                z =. v y
                y u z
                )`);
            ok((J.exec("bar =: + K *:"), J.exec("bar 5")), 30);
            ok((J.exec("e =: 3 : '(>&0 y) # y'"), J.exec("e y")), [true, 2, 3]);
            ok((J.exec("F  =: 1 : '(u y) # y'"), J.exec(">&1 F y")), [2, 3]);
            ok((J.exec(`W =: 1 : 0
                NB. (
                :
                (u x) + (u y)
                )`), J.exec("2 (*: W) 16")), 260);
            ok((J.exec(`T =: 1 : 0
                NB. (
                :
                x  ((u " 0 0) " 0 1)  y
                )`), J.exec("1 2 3 + T 4 5 6 7")), [[5, 6, 7, 8], [6, 7, 8, 9], [7, 8, 9, 10]]);
            ok((J.exec(`G  =: 2 : 0
                NB. (
                selected =. (v y) # y
                u selected
                )`), J.exec("# G (>&0) y")), 3);
            ok((J.exec(`H =: 2 : 0
                NB. (
                :
                (u x) + (v y)
                )`), J.exec("2 (*: H %:) 16")), 8);
            oknum((J.exec("f =: 3 : '2.8 * y * (1-y)'"), J.exec("f 0.642857")), 0.642857);
            oknum((J.exec("FPF =: 1 : '(u ^: _ ) 0.5'"), J.exec("p =: f FPF")), 0.642857);
            oknum(J.exec("f p"), 0.642857);
            ok((J.exec("mean =: sum  % #"), J.exec("where =: 2 : 'u'"), J.exec("mean =: sum % # where sum =: +/"), J.exec("mean 1 2 3 4")), 2.5);
            ok(J.exec("(z+1) * (z-1)     where z =: 7"), 48);
            ok((J.exec("CS =: @: *:"), J.exec("- CS 2 3")), [-4, -9]);
            ok((J.exec("K =: 1 : '@: u'"), J.exec("L =: *: K"), J.exec("- L 2 3")), [-4, -9]);
        });

        it("chapter14", () => {
            const J = MorilibJ();

            ok((J.exec("abs =: + ` - @. (< & 0)"), J.exec("abs _3")), 3);
            ok((J.exec("G =: + ` - ` %"), J.exec("f =: G @. 0"), J.exec("1 f 1")), 2);
        });

        it("chapter16", () => {
            const J = MorilibJ();

            ok((J.exec("L =: 'barn'"), J.exec("/: L")), [1, 0, 3, 2]);
            ok(J.exec("(/: L) { L"), stoa("abnr"));
            ok(J.exec("(\\: L) { L"), stoa("rnba"));
            ok((J.exec("N =: 3 1 4 5"), J.exec("(/: N) { N")), [true, 3, 4, 5]);
            J.exec("B =: 'pooh';'bah';10;5");
            ok(J["-:"](J.exec("(/: B) { B"), J.exec("5 ; 10 ; 'bah' ; 'pooh'")), true);
            J.exec("T =: ('WA' ; 'Mozart' ; 1756) ,: ('JS' ; 'Bach' ; 1685) ,: ('CPE' ; 'Bach' ; 1714)");
            ok(J["-:"]((J.exec("keys =: 2&{\"1 T"), J.exec("keys")), J.exec("1756 ; 1685 ; 1714")), true);
            ok(J["-:"](J.exec("(/: keys) { T"), J.exec("3 3 $ 'JS' ; 'Bach' ; 1685 ; 'CPE' ; 'Bach' ; 1714 ; 'WA' ; 'Mozart' ; 1756")), true);
            ok(J["-:"](J.exec("T /: keys"), J.exec("3 3 $ 'JS' ; 'Bach' ; 1685 ; 'CPE' ; 'Bach' ; 1714 ; 'WA' ; 'Mozart' ; 1756")), true);
            ok(J["-:"]((J.exec("keys =: 1 0 & { \" 1 T"), J.exec("keys")), J.exec("3 2 $ 'Mozart' ; 'WA' ; 'Bach' ; 'JS' ; 'Bach' ; 'CPE'")), true);
            ok(J["-:"](J.exec("T /: keys"), J.exec("3 3 $ 'CPE' ; 'Bach' ; 1714 ; 'JS' ; 'Bach' ; 1685 ; 'WA' ; 'Mozart' ; 1756")), true);
            //ok(J["-:"]((J.exec("k=: (< 'abc') ; 'pqr' ; 4 ; '' ; 3"), J.exec("k /: k")), J.exec("3 ; 4 ; 'pqr' ; (<<'abc')")), true);   // TODO empty array
            ok(J["-:"]((J.exec("k=: (< 'abc') ; 'pqr' ; 4 ; 3"), J.exec("k /: k")), J.exec("3 ; 4 ; 'pqr' ; (<<'abc')")), true);
            ok(J["-:"]((J.exec("m=: 2 4 ; 3 ; (1 1 $ 1)"), J.exec("m /: m")), J.exec("3 ; 2 4 ; 1 1 $ 1")), true);
            J.exec("a =: 2 3 $ 1 2 3 4 5 6");
            J.exec("b =: 3 2 $ 1 2 5 6 3 4");
            J.exec("c =: 1 3 $ 1 2 3");
            J.exec("d =: 1 3 $ 1 1 3");
            ok(J["-:"]((J.exec("u=:a;b;c"), J.exec("u /: u")), J.exec("b;c;a")), true);
            ok((J.exec("x=: 2 1 _3"), J.exec("keys =: | x"), J.exec("x /: keys")), [true, 2, -3]);
            ok((J.exec("M =: 2 3 $ 'abcdef'"), J.exec("|: M")), [stoa("ad"), stoa("be"), stoa("cf")]);
            ok((J.exec("N =: 2 2 2 $ 'abcdefgh'"), J.exec("|: N")), [[stoa("ae"), stoa("cg")], [stoa("bf"), stoa("dh")]]);
            ok(J.exec("|: i. 2 2 2 2"), [[[[0, 8], [4, 12]], [[2, 10], [6, 14]]], [[[1, 9], [5, 13]], [[3, 11], [7, 15]]]]);
            ok(J.exec("0 1 2 |: N"), [[stoa("ab"), stoa("cd")], [stoa("ef"), stoa("gh")]]);
            ok(J.exec("0 2 1 |: N"), [[stoa("ac"), stoa("bd")], [stoa("eg"), stoa("fh")]]);
            ok(J.exec("1 0 2 |: N"), [[stoa("ab"), stoa("ef")], [stoa("cd"), stoa("gh")]]);
            ok((J.exec("K =: i. 3 3"), J.exec("(< 0 1) |: K")), [0, 4, 8]);
            ok(J.exec("(< 0 1) |: i. 3 3 3"), [[0, 12, 24], [1, 13, 25], [2, 14, 26]]);
            ok((J.exec("y =: 'abcde'"), J.exec("|. y")), stoa("edcba"));
            ok(J.exec("|. M"), [stoa("def"), stoa("abc")]);
            ok(J.exec("|. N"), [[stoa("ef"), stoa("gh")], [stoa("ab"), stoa("cd")]]);
            ok(J.exec("|. \" 1 N"), [[stoa("ba"), stoa("dc")], [stoa("fe"), stoa("hg")]]);
            ok(J.exec("|. \" 2 N"), [[stoa("cd"), stoa("ab")], [stoa("gh"), stoa("ef")]]);
            ok(J.exec("1 |. y"), stoa("bcdea"));
            ok(J.exec("_1 |. y"), stoa("eabcd"));
            ok(J.exec("1 2 |. M"), [stoa("fde"), stoa("cab")]);
            ok(J.exec("1 2 |. N"), [[stoa("ef"), stoa("gh")], [stoa("ab"), stoa("cd")]]);
            J.exec("ash   =: |. !. '*'");
            J.exec("nsh   =: |. !. 0");
            ok(J.exec("_2 ash y"), stoa("**abc"));
            ok((J.exec("z =: 2 3 4"), J.exec("_1 nsh z")), [false, 2, 3]);
            ok(J.exec("1 ash M"), [stoa("def"), stoa("***")]);
            ok(J.exec("1 1 ash N"), [[stoa("gh"), stoa("**")], [stoa("**"), stoa("**")]]);
        });

        it("chapter17", () => {
            const J = MorilibJ();

            J.exec("y =: 'abcde'");
            ok(J["-:"](J.exec("< \\ y"), J.exec("(1 $ 'a') ; 'ab' ; 'abc' ; 'abcd' ; 'abcde'")), true);
            ok(J.exec("+/ \\ 0 1 2 3"), [false, 1, 3, 6]);
            ok(J.exec("+./\\ 0 1 0 1 0"), [false, true, true, true, true]);
            ok(J["-:"]((J.exec("z =: 1 4 9 16"), J.exec("2 < \\ z")), J.exec("1 4 ; 4 9 ; 9 16")), true);
            ok(J["-:"](J.exec("_3 < \\ z"), J.exec("1 4 9 ; (1 $ 16)")), true);
            ok((J.exec("smf =: {: - {."), J.exec("smf 1 4")), 3);
            J.exec("diff =: 2 & (smf\\)");
            ok(J.exec(",. z"), [[true], [4], [9], [16]]);
            ok(J.exec(",. diff z"), [[3], [5], [7]]);
            ok(J.exec(",. diff diff z"), [[2], [2]]);
            ok(J["-:"](J.exec("< \\. y"), J.exec("'abcde' ; 'bcde' ; 'cde' ; 'de' ; 1 $ 'e'")), true);
            ok(J["-:"](J.exec("2 < \\. y"), J.exec("'cde' ; 'ade' ; 'abe' ; 'abc'")), true);
            ok(J["-:"](J.exec("_2 < \\. y"), J.exec("'cde' ; 'abe' ; 'abcd'")), true);
            ok((J.exec("M =: 3 3 $ 'abcdefghi'"), J.exec("[ ;. 0 M")), [stoa("ihg"), stoa("fed"), stoa("cba")]);
            //ok((J.exec("spec =: 1 1 ,: 2 2"), J.exec("spec [ ;. 0 M")), [stoa("ef"), stoa("hi")]);
            //ok((J.exec("spec =: 1 1 ,: _2 2"), J.exec("spec [ ;. 0 M")), [stoa("hi"), stoa("ef")]);
            ok(J["-:"]((J.exec("y =: 'what can be said '"), J.exec("< ;. _2 y")), J.exec("'what' ; 'can' ; 'be' ; 'said'")), true);
            ok(J.exec("# ;. _2 y"), [4, 3, 2, 4]);
            J.exec("z =: 'abdacd'");
            ok(J["-:"](J.exec("< ;. 1 z"), J.exec("'abd' ; 'acd'")), true);
            ok(J["-:"](J.exec("< ;. _1 z"), J.exec("'bd' ; 'cd'")), true);
            ok(J["-:"](J.exec("< ;. 2 z"), J.exec("'abd' ; 'acd'")), true);
            ok(J["-:"](J.exec("< ;. _2 z"), J.exec("'ab' ; 'ac'")), true);
            J.exec(`
            NB. (
            T =: 0 : 0
                 1   2  3
                 4   5  6
                19  20 21
                )`);
            ok(J.exec("$ T"), [30]);
            ok(J.exec("+/ T = LF"), 3);
            ok(J.exec("TABLE =: (\". ;. _2) T"), [[true, 2, 3], [4, 5, 6], [19, 20, 21]]);
            ok(J.exec("$ TABLE"), [3, 3]);
            ok((J.exec("frets =: ' ?!.'"), J.exec("t =: 'How are you?'"), J.exec("b =: t e. frets")),
                [false, false, false, true, false, false, false, true, false, false, false, true]);
            ok(J["-:"](J.exec("b < ;. _2 t"), J.exec("'How' ; 'are' ; 'you'")), true);
            J.exec("data =: 3 1 4 1 5 9");
            J.exec("bv =: 1 , 2 >/ \\ data");
            ok(J["-:"](J.exec("bv < ;. 1 data"), J.exec("(1 $ 3) ; 1 4 ; 1 5 9")), true);
        });

        it("dot", () => {
            const J = MorilibJ();

            ok((J.exec("M =: 2 2 $ 3 4 2 3"), J.exec("V =: 3 5"), J.exec("dot2 =: + . *"), J.exec("V dot2 M")), [[9, 12], [10, 15]]);
            ok((J.exec("dot =: +/ . *"), J.exec("V dot M")), [19, 27]);
            ok(J.exec("M dot2 M"), [[[9, 12], [8, 12]], [[6, 8], [6, 9]]]);
            ok(J.exec("M dot2 V"), [[9, 20], [6, 15]]);
            ok(J.exec("V dot M"), [19, 27]);
            ok(J.exec("M dot V"), [29, 21]);
            ok(J.exec("M dot M"), [[17, 24], [12, 17]]);
            J.exec("A =: 2 2 2 $ 1 2 3");
            ok(J.exec("A dot M"), [[[7, 10], [11, 15]], [[12, 17], [7, 10]]]);
            ok(J.exec("M dot A"), [[[11, 18], [13, 11]], [[8, 13], [9, 8]]]);
        });

        it("outer", () => {
            const J = MorilibJ();

            ok(J.exec("(1 2 3) */ 1 2 3"), [[1, 2, 3], [2, 4, 6], [3, 6, 9]]);
            ok(J.exec("(1 2 3) -/ 1 2 3"), [[0, -1, -2], [1, 0, -1], [2, 1, 0]]);
            ok(J.exec("(2 2 $ 1 2 3) -/ 1 2 3"), [[[0, -1, -2], [1, 0, -1]], [[2, 1, 0], [0, -1, -2]]]);
        });

        it("chapter18", () => {
            const J = MorilibJ();

            ok((J.exec("y =: 'abcde'"), J.exec("'a' e. y")), true);
            ok(J.exec("'w' e. y"), false);
            ok(J.exec("'ef' e. y"), [true, false]);
            ok((J.exec("z =: 'edcbad'"), J.exec("'a' e. y")), true);
            ok(J.exec("'w' e. z"), false);
            ok(J.exec("'ef' e. z"), [true, false]);
            ok(J.exec("(2 2 $ 'efzz') e. z"), [[true, false], [false, false]]);
            ok((J.exec("t =: 4 2 $ 'abcdef'"), J.exec("'cd' e. t")), true);
            ok((J.exec("t =: 4 2 $ 'abcdef'"), J.exec("(2 2 $ 'cdzz') e. t")), [true, false]);
            ok(J.exec("(2 4 $ 1 2) e. 2 3 $ 1 2"), [false, false]);
        });

        it("chapter20", () => {
            const J = MorilibJ();

            ok(J.exec("2 + 2"), 4);
            ok(J.exec("1.5 + 0.25"), 1.75);
            ok(J.exec("+ 2"), 2);
            ok(J.exec("2 - 2"), 0);
            ok(J.exec("1.5 - 0.25"), 1.25);
            ok(J.exec("- 2"), -2);
            ok(J.exec(">: 2"), 3);
            ok(J.exec(">: 2.5"), 3.5);
            ok(J.exec("<: 3"), 2);
            ok(J.exec("<: 2.5"), 1.5);
            ok(J.exec("2 * 3"), 6);
            ok(J.exec("1.5 * 0.25"), 0.375);
            ok(J.exec("* _2"), -1);
            ok(J.exec("* 0"), 0);
            ok(J.exec("* 2"), 1);
            ok(J.exec("1 % 4"), 0.25);
            ok(J.exec("1.4 % 0.25"), 5.6);
            ok(J.exec("1 % 0"), Number.POSITIVE_INFINITY);
            ok(J.exec("_1 % 0"), Number.NEGATIVE_INFINITY);
            ok(J.exec("0 % 0"), 0);
            ok(J.exec("% 2"), 0.5);
            ok(J.exec("+: 2.5"), 5);
            ok(J.exec("-: 6"), 3);
            ok(J.exec("-: 6.5"), 3.25);
            ok(J.exec("<. 2"), 2);
            ok(J.exec("<. 3.2"), 3);
            ok(J.exec("<. _3.2"), -4);
            ok(J.exec(">. 3.0"), 3);
            ok(J.exec(">. 3.1"), 4);
            ok(J.exec(">. _2.5"), -2);
            ok(J.exec("10 ^ 2"), 100);
            ok(J.exec("10 ^ _2"), 0.01);
            ok(J.exec("100 ^ 1%2"), 10);
            oknum(J.exec("^ 1"), Math.E);
            oknum(J.exec("^ 1.5"), Math.exp(1.5));
            ok(J.exec("*: 4"), 16);
            ok(J.exec("%: 9"), 3);
            ok(J.exec("3 %: 8"), 2);
            ok(J.exec("_3 %: 8"), 0.5);
            //J.exec("x =: 3 3.1");
            //ok(J["-:"](J.exec("x %: 8"), J.exec("8 ^ % x")), true);
            oknum(J.exec("10 ^. 1000"), 3);
            ok(J.exec("2 ^. 8"), 3);
            oknum((J.exec("e =: ^ 1"), J.exec("^. e")), 1);
            ok(J.exec("| 2"), 2);
            ok(J.exec("| _2"), 2);
            ok(J.exec("10 | 12"), 2);
            ok(J.exec("3 | _2 _1 0 1 2 3 4 5"), [1, 2, 0, 1, 2, 0, 1, 2]);
            oknum(J.exec("1.5 | 3.7"), 0.7);
            ok(J.exec("_3 | 2 _2"), [-1, -2]);
            ok(J.exec("6 +. 15"), 3);
            ok(J.exec("_6 +. _15"), 3);
            ok(J.exec("2.5 +. 3.5"), 0.5);
            ok(J.exec("_6 +. 15"), 3);
            ok(J.exec("6 +. _15"), 3);
            ok(J.exec("0 +. 2"), 2);
            ok(J.exec("0 +. _2"), 2);
            ok(J.exec("2 +. 0"), 2);
            ok(J.exec("_2 +. 0"), 2);
            ok(J.exec("0 +. 00"), 0);
            ok(J.exec("(2 * 3) *. (3 * 5)"), 30);
            ok(J.exec("_6 *. 15"), -30);
            ok(J.exec("6 *. _15"), -30);
            ok(J.exec("_6 *. _15"), 30);
            ok(J.exec("0 *. 15"), 0);
            ok(J.exec("6 *. 0"), 0);
            ok(J.exec("0 *. 00"), 0);
            oknum(J.exec("o. 1"), Math.PI);
            oknum(J.exec("o. 2"), 2 * Math.PI);
            oknum(J.exec("1 o. 1"), Math.sin(1));
            oknum(J.exec("2 o. 1"), Math.cos(1));
            oknum(J.exec("3 o. 1"), Math.tan(1));
            oknum(J.exec("5 o. 1"), Math.sinh(1));
            oknum(J.exec("6 o. 1"), Math.cosh(1));
            oknum(J.exec("7 o. 1"), Math.tanh(1));
            oknum(J.exec("_1 o. 1"), Math.asin(1));
            oknum(J.exec("_2 o. 1"), Math.acos(1));
            oknum(J.exec("_3 o. 1"), Math.atan(1));
            oknum(J.exec("_5 o. 1"), Math.asinh(1));
            oknum(J.exec("_6 o. 1"), Math.acosh(1));
            oknum(J.exec("_7 o. 0.5"), Math.atanh(0.5));
            oknum(J.exec("0 o. 2"), 1 - 2 * 2);
            oknum(J.exec("4 o. 2"), 1 + 2 * 2);
            oknum(J.exec("8 o. 2"), -(1 + 2 * 2));
            oknum(J.exec("_4 o. 2"), -1 + 2 * 2);
            oknum(J.exec("_8 o. 2"), -(1 + 2 * 2));
            oknum(J.exec("9 o. 2"), 2);
            oknum(J.exec("10 o. 2"), 2);
            oknum(J.exec("11 o. 2"), 0);
            oknum(J.exec("12 o. 2"), 0);
            oknum(J.exec("12 o. -2"), Math.PI);
            oknum(J.exec("_9 o. 2"), 2);
            oknum(J.exec("_10 o. 2"), 2);
            ok(J.exec("-. 0"), true);
            ok(J.exec("-. 1"), false);
            ok(J.exec("-. 0.25"), 0.75);
            ok(J.exec("-. 0 1 0"), [true, false, true]);
        });

        it("chapter22", () => {
            const J = MorilibJ();

            J.exec("pa     =: ('('&,) @: (,&')')");
            J.exec("cp     =: [ ` pa @. (+./ @: ('+-*' & e.))");
            J.exec("symbol =: (1 : (':';'< (cp > x), u, (cp > y)'))(\" 0 0)");
            J.exec("splus  =: '+' symbol");
            J.exec("sminus =: '-' symbol");
            J.exec("sprod  =: '*' symbol");
            J.exec("a =: <'a'");
            J.exec("b =: <'b'");
            J.exec("c =: <'c'");
            ok(J["-:"](J.exec("a splus b"), J.exec("< 'a+b'")), true);
            ok(J["-:"](J.exec("a sprod b splus c"), J.exec("< 'a*(b+c)'")), true);
            J.exec("sprodc =: '' symbol");
            ok(J["-:"](J.exec("a sprodc b"), J.exec("< 'ab'")), true);
            J.exec("sdot =: splus / . sprodc");
            J.exec("S =: 3 2 $ < \"0 'abcdef'");
            J.exec("T =: 2 3 $ < \"0 'pqrstu'");
            ok(J["-:"](J.exec("S sdot T"), J.exec("3 3 $ 'ap+bs' ; 'aq+bt' ; 'ar+bu' ; 'cp+ds' ; 'cq+dt' ; 'cr+du' ; 'ep+fs' ; 'eq+ft' ; 'er+fu'")), true);
            J.exec("A =: 1 2 3 $ <\"0 'abcdef'");
            J.exec("B =: 3 2 2 $ <\"0 'mnopqrstuvwx'");
            ok((J.exec("Z =: A sdot B"), J["-:"](J.exec("Z"),
                J.exec("1 2 2 2 $ 'am+(bq+cu)' ; 'an+(br+cv)' ; 'ao+(bs+cw)' ; 'ap+(bt+cx)' ; 'dm+(eq+fu)' ; 'dn+(er+fv)' ; 'do+(es+fw)' ; 'dp+(et+fx)'"))), true);
            //J.exec("sdet =: sminus / . sprodc");
            //ok(J["-:"](J.exec("sdet S"), J.exec("< '(a(d-f))-((c(b-f))-(e(b-d)))'")), true);
        });

        it("chapter27", () => {
            const J = MorilibJ();

            ok(J.exec("\". '1+2'"), 3);
            ok((J.exec("\". 'w =: 1 + 2'"), J.exec("w")), 3);
            ok(J.exec("\". '3'"), 3);
        });

        it("compare", () => {
            const J = MorilibJ();

            ok(J.exec("/: 3 2 1"), [2, 1, 0]);
            ok(J.exec("/: 'a' ; 1"), [1, 0]);
            ok(J.exec("/: 'b' ; 'a'"), [1, 0]);
            ok(J.exec("/: 'ab' ; 'a'"), [1, 0]);
            ok(J.exec("/: 'ac' ; 'ab'"), [1, 0]);
            ok(J.exec("/: 'aaa' ; 'aa'"), [1, 0]);
            ok(J.exec("/: (2 2 $ 1) ; 1 1"), [1, 0]);
            ok(J.exec("/: 1 2 3 ; 1 2"), [1, 0]);
            ok(J.exec("/: (2 2 2 $ 1) ; 2 2 1 $ 1"), [1, 0]);
            ok(J.exec("/: (< 1) ; 1 2"), [1, 0]);
            ok(J.exec("/: (< 2 1) ; (<< 1 2)"), [1, 0]);
        });

        it("misc", () => {
            const J = MorilibJ();

            ok((J.exec("f1 =: +"), J.exec("f2 =: f1 /"), J.exec("f2 2 3 4")), 9);
            ok((J.exec("f1 =: *"), J.exec("f2 2 3 4")), 24);
            ok(J.exec("(2 2 ,: 2 2) +/@:,;._3 (4 4 $ 1)"), [[4, 4], [4, 4]]);
            ok(J.exec("(1 1 ,: 2 2) +/@:,;._3 (4 4 $ 1)"), [[4, 4, 4], [4, 4, 4], [4, 4, 4]]);
            ok(J.exec("(3 1 ,: 2 2) +/@:,;._3 (4 4 $ 1)"), [[4, 4, 4]]);
            ok(J.exec("(4 1 ,: 2 2) +/@:,;._3 (4 4 $ 1)"), [[4, 4, 4]]);
            ok(J.exec("(5 1 ,: 2 2) +/@:,;._3 (4 4 $ 1)"), [[4, 4, 4]]);
            ok(J.exec("(5 5 ,: 2 2) +/@:,;._3 (4 4 $ 1)"), [[4]]);
            ok(J.exec("(5 5 ,: 4 4) +/@:,;._3 (4 4 $ 1)"), [[16]]);
            ok(J.exec("(2 2 2 ,: 2 2 2) +/@:,;._3 (4 4 4 $ 1)"), [[[8, 8], [8, 8]], [[8, 8], [8, 8]]]);
            ok(J["-:"](J.exec("(2 2 ,: 2 2) <;._3 (4 4 $ 1)"), J.exec("2 2 $ <(01 01 ,: 01 01)")), true);
            ok((J.exec("A =: '1 2 3 4 5 2 2 $ 1 2 1         '"), J.exec("\". 3 10 $ A")),
                [[[true, 2, 3, 4, 5], [0, 0, 0, 0, 0]], [[1, 2, 0, 0, 0], [1, 2, 0, 0, 0]], [[true, 0, 0, 0, 0], [0, 0, 0, 0, 0]]]);
        });
    });
});


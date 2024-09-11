import {
  SouffleContext,
  SouffleSyncExecutor,
  relation,
  rule,
  atom,
  body,
  Type,
  TypeDef,
} from "../src";

describe("Souffle.js integration tests", () => {
  it("should generate and execute a simple Soufflé program with correct output", () => {
    const ctx = new SouffleContext("VarPointsTo");

    // Add relation declarations
    ctx.add(
      relation("assign", [
        ["a", Type.symbol()],
        ["b", Type.symbol()],
      ]),
    );
    ctx.add(
      relation("new", [
        ["v", Type.symbol()],
        ["o", Type.symbol()],
      ]),
    );
    ctx.add(
      relation("ld", [
        ["a", Type.symbol()],
        ["b", Type.symbol()],
        ["f", Type.symbol()],
      ]),
    );
    ctx.add(
      relation("st", [
        ["a", Type.symbol()],
        ["f", Type.symbol()],
        ["b", Type.symbol()],
      ]),
    );

    // Add facts
    ctx.addFact("assign", ["v1", "v2"]);
    ctx.addFact("new", ["v1", "h1"]);
    ctx.addFact("new", ["v2", "h2"]);
    ctx.addFact("new", ["v3", "h3"]);
    ctx.addFact("st", ["v1", "f", "v3"]);
    ctx.addFact("ld", ["v4", "v1", "f"]);

    // Add rules for alias
    ctx.add(
      relation(
        "alias",
        [
          ["a", Type.symbol()],
          ["b", Type.symbol()],
        ],
        "output",
      ),
    );
    ctx.add(
      rule([atom("alias", ["X", "X"])], [body(atom("assign", ["X", "_"]))]),
    );
    ctx.add(
      rule([atom("alias", ["X", "X"])], [body(atom("assign", ["_", "X"]))]),
    );
    ctx.add(
      rule([atom("alias", ["X", "Y"])], [body(atom("assign", ["X", "Y"]))]),
    );
    ctx.add(
      rule(
        [atom("alias", ["X", "Y"])],
        [
          body(atom("ld", ["X", "A", "F"])),
          body(atom("alias", ["A", "B"])),
          body(atom("st", ["B", "F", "Y"])),
        ],
      ),
    );

    const executor = new SouffleSyncExecutor();
    const out = executor.execute(ctx);
    expect(out.kind).toBe("raw");
    if (out.kind !== "raw") {
      throw new Error("impossible");
    }
    expect(out.results).toBeDefined();
    expect(out.results.get("alias")!).toEqual([
      ["v1", "v1"],
      ["v1", "v2"],
      ["v2", "v2"],
      ["v4", "v3"],
    ]);
  });

  it("should generate and execute a program with a simple reachability analysis", () => {
    const ctx = new SouffleContext("Reachability");

    // Add relation declarations
    ctx.add(
      relation("edge", [
        ["from", Type.symbol()],
        ["to", Type.symbol()],
      ]),
    );
    ctx.add(relation("reachable", [["node", Type.symbol()]], "output"));

    // Add facts
    ctx.addFact("edge", ["A", "B"]);
    ctx.addFact("edge", ["B", "C"]);
    ctx.addFact("edge", ["C", "D"]);

    // Add rules
    ctx.add(rule([atom("reachable", ["X"])], [body(atom("edge", ["X", "_"]))]));
    ctx.add(
      rule(
        [atom("reachable", ["Y"])],
        [body(atom("reachable", ["X"])), body(atom("edge", ["X", "Y"]))],
      ),
    );

    const executor = new SouffleSyncExecutor();
    const out = executor.execute(ctx);
    expect(out.kind).toBe("raw");
    if (out.kind !== "raw") {
      throw new Error("impossible");
    }
    expect(out.results).toBeDefined();
    expect(out.results.get("reachable")!).toEqual([["A"], ["B"], ["C"], ["D"]]);
  });

  it("should generate and execute a program for simple ancestor relation", () => {
    const ctx = new SouffleContext("AncestorRelation");

    // Add relation declarations
    ctx.add(
      relation("parent", [
        ["child", Type.symbol()],
        ["parent", Type.symbol()],
      ]),
    );
    ctx.add(
      relation(
        "ancestor",
        [
          ["descendant", Type.symbol()],
          ["ancestor", Type.symbol()],
        ],
        "output",
      ),
    );

    // Add facts
    ctx.addFact("parent", ["B", "A"]);
    ctx.addFact("parent", ["C", "A"]);
    ctx.addFact("parent", ["D", "B"]);
    ctx.addFact("parent", ["E", "C"]);

    // Add rules
    ctx.add(
      rule([atom("ancestor", ["X", "Y"])], [body(atom("parent", ["X", "Y"]))]),
    );
    ctx.add(
      rule(
        [atom("ancestor", ["X", "Z"])],
        [body(atom("parent", ["X", "Y"])), body(atom("ancestor", ["Y", "Z"]))],
      ),
    );

    const executor = new SouffleSyncExecutor({ processResults: false });
    const out = executor.execute(ctx);
    expect(out.kind).toBe("raw");
    if (out.kind !== "raw") {
      throw new Error("impossible");
    }
    expect(out.results).toBeDefined();
    expect(out.results.get("ancestor")!).toEqual([
      ["B", "A"],
      ["C", "A"],
      ["D", "B"],
      ["D", "A"],
      ["E", "A"],
      ["E", "C"],
    ]);
  });

  it("should generate and execute a program with equivalence types", () => {
    const ctx = new SouffleContext("EquivalenceTypes");

    ctx.add(TypeDef.equivalence("Alias", Type.symbol()));

    ctx.add(
      relation("assign", [
        ["a", Type.custom("Alias")],
        ["b", Type.custom("Alias")],
      ]),
    );
    ctx.add(
      relation(
        "alias",
        [
          ["a", Type.custom("Alias")],
          ["b", Type.custom("Alias")],
        ],
        "output",
      ),
    );

    ctx.addFact("assign", ["v1", "v2"]);

    ctx.add(
      rule([atom("alias", ["X", "Y"])], [body(atom("assign", ["X", "Y"]))]),
    );

    const executor = new SouffleSyncExecutor({ processResults: false });
    const out = executor.execute(ctx);
    expect(out.kind).toBe("raw");
    if (out.kind !== "raw") {
      throw new Error("impossible");
    }
    expect(out.results).toBeDefined();
    expect(out.results.get("alias")!).toEqual([["v1", "v2"]]);
  });

  it("should generate and execute a program with subtype types", () => {
    const ctx = new SouffleContext("SubtypeTypes");

    ctx.add(TypeDef.subtype("Alias", Type.symbol()));

    ctx.add(
      relation("assign", [
        ["a", Type.custom("Alias")],
        ["b", Type.symbol()],
      ]),
    );
    ctx.add(
      relation(
        "alias",
        [
          ["a", Type.custom("Alias")],
          ["b", Type.symbol()],
        ],
        "output",
      ),
    );

    ctx.addFact("assign", ["v1", "v2"]);

    ctx.add(
      rule([atom("alias", ["X", "Y"])], [body(atom("assign", ["X", "Y"]))]),
    );

    const executor = new SouffleSyncExecutor({ processResults: false });
    const out = executor.execute(ctx);

    expect(out.kind).toBe("raw");
    if (out.kind !== "raw") {
      throw new Error("impossible");
    }
    expect(out.results).toBeDefined();
    expect(out.results.get("alias")!).toEqual([["v1", "v2"]]);
  });
});

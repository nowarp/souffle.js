/**
 * Comments in the source code.
 * See: https://souffle-lang.github.io/program#comments
 */
export type SouffleComment = {
  kind: "comment";
  style: "//" | "/*";
  lines: string[];
};

/**
 * Type definitions.
 * See: https://souffle-lang.github.io/types
 */
export type SouffleTypeDefinition =
  | SouffleEquivalenceTypeDefinition
  | SouffleSubtypeTypeDefinition;
export type SouffleEquivalenceTypeDefinition = {
  kind: "equivalence_type_definition";
  name: string;
  type: SouffleType;
};
export type SouffleSubtypeTypeDefinition = {
  kind: "subtype_type_definition";
  name: string;
  type: SouffleType;
};

/**
 * Souffle type annotations as they appear in the source code.
 */
export type SouffleType = SoufflePrimitiveType | SouffleCustomType;
export type SouffleCustomType = { kind: "custom_type"; value: string };
export type SoufflePrimitiveType = {
  kind: "primitive_type";
  value: SoufflePrimitiveTypeValue;
};
export type SoufflePrimitiveTypeValue =
  | "Symbol"
  | "Number"
  | "Unsigned"
  | "Float";

/**
 * Soufflé facts are always connected to relation declarations, which define their
 * type. Thus, in most cases, you should use `SouffleContext.addFact` to introduce
 * new facts bound to relations.
 * See: https://souffle-lang.github.io/facts
 */
export type SouffleFact<FactData = undefined> = {
  kind: "fact";
  relationName: string;
  values: SouffleFactValue[];
  data?: FactData;
};
export type SouffleFactValue = string | number;

/**
 * Declaration of a Soufflé relation.
 * See: https://souffle-lang.github.io/relations
 */
export type SouffleRelation = {
  kind: "relation";
  name: string;
  comment: SouffleComment | undefined;
  args: SouffleRelationArg[];
  io: SouffleRelationIO | undefined;
};
export type SouffleRelationArg = { name: string; type: SouffleType };
export type SouffleRelationIO = "input" | "output";

/**
 * An atom of the Soufflé rule.
 * See: https://souffle-lang.github.io/rules#atom
 */
export type SouffleAtom = {
  kind: "atom";
  name: string;
  args: string[];
};

/**
 * A predicate used in rules to produce boolean values.
 * See: https://souffle-lang.github.io/constraints
 */
export type SouffleConstraint =
  | {
      kind: "binary";
      lhs: SouffleConstraintArg;
      op: SouffleConstraintOp;
      rhs: SouffleConstraintArg;
    }
  | { kind: "match"; lhs: SouffleConstraintArg; rhs: SouffleConstraintArg }
  | { kind: "contains"; lhs: SouffleConstraintArg; rhs: SouffleConstraintArg }
  | { kind: "boolean"; value: boolean };
export type SouffleConstraintOp = "<" | ">" | "<=" | ">=" | "=" | "!=";
export type SouffleConstraintArg = string | number;

/**
 * Body of a rule which is present as a conjunction of (negated) atoms/constraints/disjunctions.
 * See: https://souffle-lang.github.io/rules#conjunction
 */
export type SouffleRuleBody =
  | { kind: "atom"; value: SouffleAtom; negated: boolean }
  | { kind: "constraint"; value: SouffleConstraint; negated: boolean };

/**
 * See: https://souffle-lang.github.io/rules
 * A rule could contain multiple heads: https://souffle-lang.github.io/rules#multiple-heads
 */
export type SouffleRule = {
  kind: "rule";
  heads: SouffleAtom[];
  body: SouffleRuleBody[];
  comment: SouffleComment | undefined;
};

/**
 * Soufflé program present in a single source file.
 * See: https://souffle-lang.github.io/program
 */
export type SouffleProgram<FactData = undefined> = {
  kind: "program";
  name: string;
  comment: SouffleComment | undefined;
  entries: SouffleProgramEntry<FactData>[];
};

export type SouffleProgramEntry<FactData = undefined> =
  | SouffleComment
  | SouffleTypeDefinition
  | SouffleFact<FactData>
  | SouffleRelation
  | SouffleRule;

export type SouffleNode<FactData = undefined> =
  | SouffleComment
  | SouffleTypeDefinition
  | SouffleProgram<FactData>
  | SouffleFact<FactData>
  | SouffleRelation
  | SouffleRule
  | SouffleAtom;

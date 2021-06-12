import {
  buildInitPayload,
  process,
  processInputNode,
  processOutputNode,
  processOutputIdNode,
  processActionLowerNode,
  processActionUpperNode,
  processActionJoinNode,
} from "../importer";

describe("Verify buildInitPayload", () => {
  describe("Handle CSV", () => {
    test("Happy path", () => {
      const config = {
        type: "CSV",
        delimiter: ";",
        columns: ["firstName", "lastName", "age"],
      };
      const data = "Foo;Bar;42";
      const payload = buildInitPayload(config, data);

      expect(payload).toEqual({
        firstName: "Foo",
        lastName: "Bar",
        age: "42",
      });
    });
  });
});

describe("process", () => {
  const payload = {
    firstName: "Foo",
    lastName: "Bar",
  };
  const mapping = {
    inputNameToNodeId: {
      firstName: "in_0",
      lastName: "in_1",
    },
    nodeIdToNode: {
      in_0: {
        id: "in_0",
        type: "input",
        data: { label: "firstName" },
      },
      in_1: {
        id: "in_1",
        type: "input",
        data: { label: "lastName" },
      },
      out_0: {
        id: "out_0",
        type: "argument",
        data: { name: "firstName" },
      },
      out_1: {
        id: "out_1",
        type: "argument",
        data: { name: "lastName" },
      },
      out_2: {
        id: "out_2",
        type: "argument",
        data: { name: "lowerLastName" },
      },
      a_1: {
        id: "a_1",
        type: "lower",
      },
    },
    nodeIdToedges: {
      in_0: { id: "ein_0_out_0", source: "in_0", target: "out_0" },
      in_1: { id: "ein_1_out_1", source: "in_1", target: "out_1" },
    },
  };
  describe("process", () => {
    test("Happy path", () => {
      const result = process(payload, mapping);
      expect(result).toEqual([{ firstName: "Foo" }, { lastName: "Bar" }]);
    });
  });

  describe("processInputNode", () => {
    const args = {
      node: {
        id: "in_0",
        type: "input",
        data: { label: "firstName" },
        sourcePosition: "right",
      },
      value: "Foo",
      payload: {},
      mapping,
    };

    test("Happy path", () => {
      const result = processInputNode(args);
      const expected = { ...args, node: mapping.nodeIdToNode.out_0 };
      expect(result).toEqual(expected);
    });
  });

  describe("processOutputNode", () => {
    const args = {
      node: {
        id: "out_0",
        type: "argument",
        data: { name: "firstName" },
        targetPosition: "left",
      },
      value: "Foo",
      payload: {},
      mapping,
    };

    test("validate output", () => {
      const result = processOutputNode(args);
      const expected = { firstName: "Foo" };
      expect(result).toEqual(expected);
    });

    test("validate output id", () => {
      const result = processOutputIdNode({
        ...args,
        node: { ...args.node, type: "argumentKey" },
      });
      const expected = { firstName: "Foo", _id: true };
      expect(result).toEqual(expected);
    });
  });

  describe("processToLowerActionNode", () => {
    const payload = {
      firstName: "Foo",
    };
    const mapping = {
      inputNameToNodeId: {
        firstName: "in_0",
      },
      nodeIdToNode: {
        in_0: {
          id: "in_0",
          type: "input",
          data: { label: "firstName" },
        },
        out_0: {
          id: "out_0",
          type: "argument",
          data: { name: "firstName" },
        },
        a_0: {
          id: "a_0",
          type: "lower",
        },
      },
      nodeIdToedges: {
        in_0: { id: "ein_0_out_0", source: "in_0", target: "a_0" },
        a_0: { id: "ea_1_out_1", source: "a_1", target: "out_0" },
      },
    };
    const args = {
      node: {
        id: "a_0",
        type: "lower",
        data: {},
      },
      value: "Foo",
      payload: {},
      mapping,
    };

    test("Validate to lower", () => {
      const result = processActionLowerNode(args);
      const expected = {
        ...args,
        value: "foo",
        node: mapping.nodeIdToNode.out_0,
      };
      expect(result).toEqual(expected);
    });

    test("Validate to upper", () => {
      const upperArgs = { ...args, node: { ...args.node, type: "upper" } };
      const result = processActionUpperNode(upperArgs);
      const expected = {
        ...args,
        value: "FOO",
        node: mapping.nodeIdToNode.out_0,
      };
      expect(result).toEqual(expected);
    });
  });

  describe("processToJoinActionNode", () => {
    const payload = {
      firstName: "Foo",
      lastName: "Bar",
    };
    const mapping = {
      inputNameToNodeId: {
        firstName: "in_0",
        lastName: "in_1",
      },
      nodeIdToNode: {
        in_0: {
          id: "in_0",
          type: "input",
          data: { label: "firstName" },
        },
        in_1: {
          id: "in_1",
          type: "input",
          data: { label: "lastName" },
        },
        action_0: {
          id: "action_0",
          type: "join",
          data: { joiner: "_" },
        },
        out_0: {
          id: "out_0",
          type: "argument",
          data: { name: "firstName" },
        },
      },
      nodeIdToedges: {
        in_0_a: {
          id: "edge_in_0_to_action_0",
          type: "default",
          source: "in_0",
          target: "action_0",
          targetHandle: "a",
        },
        in_1_b: {
          id: "edge_in_1_to_action_0",
          type: "default",
          source: "in_1",
          target: "action_0",
          targetHandle: "b",
        },
        action_0: {
          id: "edge_action_0_to_out_0",
          type: "default",
          source: "action_0",
          sourceHandle: "c",
          target: "out_0",
          targetHandle: null,
        },
      },
    };

    test("Validate in_0 to action A, handler with B is not set, expect pipeline stop", () => {
      const args = {
        edge: mapping.nodeIdToedges.in_0_a,
        value: "Foo",
        payload: {},
        mapping,
      };
      const result = processActionJoinNode(args);
      const expected = {
        payload: { action_0_a: "Foo" },
        mapping,
      };
      expect(result).toEqual(expected);
      expect(args.payload).toEqual(expected.payload);
    });

    test("Validate in_1 to action B, with A is set, expect joined result", () => {
      const args = {
        edge: mapping.nodeIdToedges.in_1_b,
        value: "Bar",
        payload: { action_0_a: "Foo" },
        mapping,
      };
      const result = processActionJoinNode(args);
      const expected = {
        edge: mapping.nodeIdToedges.action_0,
        value: "Foo_Bar",
        payload: {
          action_0_a: "Foo",
          action_0_b: "Bar",
          action_0_c: "Foo_Bar",
        },
        mapping,
      };
      expect(result).toEqual(expected);
      expect(args.payload).toEqual(expected.payload);
    });
  });
});

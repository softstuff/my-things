import {
  buildInitPayload,
  processOutputNode,
  processOutputIdNode,
  processActionLowerNode,
  processActionUpperNode,
  processActionJoinNode,
  processChunk,
  buildRegistry,
  pushIt,
} from "../importer";

describe("Verify buildInitPayload", () => {
  describe("Handle CSV", () => {
    test("Happy path", () => {
      const type = "CSV"
      const config = {
        separator: ";",
        columns: ["firstName", "lastName", "age"],
      };
      const input = "Foo;Bar;42";
      const payload = buildInitPayload(input, type, config);

      expect(payload).toEqual({
        firstName: "Foo",
        lastName: "Bar",
        age: "42",
      });
    });
  });
});


describe("Verify buildRegistry", () => {

    const mapping = {
      elements: [
        {id: "ein_0_out_0", source: "in_0", target: "out_0"},
        {id: "ein_1_out_1", source: "in_1", target: "out_1"},
        {id: "in_0", type: "input", data: {label: "firstName"}},
        {id: "in_1", type: "input", data: {label: "lastName"}},
        {id: "out_0", type: "attribute", data: {label: "firstName"}},
        {id: "out_1", type: "attribute", data: {label: "lastName"}},
      ]
    }

    test("Happy path", () => {
      const registry = buildRegistry(mapping)

      expect(registry).toEqual(
        {
          inputSelectorToInputNode: {
            firstName: "in_0",
            lastName: "in_1"
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
              type: "attribute",
              data: { label: "firstName" },
            },
            out_1: {
              id: "out_1",
              type: "attribute",
              data: { label: "lastName" },
            }
          },
          nodeIdToEdges: {
            in_0: [{id: "ein_0_out_0", source: "in_0", target: "out_0"}],
            in_1: [{id: "ein_1_out_1", source: "in_1", target: "out_1"}],
          }
        }
      )
    });
  });

describe("process", () => {

  const register = {

    inputSelectorToInputNode: {
      firstName: "in_0",
      lastName: "in_1",
      age: "in_2"
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
      in_2: {
        id: "in_2",
        type: "input",
        data: { label: "33" },
      },
      out_0: {
        id: "out_0",
        type: "attribute",
        data: { label: "name" },
      },
      out_1: {
        id: "out_1",
        type: "attribute",
        data: { label: "age" },
      },
      a_0: {
        id: "a_0",
        type: "lower",
      },
      a_1: {
        id: "a_1",
        type: "upper",
      },
      a_2: {
        id: "a_2",
        type: "join",
        data: { separator: "_" },
      },
    },
    nodeIdToEdges: {
      in_0: [{ id: "ein_0_a_0", source: "in_0", target: "a_0" }],
      in_1: [{ id: "ein_1_a_1", source: "in_1", target: "a_1" }],
      in_2: [{ id: "ein_1_out_0", source: "in_2", target: "out_1" }],
      a_0: [{  id: "edge_a_0_to_a_2", type: "default", source: "a_0", target: "a_2", targetHandle: "a" }],
      a_1: [{  id: "edge_a_1_to_a_2", type: "default", source: "a_1", target: "a_2", targetHandle: "b" }],
      a_2: [{  id: "edge_a_2_to_out_1", type: "default", source: "a_2", sourceHandle: "c", target: "out_0", targetHandle: null }]
    },
  };
  describe("process", () => {
    test("Happy path", () => {
      const type = "CSV"
      const config = {
        separator: ";",
        columns: ["firstName","lastName","age"]
      }
      let input = "Foo;Bar;33"

      const result = processChunk(input, type, config, register);

      expect(result).toEqual({
        firstName: "Foo",
        lastName: "Bar",
        age: "33",
        in_0: "Foo",
        in_1: "Bar",
        in_2: "33",
        a_0: "foo",
        a_1: "BAR",
        a_2_a: "foo",
        a_2_b: "BAR",
        a_2: "foo_BAR",
        out_0: "foo_BAR",
        out_1: "33"
      });
    });
  });

  
  describe("processOutputNode", () => {
    

    test("validate output", () => {
      const args = {
        edge: register.nodeIdToEdges.in_2[0], 
        payload: {in_2: "Foo"},
        register,
      };
      processOutputNode(args);
      expect(args.payload).toEqual({in_2: "Foo", out_1: "Foo"});
    });

    test("validate output id", () => {
      const args = {
        edge: register.nodeIdToEdges.in_2[0], 
        payload: {in_2: "Foo"},
        register,
      };
      processOutputIdNode(args);
      expect(args.payload).toEqual({in_2: "Foo", out_1: "Foo"});
    });
  });

  describe("processToLowerActionNode", () => {

    const register = {
      nodeIdToNode: {
        in_0: {
          id: "in_0",
          type: "input",
          data: { label: "firstName" },
        },
        out_0: {
          id: "out_0",
          type: "attribute",
          data: { name: "firstName" },
        },
        a_0: {
          id: "a_0",
          type: "lower",
        },
        a_1: {
          id: "a_1",
          type: "upper",
        },
      },
      nodeIdToEdges: {
        in_0: [{ id: "ein_0_out_0", source: "in_0", target: "a_0" }],
        in_1: [{ id: "ein_1_out_0", source: "in_1", target: "a_1" }],
        a_0: [{ id: "ea_0_out_1", source: "a_0", target: "out_0" }],
        a_1: [{ id: "ea_1_out_1", source: "a_1", target: "out_0" }],
      },
    };
    

    test("Validate to lower", () => {
      const args = {
        edge: register.nodeIdToEdges.in_0[0],
        payload: {in_0: "Foo"},
        register,
      };
      processActionLowerNode(args);
      const expectedPayload = {in_0: "Foo", a_0: "foo"}
      expect(args.payload).toEqual(expectedPayload);
    });

    test("Validate to upper", () => {
      const args = {
        edge: register.nodeIdToEdges.in_1[0],
        payload: {in_1: "Foo"},
        register,
      };
      processActionUpperNode(args);
      const expectedPayload = {in_1: "Foo", a_1: "FOO"}
      expect(args.payload).toEqual(expectedPayload);
    });
  });

  describe("processToJoinActionNode", () => {
    const register = {
      inputToNode: {
        firstName: "in_0"
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
          data: { separator: "_" },
        },
        out_0: {
          id: "out_0",
          type: "attribute",
          data: { name: "firstName" },
        },
      },
      nodeIdToEdges: {
        in_0_a: [{
          id: "edge_in_0_to_action_0",
          type: "default",
          source: "in_0",
          target: "action_0",
          targetHandle: "a",
        }],
        in_1_b: [{
          id: "edge_in_1_to_action_0",
          type: "default",
          source: "in_1",
          target: "action_0",
          targetHandle: "b",
        }],
        action_0: [{
          id: "edge_action_0_to_out_0",
          type: "default",
          source: "action_0",
          sourceHandle: "c",
          target: "out_0",
          targetHandle: null,
        }],
      },
    };

    test("Validate in_0 to action A, handler with B is not set, expect pipeline stop", () => {
      const args = {
        edge: register.nodeIdToEdges.in_0_a[0],
        payload: {in_0: "Foo"},
        register,
      };
      processActionJoinNode(args);
      const expectedPayload = {in_0: "Foo", action_0_a: "Foo" }
      expect(args.payload).toEqual(expectedPayload);
    });

    test("Validate in_1 to action B, with A is set, expect joined result", () => {
      const args = {
        edge: register.nodeIdToEdges.in_1_b[0],
        payload: { in_1: "Bar", action_0_a: "Foo" },
        register,
      };
      processActionJoinNode(args);
      const expectedPayload =  { in_1: "Bar", action_0_a: "Foo", action_0_b: "Bar", action_0: "Foo_Bar" }
      expect(args.payload).toEqual(expectedPayload);
    });
  });
});

describe("process multiple edges", () => {

  const register = {
    inputToNode: {
      firstName: "in_0"
    },
    nodeIdToNode: {
      in_0: {
        id: "in_0",
        type: "input",
        data: { label: "firstName" },
      },
      out_0: {
        id: "out_0",
        type: "attribute",
        data: { name: "firstName1" },
      },
      out_1: {
        id: "out_1",
        type: "attribute",
        data: { name: "firstName2" },
      },
    },
    nodeIdToEdges: {
      in_0: [{
        id: "edge_in_0_to_out_0",
        type: "default",
        source: "in_0",
        target: "out_0"
      }, {
        id: "edge_in_1_to_out_1",
        type: "default",
        source: "in_0",
        target: "out_1"
      }]
    },
  };

  test("Validate in_0 is connected to out_0 and out_1", () => {
    const args = {
      edges: register.nodeIdToEdges.in_0,
      payload: {in_0: "Foo"},
      register,
    };
    pushIt(args);

    const expectedPayload = {in_0: "Foo", out_0: "Foo", out_1: "Foo" }
    expect(args.payload).toEqual(expectedPayload);
  });
});

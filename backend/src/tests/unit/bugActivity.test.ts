import { captureBugChanges } from "../../utils/bugActivity";

describe("captureBugChanges Utility", () => {
  it("should return an empty array if there are no changes", () => {
    const oldData = { title: "Bug 1", priority: "high" };
    const newData = { title: "Bug 1", priority: "high" };
    
    const changes = captureBugChanges(oldData, newData);
    expect(changes).toHaveLength(0);
  });

  it("should capture simple field changes", () => {
    const oldData = { title: "Old Title", status: "open" };
    const newData = { title: "New Title", status: "closed" };
    
    const changes = captureBugChanges(oldData, newData);
    
    expect(changes).toContainEqual({
      field: "title",
      oldValue: "Old Title",
      newValue: "New Title"
    });
    expect(changes).toContainEqual({
      field: "status",
      oldValue: "open",
      newValue: "closed"
    });
  });

  it("should ignore metadata fields like _id and updatedAt", () => {
    const oldData = { title: "Same", _id: "123", updatedAt: "yesterday" };
    const newData = { title: "Same", _id: "456", updatedAt: "today" };
    
    const changes = captureBugChanges(oldData, newData);
    expect(changes).toHaveLength(0);
  });
});

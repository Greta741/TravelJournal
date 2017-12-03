module.exports = {
  meta: {
    docs: {
      description: "Disallow numbers in variable names",
      category: "Best Practices",
      recommended: true
    }
  },
  create(context) {
    return {
      Identifier(node) {
        if (node.parent.type === "VariableDeclarator") {
          if (node.name.match(/\d+/g) !== null) {
            context.report({
              node,
              message:
                "Numbers in variable names are not allowed"
            });
          } else {
            return;
          }
        } else {
          return;
        }
      }
    };
  }
};

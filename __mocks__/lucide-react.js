const React = require("react");

module.exports = new Proxy(
  {},
  {
    get: (_, prop) => {
      const Icon = (props) =>
        React.createElement("svg", { "data-icon": String(prop), ...props });
      return Icon;
    },
  },
);

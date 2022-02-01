// babel.config.js
module.exports = {
    presets: [
        [
            "@babel/preset-react",
            {
                targets: {
                    node: "current",
                },
            },
        ],
    ],
};


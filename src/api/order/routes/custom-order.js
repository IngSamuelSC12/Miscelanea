const { Router } = require("react-router-dom/cjs/react-router-dom");

module.exports = {
    routes: [
        {
            method: "POST",
            path: "/payment-order",
            handler: "order.paymentOrder",
        },
    ],
};

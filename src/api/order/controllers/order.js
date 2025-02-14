'use strict';
// @ts-ignore
const stripe = require("stripe")(
    "sk_test_51P7V5yJGJoYKErb0GKbhkP2XpZ5Kwil1v182Fgv86Hmn9lN06ebBldBZcuI33lYYnaTmLcz9zSQB5doedaDg3kjs00o0xTbReE");

    function calcDiscountPrice (price, discount){
        if(!discount) return price;

        const discountAmount = (price * discount) / 100;
        const result = price - discountAmount;

        return result.toFixed(2);
    }
/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order',  ( {strapi} ) => ({
    async paymentOrder (ctx) {
        // @ts-ignore
        const { token, products, idUser, addressShipping } = ctx.request.body;

        console.log(ctx);

        let totalPayment = 0;
        products.forEach((product) => {
            const priceTemp = calcDiscountPrice(
                product.attributes.price,
                product.attributes.discount
            );
            totalPayment += Number(priceTemp) * product.quantity;
        });
        const charge = await stripe.charges.create({
            amount: Math.round(totalPayment * 100),
            currency: "eur",
            source: token.id,
            description: `User ID: ${idUser}`
        });

        const data = {
            products,
            user: idUser,
            totalPayment,
            idPayment: charge.id,
            addressShipping,
        };
        
        const model = strapi.contentTypes["api::order.order"];
        const validData = await strapi.entityValidator.validateEntityCreation(
            model, 
            // @ts-ignore
            data  
        );

        const entry = await strapi.db
            .query["api::order.order"]
            .create({ data: validData })

        return entry;
    }, 
}));

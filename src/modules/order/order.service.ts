import { BadRequestException, Injectable } from "@nestjs/common";
import { orderRepository } from "src/DB/models/Order/order.repository";
import { TUser } from "src/DB/models/User/user.schema";
import { creatOrderDTO, orderIdDTO, UpdateOrderStatusDTO } from "./dto";
import { CartRepository } from "src/DB/models/Cart/cart.repository";
import { IPaymentMethod, IProducts, OrderStatus } from "src/DB/models/Order/order.schema";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { CartService } from "../cart/cart.service";
import { Types } from "mongoose";
import { StripeService } from "src/commen/service/stripe.service";
import { Request } from "express";
import { RoleTypes } from "src/DB/models/User/user.schema";
import { CouponService } from "../coupon/coupon.service";

@Injectable()
export class orderService {
    constructor(
        private readonly orderRepository: orderRepository,
        private readonly cartRepository: CartRepository,
        private readonly productRepository: ProductRepository,
        private readonly cartService: CartService,
        private readonly stripeService: StripeService,
        private readonly couponService: CouponService
    ) { }
    async creatOrder(user: TUser, body: creatOrderDTO) {
        const cart = await this.cartRepository.findOne({ createdBy: user._id })
        if (!cart?.products?.length)
            throw new BadRequestException("Empty Cart")
        let products: IProducts[] = [];
        let sub_Total: number = 0
        for (const product of cart.products) {
            const productItem = await this.productRepository.findOne({ _id: product.productId, stock: { $gte: product.quantity } })
            if (!productItem)
                throw new BadRequestException("product out of stock or not found::    " + product.productId)
            let finalPrice = productItem.finalPrice * product.quantity
            products.push({
                finalPrice,
                name: productItem.name,
                quantity: product.quantity,
                unitPrice: productItem.finalPrice,
                productId: productItem._id
            })
            sub_Total += finalPrice
        }
        let finalPrice = sub_Total
        let discountAmount = 0
        let appliedCoupon: Types.ObjectId | undefined = undefined
        let couponCode: string | undefined = undefined

        // Apply coupon if provided
        if (body.couponCode) {
            try {
                const couponValidation = await this.couponService.validateCoupon({
                    code: body.couponCode,
                    orderAmount: sub_Total
                });
                
                discountAmount = couponValidation.data.discountAmount;
                finalPrice = couponValidation.data.finalAmount;
                appliedCoupon = couponValidation.data.coupon.id;
                couponCode = body.couponCode.toUpperCase();
                
                // Increment coupon usage
                await this.couponService.applyCoupon(appliedCoupon.toString());
            } catch (error) {
                throw new BadRequestException(error.message);
            }
        }

        const order = await this.orderRepository.create({
            ...body,
            sub_Total,
            finalPrice,
            discountAmount,
            appliedCoupon,
            couponCode,
            products,
            createdBy: user._id
        })
        await this.cartService.clearCart(user)
        for (const product of cart.products) {
            await this.productRepository.updateOne({ _id: product.productId }, { $inc: { stock: -product.quantity } })
        }
        return { success: true, data: order }

    }
    async cheakout(user: TUser, orderId: Types.ObjectId) {
        const order = await this.orderRepository.findOne({
            _id: orderId,
            paymentMethod: IPaymentMethod.card,
            status: OrderStatus.pending,
            createdBy: user._id
        })
        if (!order)
            throw new BadRequestException("In-valid-order")
        let discount: { coupon: string }[] = []
        if (order.discountAmount && order.appliedCoupon) {
            // Fetch coupon from DB
            const coupon = await this.couponService.couponRepository.findById(order.appliedCoupon);
            if (coupon && coupon.type === 'percentage' && coupon.value <= 100) {
                const stripeCoupon = await this.stripeService.createCoupon({ percent_off: coupon.value, duration: "once" });
                discount.push({ coupon: stripeCoupon.id });
            }
            // If coupon is fixed or invalid, do not send percent_off to Stripe (discount is handled in backend)
        }
        const session = await this.stripeService.cheakoutSession({
            customer_email: user.email,
            line_items: order.products.map((product) => ({
                quantity: product.quantity,
                price_data: {
                    product_data: {
                        name: product.name
                    },
                    currency: "egp",
                    unit_amount: product.unitPrice * 100
                }
            })),
            metadata: { orderId: orderId as unknown as string },
            discounts: discount
        })
        // const intent = await this.stripeService.createPaymentIntent(order.finalPrice)
        // await this.orderRepository.updateOne({ _id: order.id }, { intent: intent.id })

        // console.log(session)
        return { success: true, data: session }
    }
    async webhook(req: Request) {
        const data = await this.stripeService.webhook(req)

        if (typeof data === 'string') {
            // Handle string case if needed
            return "Done"
        } else {
            await this.orderRepository.updateOne(
                { _id: data.orderId },
                {
                    intent: data.intentId,
                    paidAt: Date.now(),
                    status: OrderStatus.placed,
                }
            );
        }

    };
    async cancelOrder(user: TUser, orderId: Types.ObjectId) {
        const order = await this.orderRepository.findOne(
            {
                _id: orderId,
                $or: [
                    { status: OrderStatus.pending },
                    { status: OrderStatus.placed }
                ],
                createdBy: user._id
            })
        if (!order)
            throw new BadRequestException("Invaild-order")
        let refund = {}
        if (order.paymentMethod == IPaymentMethod.card && order.status == OrderStatus.placed) {
            refund = { refundAmount: order.finalPrice, refundDate: Date.now() }
            await this.stripeService.refund(order.intent as string)
        }
        await this.orderRepository.updateOne({ _id: orderId }, { status: OrderStatus.canceled, updatedBy: user._id, ...refund })
        for (const product of order.products) {
            await this.productRepository.updateOne({ _id: product.productId }, { $inc: { stock: product.quantity } })
        }
        return { success: true, data: "Order Refund Successfully" }
    }
    async getUserOrders(userId: Types.ObjectId) {
        const orders = await this.orderRepository.find({ createdBy: userId });
        return orders;
    }
    async getOrderDetails(user: TUser, orderId: Types.ObjectId) {
        const order = await this.orderRepository.findOne({
            _id: orderId,
            createdBy: user._id,
        });

        if (!order) {
            throw new BadRequestException('Order not found or you do not have access to this order');
        }

        return { success: true, data: order };
    }

    // Admin Dashboard Methods
    async getAllOrders(query: { status?: OrderStatus; page?: number; sort?: string }, user?: TUser) {
        let filter: any = {};
        
        if (query.status) {
            filter.status = query.status;
        }

        // Delivery personnel restrictions - can only see orders ready for delivery
        if (user?.role === RoleTypes.DELIVERY) {
            filter.status = { 
                $in: [OrderStatus.placed, OrderStatus.onWay] 
            };
        }

        const data = await this.orderRepository.find(
            filter,
            "",
            { sort: query.sort || { createdAt: -1 } },
            query.page
        );
        
        return { success: true, data };
    }

    async getOrderById(orderId: Types.ObjectId, user?: TUser) {
        const order = await this.orderRepository.findById(orderId, {}, {
            populate: [
                { path: "createdBy", select: "name email phone" },
                { path: "updatedBy", select: "name email" }
            ]
        });

        if (!order) {
            throw new BadRequestException('Order not found');
        }

        // Delivery personnel restrictions - can only see orders ready for delivery
        if (user?.role === RoleTypes.DELIVERY) {
            if (![OrderStatus.placed, OrderStatus.onWay].includes(order.status)) {
                throw new BadRequestException('You can only view orders that are ready for delivery');
            }
        }

        return { success: true, data: order };
    }

    async updateOrderStatus(admin: TUser, orderId: Types.ObjectId, body: UpdateOrderStatusDTO) {
        const order = await this.orderRepository.findById(orderId);
        
        if (!order) {
            throw new BadRequestException('Order not found');
        }

        // Validate status transition
        if (order.status === OrderStatus.canceled) {
            throw new BadRequestException('Cannot update canceled order');
        }

        if (order.status === OrderStatus.delivered && body.status !== OrderStatus.delivered) {
            throw new BadRequestException('Cannot change status of delivered order');
        }

        // Delivery personnel restrictions
        if (admin.role === RoleTypes.DELIVERY) {
            // Delivery can only update to: on_way, delivered
            if (![OrderStatus.onWay, OrderStatus.delivered].includes(body.status)) {
                throw new BadRequestException('Delivery personnel can only update orders to "on_way" or "delivered" status');
            }
            
            // Delivery cannot cancel orders
            if (body.status === OrderStatus.canceled) {
                throw new BadRequestException('Delivery personnel cannot cancel orders');
            }
        }

        // Update order status
        const updateData: any = {
            status: body.status,
            updatedBy: admin._id
        };

        if (body.status === OrderStatus.canceled && body.rejectedReason) {
            updateData.rejectedReason = body.rejectedReason;
            
            // Refund if order was paid
            if (order.paymentMethod === IPaymentMethod.card && order.status === OrderStatus.placed) {
                updateData.refundAmount = order.finalPrice;
                updateData.refundDate = new Date();
                await this.stripeService.refund(order.intent as string);
            }

            // Restore product stock
            for (const product of order.products) {
                await this.productRepository.updateOne(
                    { _id: product.productId },
                    { $inc: { stock: product.quantity } }
                );
            }
        }

        await this.orderRepository.updateOne({ _id: orderId }, updateData);

        return { 
            success: true, 
            message: `Order status updated to ${body.status}`,
            data: { orderId, newStatus: body.status }
        };
    }

    async getOrderStats() {
        const stats = await this.orderRepository.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$finalPrice" }
                }
            }
        ]);

        const totalOrders = await this.orderRepository.countDocuments();
        const totalRevenue = await this.orderRepository.aggregate([
            { $match: { status: { $in: [OrderStatus.placed, OrderStatus.onWay, OrderStatus.delivered] } } },
            { $group: { _id: null, total: { $sum: "$finalPrice" } } }
        ]);

        return {
            success: true,
            data: {
                stats,
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0
            }
        };
    }
}
import { BadRequestException, Body, Injectable, NotFoundException } from "@nestjs/common";
import { CartRepository } from "src/DB/models/Cart/cart.repository";
import { addToCartDTO, removeItemToCartDTO } from "./dto";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { TUser } from "src/DB/models/User/user.schema";

@Injectable()
export class CartService {
    constructor(private readonly cartRepository: CartRepository, private readonly productRepository: ProductRepository) { }
    async addToCart(user: TUser, body: addToCartDTO) {
        const product = await this.productRepository.findById(body.productId)
        if (!product)
            throw new NotFoundException("In-Valid-product-id")
        if (product.stock <= body.quantity)
            throw new BadRequestException("Out of stock")
        const cart = await this.cartRepository.findOne({ createdBy: user._id })
        if (!cart) {
            await this.cartRepository.create({ products: [body], createdBy: user._id })
            return { success: true }
        }
        let match = false
        for (const [index, product] of cart?.products.entries()) {
            if (product.productId.toString() === body.productId.toString()) {
                product.quantity = body.quantity
                match = true
                break;
            }
        }
        if (!match) {
            cart.products.push(body)
        }
        await cart.save()
        return { success: true }
    }
    async removeItemToCart(user: TUser, body: removeItemToCartDTO) {
        await this.cartRepository.updateOne({ createdBy: user._id },
            {
                $pull: {
                    products: {
                        productId: {
                            $in: body.productsIds
                        }
                    }
                }
            });
        return { success: true }

    }
    async clearCart(user: TUser) {
        await this.cartRepository.updateOne({ createdBy: user._id }, { products: [] })
        return { success: true }
    }
    async getCart(user: TUser) {
        const cart = await this.cartRepository.findOne({ createdBy: user._id }, {}, { populate: [{ path: "products.productId" }] })
        return { success: true, data: cart }
    }
}
import * as z from "zod";
import { getJson } from "serpapi";
import { tool } from "@langchain/core/tools";

type ProductFromAPI = {
    product_id: string;
    title: string;
    extracted_price: string;
    description: string;
    rating: number;
    thumbnail: string;
    product_link: string;
};

type Product = {
    id: string;
    title: string;
    price: string;
    description: string;
    rating: number;
    thumbnail: string;
    product_link: string;
};

export const productTool = tool(
    async ({ query, location = "Pakistan" }) => {
        try {
            console.log("query:", query);   
            console.log("Location:", location);

            // search products on the internet.
            const response = await getJson({
                engine: "google_shopping",
                q: query,
                location: location,
                api_key: process.env.SERP_API_KEY,
            });

            if (    
                !response.shopping_results ||
                response.shopping_results.length === 0
            ) {
                return {
                    query,
                    products: [],
                };
            }

            const products = response.shopping_results
                .slice(0, 6)
                .map(
                    (
                        product: ProductFromAPI,
                        index: number,
                    ): Product => {
                        return {
                            id: product.product_id || String(index),
                            title: product.title,
                            description: product.description,
                            price: product.extracted_price,
                            rating: product.rating,
                            thumbnail: product.thumbnail,
                            product_link:
                                product.product_link +
                                "&utm_source=codersgpt.com",
                        };
                    },
                );

            return {
                query,
                products,
            };
        } catch (err) {
            console.error(
                "Error fetching the google shopping products",
                err,
            );
            return {
                query,
                products: [],
            };
        }
    },
    {
        name: "display_products",
        description:
            "Search for real e-commerce products and display a carousel of prices and details. Always call this tool whenever user searches for any kind of product.",
        schema: z.object({
            query: z
                .string()
                .describe(
                    "The product to search for. e.g., iPhone 17, Macbook Pro",
                ),
            location: z
                .string()
                .optional()
                .describe(
                    "The location of the user for query search. Include this field only if user asks it explicitely e.g., `India`",
                ),
        }),
    },
);

export const tools = [productTool];
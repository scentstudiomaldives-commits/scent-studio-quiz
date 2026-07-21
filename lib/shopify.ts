import type { ShopifyProduct } from "@/types";

/**
 * Shopify STOREFRONT API client only.
 * NEVER import/use the Admin API token here — this file's output can end up in
 * client bundles. The Storefront token (NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN)
 * is designed to be public and is scoped to read-only storefront data.
 */

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!; // e.g. scent-studio-mv.myshopify.com
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;
const API_VERSION = "2024-07";

const ENDPOINT = `https://${DOMAIN}/api/${API_VERSION}/graphql.json`;

async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    // Product catalog changes infrequently; cache at the edge for 5 min.
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Shopify Storefront API error: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}

const PRODUCT_FIELDS = `
  id
  handle
  title
  vendor
  descriptionHtml
  tags
  featuredImage { url altText }
  priceRange { minVariantPrice { amount currencyCode } }
  totalInventory
  availableForSale
  variants(first: 1) {
    edges { node { id availableForSale } }
  }
`;

interface ProductsQueryResult {
  products: {
    edges: Array<{ node: any }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

function mapNode(node: any): ShopifyProduct {
  const variant = node.variants?.edges?.[0]?.node;
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    vendor: node.vendor,
    descriptionHtml: node.descriptionHtml,
    productUrl: `https://${DOMAIN.replace(".myshopify.com", "")}.com/products/${node.handle}`,
    featuredImage: node.featuredImage,
    priceRange: node.priceRange,
    tags: node.tags ?? [],
    variantId: variant?.id ?? "",
    availableForSale: node.availableForSale,
    totalInventory: node.totalInventory ?? null,
  };
}

/** Fetch every product in the store, paginating through the Storefront API. */
export async function fetchAllProducts(): Promise<ShopifyProduct[]> {
  const all: ShopifyProduct[] = [];
  let cursor: string | null = null;
  let hasNext = true;

  while (hasNext) {
    const query = `
      query Products($cursor: String) {
        products(first: 100, after: $cursor) {
          edges { node { ${PRODUCT_FIELDS} } }
          pageInfo { hasNextPage endCursor }
        }
      }
    `;
    const data: ProductsQueryResult = await shopifyFetch<ProductsQueryResult>(query, { cursor });
    all.push(...data.products.edges.map((e) => mapNode(e.node)));
    hasNext = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }

  return all;
}

/** Search products by title (used for "Find Something Similar" autocomplete). */
export async function searchProductsByTitle(term: string): Promise<ShopifyProduct[]> {
  const query = `
    query Search($term: String!) {
      products(first: 10, query: $term) {
        edges { node { ${PRODUCT_FIELDS} } }
      }
    }
  `;
  const data = await shopifyFetch<ProductsQueryResult>(query, { term: `title:*${term}*` });
  return data.products.edges.map((e) => mapNode(e.node));
}

/** Create a Storefront cart and return the checkout URL, for "Add to Cart". */
export async function addToCart(variantId: string, quantity = 1): Promise<string> {
  const mutation = `
    mutation CartCreate($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { id checkoutUrl }
        userErrors { field message }
      }
    }
  `;
  const data = await shopifyFetch<{
    cartCreate: { cart: { checkoutUrl: string } | null; userErrors: Array<{ message: string }> };
  }>(mutation, { lines: [{ merchandiseId: variantId, quantity }] });

  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(data.cartCreate.userErrors.map((e) => e.message).join(", "));
  }
  if (!data.cartCreate.cart) throw new Error("Failed to create cart");
  return data.cartCreate.cart.checkoutUrl;
}

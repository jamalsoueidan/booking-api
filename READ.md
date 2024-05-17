//duplicate product

mutation MyMutation($id: ID!) {
productDuplicate(newTitle: "test", productId: $id) {
newProduct {
id
title
variants(first: 5) {
nodes {
id
title
}
}
}
}
}

{
"data": {
"productDuplicate": {
"newProduct": {
"id": "gid://shopify/Product/9186772386119",
"title": "Hårtykkelse",
"variants": {
"nodes": [
{
"id": "gid://shopify/ProductVariant/49475617128775",
"title": "Tyk"
},
{
"id": "gid://shopify/ProductVariant/49475617259847",
"title": "Normal"
},
{
"id": "gid://shopify/ProductVariant/49475617358151",
"title": "Meget tyk"
}
]
}
}
}
},
"extensions": {
"cost": {
"requestedQueryCost": 15,
"actualQueryCost": 14,
"throttleStatus": {
"maximumAvailable": 2000,
"currentlyAvailable": 1986,
"restoreRate": 100
}
}
}
}

/_mutation MyMutation($id: ID!, $variants: [ProductVariantsBulkInput!] = [{id: "gid://shopify/ProductVariant/49475617128775", price: "12"}, {id: "gid://shopify/ProductVariant/49475617259847", price: "50"}]) {
productVariantsBulkUpdate(productId: $id, variants: $variants) {
product {
createdAt
}
}
}
_/
// update variants
mutation MyMutation($id: ID!) {
productVariantsBulkUpdate(
productId: $id
variants: [{id: "gid://shopify/ProductVariant/49475617128775", price: "12"}, {id: "gid://shopify/ProductVariant/49475617259847", price: "50"}]
) {
productVariants {
id
price
title
}
}
}

{
"data": {
"productVariantsBulkUpdate": {
"productVariants": [
{
"id": "gid://shopify/ProductVariant/49475617128775",
"price": "12.00",
"title": "Tyk"
},
{
"id": "gid://shopify/ProductVariant/49475617259847",
"price": "50.00",
"title": "Normal"
}
]
}
},
"extensions": {
"cost": {
"requestedQueryCost": 10,
"actualQueryCost": 10,
"throttleStatus": {
"maximumAvailable": 2000,
"currentlyAvailable": 1990,
"restoreRate": 100
}
}
}
}

// add tags
mutation MyMutation2($id: ID!) {
tagsAdd(id: "gid://shopify/Product/9181032284487", tags: "ahmad") {
node {
id
}
}
}

// update with metafield
mutation MyMutation($id: ID!) {
productVariantsBulkUpdate(
productId: $id
variants: [{id: "gid://shopify/ProductVariant/49475617358151", metafields: {id: "gid://shopify/Metafield/44306544034119", namespace: "booking", key: "duration", type: "number_integer", value: "66"}}]
) {
product {
id
variants(first: 5) {
nodes {
id
price
metafield(key: "duration", namespace: "booking") {
id
type
value
}
}
}
}
}
}

// delete product
mutation MyMutation($id: ID!) {
productDeleteAsync(productId: $id) {
job {
done
id
}
}
}

{
"data": {
"product": {
"variants": {
"nodes": [
{
"id": "gid://shopify/ProductVariant/49475617128775",
"price": "12.00",
"metafields": {
"nodes": [
{
"id": "gid://shopify/Metafield/44306316788039",
"key": "duration",
"namespace": "booking",
"type": "number_integer",
"value": "67"
}
]
}
},
{
"id": "gid://shopify/ProductVariant/49475617259847",
"price": "50.00",
"metafields": {
"nodes": []
}
},
{
"id": "gid://shopify/ProductVariant/49475617358151",
"price": "440.00",
"metafields": {
"nodes": []
}
}
]
}
}
},
"extensions": {
"cost": {
"requestedQueryCost": 31,
"actualQueryCost": 9,
"throttleStatus": {
"maximumAvailable": 2000,
"currentlyAvailable": 1991,
"restoreRate": 100
}
}
}
}

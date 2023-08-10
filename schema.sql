DROP TABLE IF EXISTS favProducts;

CREATE TABLE IF NOT EXISTS favProducts (
    goods_id SERIAL PRIMARY KEY,
    goods_img VARCHAR(255),
    goods_name VARCHAR(255),
    amountWithSymbol VARCHAR(255)
);
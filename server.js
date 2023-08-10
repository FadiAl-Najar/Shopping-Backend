"Use Strict";

const express = require("express");
const server = express();
const cors = require("cors");
const pg = require("pg");
const axios = require("axios");
server.use(cors());
require("dotenv").config();
server.use(express.json());
server.use(errorHandler);

const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);

server.get("/", homeHandler);
server.get("/getAllProduct", getProducts);
server.get("/getFavProducts", getFavProducts);
server.post("/addFavProduct", addFavProduct);
server.delete("/deleteFavProduct/:id", deleteFavProduct);
server.get("*", defaultRoute);

function homeHandler(req, res) {
  res.status(200).send("Hello from the home route");
}

function getProducts(req, res) {
    const API_URL =
      "https://unofficial-shein.p.rapidapi.com/products/list?cat_id=1981&adp=10170797&language=en&country=US&currency=USD&sort=7&limit=20&page=1";
    const options = {
      headers: {
        "X-RapidAPI-Key": process.env.KEY_API,
        "X-RapidAPI-Host": process.env.HOST_API,
      },
    };
    try {
      axios
        .get(API_URL, options)
        .then((response) => {
          let mapShop = response.data.info.products.map((item) => {
            const shop = new Shop(
              item.goods_id,
              item.goods_img,
              item.goods_name,
              item.retailPrice.amountWithSymbol
            );
            return shop;
          });
          res.status(200).send(mapShop);
        })
        .catch((error) => {
          res.status(500).send(error);
        });
    } catch (error) {
      errorHandler(error, req, res);
    }
  }
  
function addFavProduct(req, res) {
    const favProduct = req.body;
    console.log(req.body);
    const sql = `INSERT INTO favProducts (goods_id, goods_img, goods_name, amountWithSymbol)
    VALUES ($1, $2, $3, $4);`
    const values = [favProduct.goods_id, favProduct.goods_img, favProduct.goods_name, favProduct.amountWithSymbol];

    client.query(sql, values)
        .then((response)=> {
            res.status(200).send('Your fav product has been added');
        }).catch (error => {
            console.log(error);
            res.send(error);
        });
}

function getFavProducts(req,res){
    const sql = `SELECT * FROM favproducts;`

    client.query(sql)
        .then((response)=>{
            res.send(response.rows)
        })
        .catch(error => {
            res.send(error)
        })
}

function defaultRoute(req, res) {
  res.status(404).send("default route");
}

function deleteFavProduct(req,res){
    const id = req.params.id;
    const sql = `DELETE FROM favproducts WHERE goods_id =${id}`;

    client.query(sql)
        .then((response)=>{
            res.send("The fav product has been deleted");
        })
        .catch(error => {
            res.send(error)
        })

}

function errorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  }

function Shop(goods_id, goods_img, goods_name, amountWithSymbol) {
  this.goods_id = goods_id,
    this.goods_img = goods_img,
    this.goods_name = goods_name,
    this.amountWithSymbol = amountWithSymbol;
}

client.connect().then(() => {
  server.listen(PORT, () => {
    console.log(`Listening on ${PORT}: I’m ready`);
  });
});

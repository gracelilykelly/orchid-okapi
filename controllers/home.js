"use strict";
const cheerio = require("cheerio");
const axios = require("axios");
const trackingStore = require("../models/trackings-store.js");
const comms = require("../utils/comms.js");

const home = {
  index(request, response) {
    const trackings = trackingStore.getAll();
    const productsToNotify = [];
    const sizesAvailable = [];
    trackings.map((tracking) => {
      if (tracking.email) {
        // loop through products to be tracked
        tracking.products.map((productToTrack) => {
          if (!productToTrack.notified) {
            // scrape
            axios
              .get(productToTrack.url)
              .then((res) => {
                const $ = cheerio.load(res.data);
                const productName = $("h1").text();

                // loop through options
                const options = $("option");
                options.each((i, el) => {
                  const sku = $(el).attr("data-sku");
                  const quantity = $(el).attr("data-qty");
                  //check for sizes
                  if ("sizesToTrack" in productToTrack) {
                    const size = $(el).attr("data-sku").split("-").slice(-1)[0];
                    if (productToTrack.sizesToTrack.includes(size)) {
                      console.log(`Size: ${size}, Quantity: ${quantity}`);
                      if (
                        quantity &&
                        !productsToNotify.find(
                          (p) => p.url === productToTrack.url
                        )
                      ) {
                        sizesAvailable.push(size);
                        productsToNotify.push(productToTrack);
                      }
                    }
                  } else {
                    console.log(`SKU: ${sku}, Quantity: ${quantity}`);
                    if (quantity) {
                      productsToNotify.push(productToTrack);
                    }
                  }
                });
                // email user
                if (productsToNotify.length) {
                  productsToNotify.map((productToNotify) => {
                    let message = `${productName} is in stock!!\nurl: ${productToNotify.url}`;
                    if (sizesAvailable.length) {
                      message += `\nSizes Available: ${sizesAvailable}`;
                    }
                    // send comms
                    comms.sendComms(tracking.email, message);
                    // set notified to true
                    trackingStore.setNotified(tracking.email, productToNotify);
                  });
                }
              })
              .catch((error) => {
                console.log("error", error);
              });
          }
        });
      }
    });

    const contextData = {
      pageTitle: "Stock Checker",
    };

    response.render("home", contextData);
  },
};

module.exports = home;

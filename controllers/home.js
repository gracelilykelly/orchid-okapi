"use strict";
const cheerio = require("cheerio");
const axios = require("axios");
const trackingStore = require("../models/trackings-store.js");
const comms = require("../utils/comms.js");

const home = {
  index(request, response) {
    const trackings = trackingStore.getAll();
    const productsToNotify = [];
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
                const returnedProduct = {...productToTrack}
                returnedProduct.name = $("h1").text();
                returnedProduct.sizesAvailable = []
                // loop through options
                const options = $("option");
                options.each((i, el) => {
                  const sku = $(el).attr("data-sku");
                  const quantity = $(el).attr("data-qty");

                  //check if wanted size(s) available
                  if ("sizesToTrack" in productToTrack) {
                    const size = sku.split("-").slice(-1)[0];
                    if (productToTrack.sizesToTrack.includes(size)) {
                      console.log(`SKU: ${sku}, Size: ${size}, Quantity: ${quantity}`);
                      if (quantity) {
                        returnedProduct.sizesAvailable.push(size);
                        // add product to be notified if not already in list
                        if (!productsToNotify.find(
                          (p) => p.url === returnedProduct.url
                        )) {
                          productsToNotify.push(returnedProduct);
                        }
                      }
                    }
                  } else {
                    // not a clothing item
                    console.log(`SKU: ${sku}, Quantity: ${quantity}`);
                    if (quantity) {
                      productsToNotify.push(returnedProduct);
                    }
                  }
                });
                // send comms to user
                if (productsToNotify.length) {
                  // send comms for each product
                  let message = "The following products are back in stock:\n"
                  productsToNotify.map((productToNotify) => {
                    message += `\n${productToNotify.name}\n${productToNotify.url}\n`;
                    if (productToNotify.sizesAvailable?.length) {
                      message += `Size(s) Available: ${productToNotify.sizesAvailable}\n`;
                    }
                  });
                  // send comms
                  comms.sendComms(tracking.email, message);
                  //set notified to true
                  productsToNotify.map((productToNotify) => {
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

"use strict";

const _ = require("lodash");
const JsonStore = require("./json-store");

const trackingStore = {
  store: new JsonStore("./models/trackings-store.json", { trackings: [] }),
  collection: "trackings",

  getAll() {
    return this.store.findAllBy(this.collection);
  },

  getByEmail(email) {
    return this.store.findOneBy(this.collection, { email: email });
  },

  setNotified(email, productToUpdate){
    const tracking = this.getByEmail(email);
    const product = tracking.products.find((product) => product.url === productToUpdate.url)
    product.notified = true;
    this.store.save();
  }
};

module.exports = trackingStore;

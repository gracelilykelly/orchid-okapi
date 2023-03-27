# Stock Checker

Makes a request to specified product urls to check if item is in stock.

Add products you wish to track along with your email address to `trackings-store.json`.

If item is clothing, add required sizes to `sizesToTrack`. If quantity is found an
email is sent via [mailgun](https://www.mailgun.com/).

The product's `notified` will then be set to true and stock will not be checked again until 
set back to false.

Needs following env vars:

```
MAILGUN_DOMAIN
MAILGUN_SMTP_PASS
MAILGUN_API_KEY
```
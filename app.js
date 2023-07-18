const express = require("express")
const puppeteer = require('puppeteer')

const dotenv = require('dotenv').config()

const app = express()
const PORT = process.env.PORT
const NBC_WEBSITE = process.env.NBC_WEBSITE

app.get('/', (req, res) => {
    res.send('NBC Exchange Rate');
});

app.get('/nbc-exchange-rate', (req, res) => {
    const date = req.query.date ?? '';
    console.log(date);
    scrape(date).then(function(data) {
        res.setHeader('Content-Type', 'text/plain');
        res.send(data);
    })
    .catch(function (e) {
        res.status(500, {
            error: e
        });
    });
});

app.listen(PORT, function () {
    console.log(`app listening on port ${PORT}!`);
});

async function scrape(date) {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({headless: 'new'});
    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto(NBC_WEBSITE);

    await page.focus('#datepicker');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(date);
    await page.click('input[type="submit"]');

    let data = await page.evaluate(() => {
        let date = document.querySelector("#fm-ex > table > tbody > tr:nth-child(1) > td > font").innerText
        let rate = document.querySelector("#fm-ex > table > tbody > tr:nth-child(2) > td > font").innerText
        return {exchange_date: date, exchange_rate: rate};
    });
    await browser.close();
    return data;
}
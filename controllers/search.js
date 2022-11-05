const puppeteer = require('puppeteer');
const fs = require('fs');
var {validate} = require('vin-validator');

const vin = '3TMCZ5AN2NM532235'

const searchGurusByVin = async (req, res, next) => {
    const { VIN, ZIP, PRICE } = req.query;
    const URL = `https://www.cargurus.com/Cars/instantMarketValueFromVIN.action?startUrl=%2FCars%2FinstantMarketValueFromVIN.action&++++++++carDescription.vin%0D%0A=${VIN}`
    console.log('getting car at ' + URL)
    
    const isValidVIN = validate(VIN);
    if (!isValidVIN) {
        return res.status(400).json({ message: 'Invalid VIN' });
    }
    try{
        const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: true});
        let page = await browser.newPage()
        // send an HTTP error back on page error
        page.on('pageerror', err => {
            console.log('Page error: ' + err.toString());
            throw new Error(err);asddsf
        });
        page.on('error', err => {
            console.log('Page error: ' + err.toString());
            throw new Error(err);
        });
        await page.goto(URL)
        await page.waitForSelector('#buyerZip')
        page.evaluate( () => {
            document.getElementById("buyerZip").value = ''
        })
        await page.type('#buyerZip', ZIP)
        await page.click('#instantMarketValueFromZip_0')
        await page.waitForSelector('.cg-priceCheckVerticalScale-over p span')
        await page.waitForSelector('#pcc-renderSimilarListings')
        const prices = await page.evaluate(() => {
            const zip = document.querySelector('#buyerZip').value
            const greatPrice = document.querySelector('.cg-priceCheckVerticalScale-great p span').innerText;
            const goodPrice = document.querySelector('.cg-priceCheckVerticalScale-good p span').innerText;
            const fairPrice = document.querySelector('.cg-priceCheckVerticalScale-fair p span').innerText;
            const highPrice = document.querySelector('.cg-priceCheckVerticalScale-poor p span').innerText;
            const overPrice = document.querySelector('.cg-priceCheckVerticalScale-over p span').innerText;
            const IMV = document.getElementById('instantMarketValuePrice').innerText;
            return {
                zip,
                IMV,
                greatPrice,
                goodPrice,
                fairPrice,
                highPrice,
                overPrice,
                location: document.querySelector('#pcc-renderSimilarListings div div')?.innerText?.split('Near')[1]?.trim().replace('\\n', '') || 'N/A',
                vehicle_name: document.querySelector('.cg-listing-body h4 a')?.innerText || 'Error',
            };
        });

        await browser.close()
        res.status(200).send({VIN, ...prices, PRICE });
    }catch(err){
        console.log('errorr', err)
        res.status(500).send(err);
    }
}

module.exports={
    searchGurusByVin
}
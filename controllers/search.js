const puppeteer = require('puppeteer');
const fs = require('fs');
var {validate} = require('vin-validator');
const axios = require('axios');
const nhtsa = require('nhtsa');

const searchGurusByVin = async (req, res, next) => {
    const { VIN, ZIP, PRICE } = req.query;
    const URL = `https://www.cargurus.com/Cars/instantMarketValueFromVIN.action?startUrl=%2FCars%2FinstantMarketValueFromVIN.action&++++++++carDescription.vin%0D%0A=${VIN}`
    console.log('getting car at ' + URL)
    
    const isValidVIN = validate(VIN);
    if (!isValidVIN) {
        return res.status(400).json({ message: 'Invalid VIN' });
    }
    try{
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--incognito',
                '--single-process',
                '--no-zygote',
                '--no-sandbox', 
                '--disable-setuid-sandbox'
            ],
            defaultViewport: null,
        });
        let page = await browser.newPage()
        // send an HTTP error back on page error
        page.on('pageerror', err => {
            console.log('Page error: ' + err.toString());
            throw new Error(err);
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
            const greatPrice = document.querySelector('.cg-priceCheckVerticalScale-great p span')?.innerText || null;
            const goodPrice = document.querySelector('.cg-priceCheckVerticalScale-good p span')?.innerText || null;
            const fairPrice = document.querySelector('.cg-priceCheckVerticalScale-fair p span')?.innerText || null;
            const highPrice = document.querySelector('.cg-priceCheckVerticalScale-poor p span')?.innerText || null;
            const overPrice = document.querySelector('.cg-priceCheckVerticalScale-over p span')?.innerText || null;
            const IMV = document.getElementById('instantMarketValuePrice').innerText || null;
            return {
                zip,
                IMV,
                greatPrice,
                goodPrice,
                fairPrice,
                highPrice,
                overPrice,
            };
        });

        const { data } = await nhtsa.decodeVin(VIN);

        const vehicleDetails = {
            make: data.Results.find(e => e.VariableId === 26).Value || '',
            model: data.Results.find(e => e.VariableId === 28).Value || '',
            year: data.Results.find(e => e.VariableId === 29).Value || '',
            trim_level: data.Results.find(e => e.VariableId === 38).Value || '',
        }
        
        await browser.close()
        res.status(200).send({VIN, ...prices, PRICE, vehicleDetails });
    }catch(err){
        console.log('errorr', err)
        res.status(500).send(err);
    }
}

module.exports={
    searchGurusByVin
}
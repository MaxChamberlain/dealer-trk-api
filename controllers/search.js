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
    try{
        let page = await browser.newPage()
        // send an HTTP error back on page error
        page.on('pageerror', err => {
            console.log('Page error: ' + err.toString());
            browser.close()
        });
        page.on('error', err => {
            console.log('JavaScript error: ' + err.toString());
            browser.close()
        });
        await page.goto(URL)
        await page.waitForSelector('#buyerZip')
        page.evaluate( () => {
            document.getElementById("buyerZip").value = ''
        })
        await page.type('#buyerZip', ZIP)
        await page.click('#instantMarketValueFromZip_0')
        await page.waitForNetworkIdle()
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
        res.status(200).send({VIN, ...prices, PRICE,});
    }catch(err){
        console.log('errorr', err)
        res.status(500).send(err);
    } finally{
        console.log('done')
        await browser.close()
    }
}

const getVDetails = async (req, res, next) => {
    const { VIN } = req.query;
    try{
        const { data } = await nhtsa.decodeVin(VIN);
        const vehicleDetails = {
            make: data.Results.find(e => e.VariableId === 26).Value || '',
            model: data.Results.find(e => e.VariableId === 28).Value || '',
            year: data.Results.find(e => e.VariableId === 29).Value || '',
            trim_level: data.Results.find(e => e.VariableId === 38).Value || '',
        }
        res.status(200).send(vehicleDetails);
    }catch(e){
        console.log(e)
        res.status(500).send(e);
    }
}

module.exports={
    searchGurusByVin,
    getVDetails
}
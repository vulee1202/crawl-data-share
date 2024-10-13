import { createRequire } from "module";
import { readFile, writeFile, downloadFile, createFolder } from "./file.js";
const require = createRequire(import.meta.url);

const cheerio = require("cheerio");
const request = require("request-promise");

var datas = {};
const primarySite = "https://kingcarcare.vn";
const sites = [
    "https://kingcarcare.vn/collections/wolver-lab-gmbh",
    "https://kingcarcare.vn/collections/tham-lot-san",
    "https://kingcarcare.vn/collections/phu-kien-oto-da-qua-su-dung",
    "https://kingcarcare.vn/collections/mat-ca-lang",
    "https://kingcarcare.vn/collections/noi-that-mercedes",
    "https://kingcarcare.vn/collections/android-box",
    "https://kingcarcare.vn/collections/deatailing",
];

const main = () => {
    for (const site of sites) {
        fetchSite(site);
    }
};

const fetchSite = (site, isDetail, index, fileName) => {
    request(site, (error, response, html) => {
        if (!error && response.statusCode == 200) {
            if (isDetail) fetchDetailSite(html, index, fileName);
            else fetchOverViewSite(site, html);
        } else {
            console.log(error);
        }
    });
};

function fetchOverViewSite(site, html) {
    const $ = cheerio.load(html);

    const fileName = site.substring(site.lastIndexOf("/") + 1);
    const objName = fileName.replace("-", "").replace("/");
    datas[objName] = [];
    createFolder(objName);

    $(".product-block").each((index, el) => {
        const aProduct = $(el).find(".product-detail > .pro-name a")[0];
        const proName = aProduct.attribs["title"];
        const proHref = aProduct.attribs["href"];
        const price = $(el).find(".box-pro-prices > .pro-price span").text();

        var image = { externals: [], internals: [] };
        $(el)
            .find(`.product-img > a > picture > source`)
            .each((i, src) => {
                const imgURL = `https:${src.attribs["data-srcset"]}`;
                image.externals.push(imgURL);
            });

        for (const external of image.externals) {
            image.internals.push(downloadFile(objName, external));
        }

        datas[objName].unshift({
            proName: proName.trim(),
            proHref: primarySite + proHref.trim(),
            price: price.trim(),
            image: image,
        });
    });

    datas[objName].forEach((data, index) => {
        fetchSite(data.proHref, true, index, fileName);
    });
}

function fetchDetailSite(html, index, fileName) {
    const $ = cheerio.load(html);
    const objName = fileName.replace("-", "");
    const meta = $(":root > head > meta[property*='og:']").toString();
    const description = $(".more-description").html();

    var data = datas[objName][index];
    data.meta = meta;
    data.description = description;
    datas[objName][index] = data;

    writeFile(objName, fileName, datas[objName]);
}

main();

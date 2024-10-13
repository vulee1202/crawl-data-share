import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require("fs"); // require thêm module filesystem
const request = require("request");
const downloader = require("image-downloader");

export async function readFile(objName, filename) {
    try {
        const dataStr = await fs.readFile(
            `${getJsonPath(objName)}${filename}.json`,
            "utf8"
        );
        const data = JSON.parse(dataStr);
    } catch (err) {
        // console.log("🚀 ~ readFile ~ err:", err);
    }
}

export async function writeFile(objName, filename, data) {
    try {
        await fs.writeFile(
            `${getJsonPath(objName)}${filename}.json`,
            JSON.stringify(data, null, 4),
            function (err) {
                if (err) throw err;
            }
        );
    } catch (err) {
        console.log("🚀 ~ writeFile ~ err:", err);
    }
}

export function createFolder(objName) {
    if (!fs.existsSync(getFilesPath(objName))) {
        fs.mkdirSync(getFilesPath(objName));
    }
    if (!fs.existsSync(getImagePath(objName))) {
        fs.mkdirSync(getImagePath(objName));
    }
    if (!fs.existsSync(getJsonPath(objName))) {
        fs.mkdirSync(getJsonPath(objName));
    }
}

export function downloadFile(objName, url) {
    const fileName = getFileName(objName, url);

    const options = {
        url: url,
        dest: fileName,
    };

    downloader.image(options).catch((err) => console.error(err));
    return fileName;
}

const getFilesPath = (objName) => {
    return `files/${objName}`;
};

const getImagePath = (objName) => {
    return `${getFilesPath(objName)}/images/`;
};

const getJsonPath = (objName) => {
    return `${getFilesPath(objName)}/json/`;
};

const getFileName = (objName, url) => {
    return `../../files/${objName}/images/${url.substring(
        url.lastIndexOf("/") + 1
    )}`;
};

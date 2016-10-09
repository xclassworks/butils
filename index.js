'use strict';

const BMATE_HOME = process.env.BMATE_HOME;

// Imported modules
const fs = require('fs');

function checkSSLCertificate() {
    checkBmateHome();

    const certFolder = `${BMATE_HOME}/SSLCertificate`;

    // Check SSLCertificate folder
    if (!pathExists(certFolder))
        spawnError(`Impossible to access the folder ${certFolder}. Be sure that this folder exists`);

    // Check if the key.pem file exists
    if (!pathExists(`${certFolder}/key.pem`)) {
        spawnError(`The ${certFolder}/key.pem file does not exists`);
    }

    // Check if the key.pem file exists
    if (!pathExists(`${certFolder}/cert.pem`)) {
        spawnError(`The ${certFolder}/cert.pem file does not exists`);
    }
}

function getKey() {
    return fs.readFileSync(`${BMATE_HOME}/SSLCertificate/key.pem`);
}

function getCert() {
    fs.readFileSync(`${BMATE_HOME}/SSLCertificate/cert.pem`);
}

function checkBmateHome() {

    if (!bmateHomeExists())
        spawnError(`The BMATE_HOME enviroment variable is not defined. Is not possible get the properly
configs for the server`);
}

function getBmateConfigs() {
    checkBmateHome();

    const configsPath = `${BMATE_HOME}/bconfig/configs.json`;

    if (!pathExists(configsPath)) {
        spawnError(`The configs file for bmate does not exists. ${configsPath}`);
    }

    return require(configsPath);
}

function bmateHomeExists() {
    if (BMATE_HOME)
        return true;

    return false;
}

function spawnError(msg) {
    throw new Error(msg);
}

function pathExists(path) {

    try {
        fs.accessSync(path, fs.F_OK);

        return true;
    } catch (err) {
        return false;
    }
}

function getServer() {
    const bConfigs = getBmateConfigs();

    if (bConfigs.useSecureServer) {
        console.log('Using secure server HTTPS');

        const options = {
            key:            getKey(),
            cert:           getCert(),
            NPNProtocols:   ['https/2.0', 'http/1.1', 'sdpy', 'http/1.0']
        };

        return require('https').createServer(options);
    } else {
        console.log('Using HTTP');

        return require('http').createServer();
    }
}

module.exports = {
    checkBmateHome:         checkBmateHome,
    getBmateConfigs:        getBmateConfigs,
    bmateHomeExists:        bmateHomeExists,
    getServer:              getServer,
    pathExists:             pathExists,
    spawnError:             spawnError,

    SSL:                    {
        checkSSLCertificate:    checkSSLCertificate,
        getKey:                 getKey,
        getCert:                getCert
    }
};

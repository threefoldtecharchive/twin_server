var url = require('url');
var express = require('express');
var router = express.Router();
var config = require('../../config')

const asyncHandler = require('express-async-handler')

var threebot = require('@threefoldjimber/threefold_login');
const {
    updatePublicKey,
    updatePrivateKey,
    yggdrasilIsInitialized,
    setupYggdrasil,
    getKeyPair
} = require("@threefoldjimber/digitaltwin-backend")


router.get('/threebot/connect', asyncHandler(async (req, res) => {
    var next = req.query.next
    const threeFoldAPIHost = 'https://login.threefold.me/';
    const appId = req.headers.host
    var redirectUrl = '/threebot/authorize';

    if (next) {
        redirectUrl = redirectUrl + `?next=${next}`
    }

    const login = new threebot.ThreefoldLogin(threeFoldAPIHost,
        appId,
        config.threebot.passPhrase,
        redirectUrl);
    await login.init();
    const state = threebot.generateRandomString();
    req.session.state = state
    req.session.save()
    const loginUrl = login.generateLoginUrl(state, {scope: '{"email":true,"derivedSeed":true}'});
    res.redirect(loginUrl)

}))

router.get('/threebot/authorize', asyncHandler(async (req, res) => {
    var state = req.session.state
    const threeFoldAPIHost = 'https://login.threefold.me/';
    const appId = req.headers.host;
    const redirectUrl = '/threebot/authorize';
    var next = req.query.next ? req.query.next : '/'

    const login = new threebot.ThreefoldLogin(threeFoldAPIHost,
        appId,
        config.threebot.passPhrase,
        redirectUrl);

    var uri = req.protocol + '://' + req.get('host') + req.originalUrl;
    try {
        const profileData = await login.parseAndValidateRedirectUrl(new url.URL(uri), state)
        req.session.authorized = true
        req.session.authorization_mechanism = '3bot'
        req.session.user = profileData
        req.user = profileData
        req.session.userId = profileData.profile.doubleName.replace('.3bot', '')
        var derivedSeed = profileData.profile.derivedSeed

        const keyPair = getKeyPair(derivedSeed);
        if (!keyPair) return res.status(403)
        try {
            updatePublicKey(keyPair.publicKey);
            updatePrivateKey(keyPair.secretKey);
        } catch (ex) {
            console.error(ex);
            return res.status(403)
        }

        if (!yggdrasilIsInitialized)
            setupYggdrasil(derivedSeed)

        req.session.save()
        res.redirect(next)
    } catch (e) {
        console.log(e)
        return res.status(403).json(e)
    }

}))

module.exports = router

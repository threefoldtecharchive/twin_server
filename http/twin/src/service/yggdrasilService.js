"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupYggdrasil = exports.initYggdrasil = exports.isInitialized = void 0;
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const encryptionService_1 = require("./encryptionService");
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config/config");
const configPath = path_1.default.join(config_1.config.baseDir, 'yggdrasil.conf');
const jsonPath = path_1.default.join(config_1.config.baseDir, 'user', 'yggdrasil.json');
exports.isInitialized = false;
const replaceValues = (generatedConfig, replaceConfig) => {
    let cfg = generatedConfig;
    cfg = cfg.replace(/EncryptionPublicKey: .*$/mg, `EncryptionPublicKey: ${replaceConfig.encryptionPublicKey}`);
    cfg = cfg.replace(/EncryptionPrivateKey: .*$/mg, `EncryptionPrivateKey: ${replaceConfig.encryptionPrivateKey}`);
    cfg = cfg.replace(/SigningPublicKey: .*$/mg, `SigningPublicKey: ${replaceConfig.signingPublicKey}`);
    cfg = cfg.replace(/SigningPrivateKey: .*$/mg, `SigningPrivateKey: ${replaceConfig.signingPrivateKey}`);
    cfg = cfg.replace(/Peers: \[]/mg, `Peers: ${config_1.config.yggdrasil.peers.length === 0 ? "[]" : `["${config_1.config.yggdrasil.peers.join('","')}"]`}`);
    return cfg;
};
const generateConfig = () => {
    return child_process_1.execSync('yggdrasil -genconf').toString();
};
const getReplacements = (seed) => {
    if (fs_1.default.existsSync(jsonPath)) {
        console.log('Existing replacements for yggdrasil found');
        return JSON.parse(fs_1.default.readFileSync(jsonPath, 'utf8'));
    }
    const hash = tweetnacl_1.default.hash(Buffer.from(seed)).slice(0, 32);
    const signKeyPair = tweetnacl_1.default.sign.keyPair.fromSeed(hash);
    const encryptionKeyPair = tweetnacl_1.default.box.keyPair.fromSecretKey(hash);
    return {
        signingPublicKey: encryptionService_1.encodeHex(signKeyPair.publicKey),
        signingPrivateKey: encryptionService_1.encodeHex(signKeyPair.secretKey),
        encryptionPublicKey: encryptionService_1.encodeHex(encryptionKeyPair.publicKey),
        encryptionPrivateKey: encryptionService_1.encodeHex(encryptionKeyPair.secretKey),
    };
};
const saveConfigs = (conf, replacements) => {
    fs_1.default.writeFileSync(configPath, conf);
    fs_1.default.writeFileSync(jsonPath, JSON.stringify(replacements));
};
const runYggdrasil = () => {
    const out = fs_1.default.openSync('/var/log/yggdrasil/out.log', 'a');
    const err = fs_1.default.openSync('/var/log/yggdrasil/err.log', 'a');
    const p = child_process_1.spawn('yggdrasil', ["-useconffile", configPath, "-logto", "/var/log/yggdrasil/yggdrasil.log"], {
        detached: true,
        stdio: ['ignore', out, err]
    });
    p.unref();
};
const initYggdrasil = () => {
    if (!fs_1.default.existsSync(configPath))
        return;
    console.log('Yggdrasil initialized');
    exports.isInitialized = true;
    return;
};
exports.initYggdrasil = initYggdrasil;
const setupYggdrasil = (seed) => __awaiter(void 0, void 0, void 0, function* () {
    const chatSeed = `${seed}-chat`;
    const replacements = getReplacements(chatSeed);
    console.log('Replacing yggdrasil config with: ', replacements);
    const generatedConfig = generateConfig();
    const config = replaceValues(generatedConfig, replacements);
    saveConfigs(config, replacements);
    runYggdrasil();
});
exports.setupYggdrasil = setupYggdrasil;

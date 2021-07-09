# Digitaltwin

Digitaltinw provides
    - your own digital avatar (identity server)
    - private file browser
    - chatting
    - publishing platform  for wikis and websites

To run digitaltwin we must have at least one website. [The digitaltwin frontend](https://github.com/threefoldfoundation/www_threefold_twin)

## Installation

- Install [publishtools](https://info.threefold.io/info/publishtools#/publishtools__install)
- we need to run `publishtools` command from a directory containing a config file `sites.json`. if you don't have this config file create a new one with the following content ([The digitaltwin frontend](https://github.com/threefoldfoundation/www_threefold_twin))

    ```
    [{
                    "name": "www_threefold_twin",
                    "url":  "https://github.com/threefoldfoundation/www_threefold_twin",
                    "branch":       "",
                    "pull": false,
                    "reset":        false,
                    "cat":  2,
                    "shortname":    "twin",
                    "path_code":    "",
                    "domains":      ["mydigitaltwin.io", "www.mydigitaltwin.io"],
                    "descr":        "you digital life",
                    "groups":       [],
                    "acl":  [],
                    "trackingid":   "",
                    "opengraph":    {
                            "title":        "",
                            "description":  "",
                            "url":  "",
                            "type_":        "article",
                            "image":        "",
                            "image_width":  "1200",
                            "image_height": "630"
                    }
            }]
    ```

- `publishtools install` Init publishtools 
- `publishtools build --pathprefix` build the `www_threefold_twin` or the `digitaltwin` frontend website
- By default the publisher will serve websites from `~/.publisher/publish` directory that says that when u build a website/wiki, the build will be saved in this direcoty.
- `publishtools publish_config_save` Save the config file you are using in `~/.publisher/sites.json`

# Run Digitaltwin
- `node server` dev mode
- `NODE_ENV=production SERET=mysecret  THREEBOT_PHRASE="my threebot phrase" node server` production without ssl handling (ssl offloading)
- `NODE_ENV=production SERET=mysecret ENABLE_SSL=true THREEBOT_PHRASE="my threebot phrase" node server` production with (ssl)

# Run from publishtools
- `publishtools digitaltwin -d start` dev mode
- `publishtools digitaltwin start` production mode

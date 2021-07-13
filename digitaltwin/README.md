## Digital twin application.

This will give you the tools to take back the ownership of your digital self.
In a first phase you will be able to communicate safely and peer2peer with other people in the ThreeFold Network through a chat implementation.
In later phases, file management, video group chats, and wiki will be integrated.

# Required env variables

export HOST_IP={PUBLIC_IP}
export SECRET={secret}

to run node we need to run

`NODE_ENV=production node server` as root

## Contribute

You can use the documentation inside the ./dev folder in order to setup a local dev environment


## Running the digitaltwin locally
- chmod +x ./start.sh
- ./start.sh

## Clearing the chat history/data
- chmod +x ./clear.sh
- ./clear.sh


## hosts file

Add the following records to your hosts file

```
127.0.0.1  bob.digitaltwin.jimbertesting.be
127.0.0.1  alice.digitaltwin.jimbertesting.be
# 127.0.0.1  digitaltwin.jimbertesting.be # Optional if you want to see the login screen of the digitaltwin.
```

## URLs
- https://bob.digitaltwin.jimbertesting.be/chat
- https://alice.digitaltwin.jimbertesting.be/chat
#!/bin/sh

echo "Hoodycode state is being reset.  This probably doesn't work while VS Code is running."

# Reset the secrets:
sqlite3 ~/Library/Application\ Support/Code/User/globalStorage/state.vscdb \
"DELETE FROM ItemTable WHERE \
    key = 'hoodycode.hoody-code' OR \
    key LIKE 'workbench.view.extension.hoody-code%' OR \
    key LIKE 'secret://{\"extensionId\":\"hoodycode.hoody-code\",%';"

# delete all hoodycode state files:
rm -rf ~/Library/Application\ Support/Code/User/globalStorage/hoodycode.hoody-code/

# clear some of the vscode cache that I've observed contains hoodycode related entries:
rm -f ~/Library/Application\ Support/Code/CachedProfilesData/__default__profile__/extensions.user.cache

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const gitmoji_1 = require("./gitmoji");
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.showGitmoji', (uri) => {
        const git = getGitExtension();
        if (!git) {
            vscode.window.showErrorMessage('Unable to load Git Extension');
            return;
        }
        let addCustomEmoji = vscode.workspace.getConfiguration().get('gitmoji.addCustomEmoji') || [];
        const showEmojiCode = vscode.workspace.getConfiguration().get('gitmoji.showEmojiCode');
        let emojis = [];
        let onlyUseCustomEmoji = vscode.workspace.getConfiguration().get('gitmoji.onlyUseCustomEmoji');
        if (onlyUseCustomEmoji === true) {
            emojis = [...addCustomEmoji];
        }
        else {
            emojis = [...gitmoji_1.default, ...addCustomEmoji];
        }
        const items = emojis.map(emojiObj => {
            const { description, code, emoji } = emojiObj;
            const displayCode = showEmojiCode ? code : '';
            const label = `${emoji} ${description} ${displayCode}`;
            return {
                label,
                code,
                emoji,
            };
        });
        vscode.window.showQuickPick(items).then(function (selected) {
            var _a;
            if (selected) {
                vscode.commands.executeCommand('workbench.view.scm');
                let outputType = vscode.workspace.getConfiguration().get('gitmoji.outputType');
                if (uri) {
                    const uriPath = ((_a = uri._rootUri) === null || _a === void 0 ? void 0 : _a.path) || uri.rootUri.path;
                    let selectedRepository = git.repositories.find(repository => {
                        return repository.rootUri.path === uriPath;
                    });
                    if (selectedRepository) {
                        if (outputType === 'emoji') {
                            prefixCommit(selectedRepository, selected.emoji);
                        }
                        else {
                            prefixCommit(selectedRepository, selected.code);
                        }
                    }
                }
                else {
                    for (let repo of git.repositories) {
                        if (outputType === 'emoji') {
                            prefixCommit(repo, selected.emoji);
                        }
                        else {
                            prefixCommit(repo, selected.code);
                        }
                    }
                }
            }
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function prefixCommit(repository, prefix) {
    repository.inputBox.value = `${prefix} ${repository.inputBox.value}`;
}
function getGitExtension() {
    const vscodeGit = vscode.extensions.getExtension('vscode.git');
    const gitExtension = vscodeGit && vscodeGit.exports;
    return gitExtension && gitExtension.getAPI(1);
}
function deactivate() { }
exports.deactivate = deactivate;

// The module 'vscode' contains the VS Code extensibility API
const vscode = require('vscode')
const path = require('path')
var exec = require('child_process').exec

const error = err => {
    vscode.window.showErrorMessage(err)
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.mdpic2github', function () {
        
        let editor = vscode.window.activeTextEditor
        
        // No open  file
        if (!editor) {
            vscode.window.showInformationMessage('No open file.')
            return
        }
        // Must be markdown file
        let doc = editor.document
        if (!(doc.languageId === "markdown")) {
            vscode.window.showInformationMessage('Must be a markdown file.')
            return
        }
        let localFolder = vscode.workspace.getConfiguration('pic2github').get('local_git_folder')
        let remoteRepo = vscode.workspace.getConfiguration('pic2github').get('remote_github_repo')
        if (localFolder == "" || remoteRepo == "") {
            vscode.window.showInformationMessage('Please fill the configuration first.')
            return
        }
        vscode.window.showOpenDialog({
            filters: { 'Images': ['png', 'jpg', 'gif', 'bmp'] }
        }).then(result => {
            if (result) {
                // 解构
                let {fsPath} = result[0]
                let imgName = fsPath.split(path.sep).pop()
                let cmdStr = 'cp ' + fsPath + ' ' + localFolder + ' && ' + 
                'cd ' + localFolder + ' && ' +
                'git add ' + imgName + ' && ' +
                'git commit -m ' + doc.fileName.split(path.sep).pop() + ' && ' +
                'git push'
                console.log(cmdStr)
                exec(cmdStr, function(err, stdout, stderr) {
                    if (err) {
                        console.log('wrong:' + stderr)
                    } else {
                        let data = stdout
                        console.log(data)
                    }
                })
                let imgUrl = '![](https://raw.githubusercontent.com/' + remoteRepo +'/master/'+ imgName + ')'
                editor.edit(textEditorEdit => {
                    textEditorEdit.insert(editor.selection.active, imgUrl)
                })
            }
        }, error)
        
    });
        

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
console.log('Blink Buddy extension is loading...');
const vscode = __importStar(require("vscode"));
console.log('Extension is activating');
let blinkInterval;
let statusBarItem;
function activate(context) {
    console.log('Blink Buddy is now active!');
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    context.subscriptions.push(statusBarItem);
    const startBlinkReminder = vscode.commands.registerCommand('blink-buddy.startReminder', () => {
        if (blinkInterval) {
            clearInterval(blinkInterval);
        }
        const intervalInMinutes = vscode.workspace.getConfiguration('blink-buddy').get('reminderInterval', 20);
        const pauseDurationInSeconds = vscode.workspace.getConfiguration('blink-buddy').get('pauseDuration', 5);
        blinkInterval = setInterval(() => {
            vscode.window.showInformationMessage(`Time to blink! Take a ${pauseDurationInSeconds}-second break.`);
            let remainingTime = pauseDurationInSeconds;
            const countdownInterval = setInterval(() => {
                remainingTime--;
                statusBarItem.text = `Eye break: ${remainingTime}s remaining`;
                statusBarItem.show();
                if (remainingTime <= 0) {
                    clearInterval(countdownInterval);
                    statusBarItem.hide();
                }
            }, 1000);
        }, intervalInMinutes * 60 * 1000);
        vscode.window.showInformationMessage(`Eye Blinker started. Reminders every ${intervalInMinutes} minutes.`);
    });
    const stopBlinkReminder = vscode.commands.registerCommand('blink-buddy.stopReminder', () => {
        if (blinkInterval) {
            clearInterval(blinkInterval);
            blinkInterval = undefined;
            statusBarItem.hide();
            vscode.window.showInformationMessage('Eye Blinker stopped.');
        }
    });
    context.subscriptions.push(startBlinkReminder, stopBlinkReminder);
}
function deactivate() {
    if (blinkInterval) {
        clearInterval(blinkInterval);
    }
    statusBarItem.dispose();
}
//# sourceMappingURL=extension.js.map
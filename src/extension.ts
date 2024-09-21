console.log('Blink Buddy extension is loading...');

import * as vscode from 'vscode';

console.log('Extension is activating');

let blinkInterval: NodeJS.Timeout | undefined;
let statusBarItem: vscode.StatusBarItem;
let reminderPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('Blink Buddy is now active with 20-second interval!');

	// Unregister existing commands if they exist
	vscode.commands.getCommands(true).then((commands) => {
		if (commands.includes('blink-buddy.startReminder')) {
			vscode.commands.executeCommand('workbench.action.reloadWindow');
		}
	});

	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	context.subscriptions.push(statusBarItem);

	const startBlinkReminder = vscode.commands.registerCommand('blink-buddy.startReminder', () => {
		if (blinkInterval) {
			clearInterval(blinkInterval);
		}

		// Hardcoded 20 seconds interval for testing
		const intervalInSeconds = 20;
		const pauseDurationInSeconds = vscode.workspace.getConfiguration('blink-buddy').get('pauseDuration', 5);

		blinkInterval = setInterval(() => {
			if (!reminderPanel) {
				showReminderModal(pauseDurationInSeconds);
			}
		}, intervalInSeconds * 1000);

		vscode.window.showInformationMessage(`Blink Buddy started. Reminders every ${intervalInSeconds} seconds (testing mode).`);
	});

	const stopBlinkReminder = vscode.commands.registerCommand('blink-buddy.stopReminder', () => {
		if (blinkInterval) {
			clearInterval(blinkInterval);
			blinkInterval = undefined;
			statusBarItem.hide();
			vscode.window.showInformationMessage('Blink Buddy stopped.');
		}
	});

	context.subscriptions.push(startBlinkReminder, stopBlinkReminder);
}

function showReminderModal(duration: number) {
	if (reminderPanel) {
		reminderPanel.dispose();
	}

	reminderPanel = vscode.window.createWebviewPanel(
		'blinkBuddyReminder',
		'Blink Buddy Reminder',
		vscode.ViewColumn.Two,
		{
			enableScripts: true,
			retainContextWhenHidden: true
		}
	);

	reminderPanel.webview.html = getReminderHtml(duration);

	reminderPanel.onDidDispose(() => {
		reminderPanel = undefined;
	});
}

function getReminderHtml(duration: number): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Break Time</title>
            <style>
                body, html {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    background-color: #f5f5f5;
                    color: #333;
                    line-height: 1.6;
                }
                .reminder {
                    max-width: 400px;
                    margin: 0 auto;
                    padding: 1rem;
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    box-sizing: border-box;
                    overflow-y: auto;
                }
                h1 {
                    font-size: 24px;
                    font-weight: 600;
                    color: #2c3e50;
                    margin: 0.5rem 0;
                    text-align: center;
                }
                .timer-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: 1rem 0;
                }
                .timer-circle {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background-color: #f0f0f0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                }
                .timer-circle::before {
                    content: '';
                    position: absolute;
                    top: 5px;
                    left: 5px;
                    right: 5px;
                    bottom: 5px;
                    border-radius: 50%;
                    border: 3px solid #e0e0e0;
                }
                #timer {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2c3e50;
                }
                .activity-instruction {
                    font-size: 18px;
                    color: #34495e;
                    text-align: center;
                    margin: 1rem 0;
                    font-weight: 500;
                }
                .activities {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }
                .activity {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 1rem;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    transition: background-color 0.3s ease;
                    cursor: pointer;
                    text-align: center;
                }
                .activity:hover {
                    background-color: #e9ecef;
                }
                .activity-icon {
                    width: 40px;
                    height: 40px;
                    margin-bottom: 0.5rem;
                }
                .eye-icon {
                    width: 40px;
                    height: 40px;
                }
                .activity-label {
                    font-size: 16px;
                    font-weight: 500;
                    margin-bottom: 0.25rem;
                }
                .activity-instruction {
                    font-size: 12px;
                    color: #6c757d;
                    margin-top: 0.25rem;
                    line-height: 1.2;
                }
                .add-more {
                    display: block;
                    text-align: center;
                    color: #3498db;
                    text-decoration: none;
                    margin-top: 0.5rem;
                    font-weight: 500;
                    font-size: 14px;
                }
                #motivationalMessage {
                    font-style: italic;
                    color: #7f8c8d;
                    text-align: center;
                    margin-top: 0.5rem;
                    font-size: 14px;
                }
                .back-to-work {
                    display: block;
                    width: 100%;
                    padding: 10px;
                    background-color: #3498db;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    margin-top: 1rem;
                    transition: background-color 0.3s ease;
                }
                .back-to-work:hover {
                    background-color: #2980b9;
                }
                @media (max-height: 600px) {
                    .reminder {
                        justify-content: flex-start;
                    }
                    h1 {
                        font-size: 20px;
                    }
                    .timer-circle {
                        width: 80px;
                        height: 80px;
                    }
                    #timer {
                        font-size: 20px;
                    }
                    .activity-instruction {
                        font-size: 16px;
                        margin: 0.5rem 0;
                    }
                    .activities {
                        grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
                    }
                    .activity-icon {
                        width: 25px;
                        height: 25px;
                    }
                    .activity-label {
                        font-size: 10px;
                    }
                    .back-to-work {
                        padding: 8px;
                        font-size: 14px;
                        margin-top: 0.5rem;
                    }
                }
                @keyframes moveEyeball {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(2px, -2px); }
                    50% { transform: translate(0, 2px); }
                    75% { transform: translate(-2px, -2px); }
                }
                
                .eye-icon {
                    width: 40px;
                    height: 40px;
                }
                
                .eye-outline {
                    fill: none;
                    stroke: #FF9800;
                    stroke-width: 1.5;
                }
                
                .eyeball {
                    fill: #FF9800;
                    animation: moveEyeball 2s ease-in-out infinite;
                }
                
                .stretch-icon {
                    fill: #8E24AA;
                }
                .water-tracker {
                    margin-top: 1rem;
                    text-align: center;
                }
                .water-glasses {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }
                .water-glass {
                    width: 30px;
                    height: 40px;
                    cursor: pointer;
                    transition: fill 0.3s ease;
                }
                .water-glass.filled path {
                    fill: #2196F3;
                }
            </style>
        </head>
        <body>
            <div class="reminder">
                <h1>Time for a Break!</h1>
                <div class="timer-container">
                    <div class="timer-circle">
                        <div id="timer">0:00</div>
                    </div>
                </div>
                <p class="activity-instruction">Complete all activities for a quick refresh:</p>
                <div class="activities">
                    <div class="activity">
                        <svg class="activity-icon eye-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path class="eye-outline" d="M12 5.25C7.5 5.25 3.75 8.25 2.25 12C3.75 15.75 7.5 18.75 12 18.75C16.5 18.75 20.25 15.75 21.75 12C20.25 8.25 16.5 5.25 12 5.25Z" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle class="eyeball" cx="12" cy="12" r="3" />
                        </svg>
                        <span class="activity-label">Blink</span>
                        <p class="activity-instruction">Look at something 20 feet away for 20 seconds</p>
                    </div>
                    <div class="activity">
                        <svg class="activity-icon stretch-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <path d="M54.875 65.715l8.1211-0.80859c2.0547-0.20312 3.9805-1.0977 5.4609-2.5391l0.14844-0.14063c2.6406-2.5664 3.4844-6.4727 2.1328-9.9023-1.5625-3.9688-3.7344-9.4648-4.918-12.469-0.66406-1.6875-1.7891-3.1562-3.2422-4.2383l-16.223-12.074 5.6133-7.0508c2.1602-2.7148 1.7227-6.6641-0.98438-8.8398l-0.003906-0.003906c-1.3242-1.0625-3.0156-1.5508-4.6992-1.3516-1.6836 0.19531-3.2148 1.0586-4.2578 2.3945l-9.0234 11.602c-2.2227 2.8633-1.7461 6.9766 1.0781 9.25l8.4023 6.7578-10.484 17.852c-0.37109 0.63672-0.66406 1.3203-0.86328 2.0312-1.1094 3.9297-5.6602 20.105-8.2305 29.234-0.55859 1.9727-0.15625 4.0977 1.082 5.7344 1.2422 1.6367 3.1758 2.5977 5.2266 2.5977h0.007812c2.9531 0 5.5391-1.9766 6.3164-4.8242l5.3164-19.531 5.7773 19.457c0.82812 2.7969 3.3984 4.7148 6.3125 4.7148h0.52344c2.0312 0 3.9492-0.9375 5.1992-2.5391 1.2461-1.6055 1.6836-3.6914 1.1836-5.6602z"/>
                        </svg>
                        <span class="activity-label">Stretch</span>
                        <p class="activity-instruction">Do some stretches for 30 seconds</p>
                    </div>
                    <div class="activity">
                        <svg class="activity-icon" width="24" height="24" viewBox="0 0 26.458 33.0725" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.079 1.323c-1.311 0-2.377 1.066-2.377 2.377 0 1.32 1.067 2.377 2.377 2.377 1.32 0 2.388-1.058 2.388-2.377 0-1.311-1.069-2.377-2.388-2.377zm-1.377 5.456c-2.029 0-4.293 1.424-5.303 3.048-.704 1.17-.769 2.494-.763 4.316-.006.52.415.945.936.944.52-.002.94-.429.93-.95-.005-1.761.097-2.685.496-3.348.305-.507.87-.998 1.933-1.62-.332 1.536-.637 3.075-.947 4.605 1.477 3.51 2.954 7.018 4.432 10.527.278.69 1.068 1.018 1.753.73.686-.289 1.002-1.083.704-1.764l-3.565-8.468.454-1.895.332-1.387c.953 1.73 3.165 2.199 4.68 2.558.505.127 1.016-.185 1.135-.691.12-.507-.199-1.013-.708-1.125-1.725-.409-2.6-.723-3.153-1.265-.289-.283-.57-.678-.788-1.286-.219-.608-.321-1.28-.515-1.88l-.002-.006v.001c-.407-1.05-1.141-1.044-2.052-1.047zm-3.009 8.386l-.904 4.48-2.067 3.456c-.39.633-.188 1.463.45 1.845.638.382 1.466.168 1.838-.476l2.25-3.76c.119-.2.184-.427.188-.66l.005-.704c-.587-1.394-1.173-2.788-1.76-4.181z" fill="#FF5722"/>
                        </svg>
                        <span class="activity-label">Walk</span>
                        <p class="activity-instruction">Take a short 30-second walk</p>
                    </div>
                </div>
                <a href="#" class="add-more">+ Add More Activities and Custom Reminders</a>
                <div class="water-tracker">
                    <h2>Stay Hydrated!</h2>
                    <div class="water-glasses">
                        ${Array(8).fill(null).map((_, i) => `
                            <svg class="water-glass" data-index="${i}" width="30" height="40" viewBox="0 0 64.002 64.002" xmlns="http://www.w3.org/2000/svg">
                                <g transform="translate(10.878 4.295)">
                                    <path d="M1.66,1.657,6.351,54.409H35.668L40.359,1.657H1.66M1.66-.6h38.7a2.254,2.254,0,0,1,2.248,2.452L37.916,54.609a2.255,2.255,0,0,1-2.248,2.054H6.351A2.255,2.255,0,0,1,4.1,54.609L-.587,1.856A2.254,2.254,0,0,1,1.66-.6Z" transform="translate(0.596 0.596)" fill="#000"/>
                                </g>
                                <g transform="translate(19.076 47.399)">
                                    <path d="M.67,9.31a17.048,17.048,0,0,1,9.309-1.3c4.872.851,4.4,2.341,9.436,2.913a12.627,12.627,0,0,0,8.128-1.555l-.677,8.151H1.4Z" transform="translate(-0.67 -7.81)" fill="#000"/>
                                </g>
                            </svg>
                        `).join('')}
                    </div>
                    <p>Tap a glass to log your water intake. Aim for 8 glasses a day!</p>
                </div>
                <p id="motivationalMessage">Stay hydrated, stay focused!</p>
                <button class="back-to-work">Back to Work</button>
            </div>
            <script>
                let seconds = 0;
                const timerElement = document.getElementById('timer');

                function updateTimer() {
                    const minutes = Math.floor(seconds / 60);
                    const remainingSeconds = seconds % 60;
                    timerElement.textContent = \`\${minutes}:\${remainingSeconds.toString().padStart(2, '0')}\`;
                    seconds++;
                    setTimeout(updateTimer, 1000);
                }

                updateTimer();

                // Water tracking functionality
                const waterGlasses = document.querySelectorAll('.water-glass');
                waterGlasses.forEach(glass => {
                    glass.addEventListener('click', function() {
                        const index = parseInt(this.getAttribute('data-index'));
                        for (let i = 0; i <= index; i++) {
                            waterGlasses[i].classList.add('filled');
                        }
                        for (let i = index + 1; i < waterGlasses.length; i++) {
                            waterGlasses[i].classList.remove('filled');
                        }
                    });
                });

                document.querySelector('.back-to-work').addEventListener('click', function() {
                    // Send a message to the extension to close the webview
                    vscode.postMessage({ command: 'closeWebview' });
                });
            </script>
        </body>
        </html>
    `;
}

export function deactivate() {
	if (blinkInterval) {
		clearInterval(blinkInterval);
	}
	statusBarItem.dispose();
	if (reminderPanel) {
		reminderPanel.dispose();
	}
}

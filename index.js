const { BrowserWindow, app } = require('electron');

// use --disable-frame-rate-limit and --disable-gpu-vsync
// app.commandLine.appendSwitch('disable-frame-rate-limit');
// app.commandLine.appendSwitch('disable-gpu-vsync');

app.on('ready', () => {

    const win = new BrowserWindow({
		width: 720,
		height: 1280,
		resizable: true,
		frame: true,
		// backgroundColor: "transparent",
		// icon: './res/icons/gyro.ico',
		transparent: false,
		minHeight: 320,
		minWidth: 425,
		autoHideMenuBar: true,
		webPreferences: {
			devTools: true,
			nodeIntegration: true
		}
	});
	
    win.loadFile('./src/app.html');
});

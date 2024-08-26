const { execFile } = require('child_process');

module.exports = (lat, lng) => {
    return new Promise((resolve, reject) => {
        const command = 'C:\\Users\\jarol\\PycharmProjects\\streetlevelproject\\.venv\\Scripts\\python.exe';
        const args = ['functions/find_panorama.py', lat, lng];

        execFile(command, args, (error, stdout, stderr) => {
            if (error || stderr) {
                return reject(`Error: ${error || stderr}`);
            }

            try {
                const latestPano = JSON.parse(stdout.trim());
                console.log(latestPano);
                resolve(latestPano);
            } catch (parseError) {
                reject(`Error parsing JSON: ${parseError}`);
            }
        });
    });
};
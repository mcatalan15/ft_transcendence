import { exec as execOriginal } from 'child_process';

// Custom exec function wrapper
export const exec = (command) => {
  return new Promise((resolve, reject) => {
    execOriginal(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Error executing command: ${error.message}`));
      } else if (stderr) {
        reject(new Error(`stderr: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });
  });
};
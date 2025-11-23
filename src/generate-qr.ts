import fs from 'fs';
import yaml from 'js-yaml';
import QRCode from 'qrcode';
import path from 'path';

const dataPath = path.join(process.cwd(), 'public/data/cv-data.yaml');
const outputDir = path.join(process.cwd(), 'public/images');
const outputPath = path.join(outputDir, 'qr-code.png');

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

try {
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  const data: any = yaml.load(fileContents);
  
  if (data.basics && data.basics.latestVersionUrl) {
    QRCode.toFile(outputPath, data.basics.latestVersionUrl, {
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }, (err) => {
      if (err) throw err;
      console.log('QR code generated successfully at ' + outputPath);
    });
  } else {
    console.log('No latestVersionUrl found in cv-data.yaml');
  }
} catch (e) {
  console.error(e);
  process.exit(1);
}
